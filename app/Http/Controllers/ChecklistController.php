<?php

namespace App\Http\Controllers;

use App\Models\ChecklistTemplate;
use App\Models\ChecklistItem;
use App\Models\MaintenanceRecord;
use App\Models\MaintenancePhoto;
use App\Models\MaintenanceApproval;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class ChecklistController extends Controller
{
    /**
     * Get all checklist templates (Admin)
     */
    public function getTemplates(Request $request): JsonResponse
    {
        $templates = ChecklistTemplate::with('items')->get();

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    /**
     * Get templates by category (Admin)
     */
    public function getTemplatesByCategory(Request $request, string $category): JsonResponse
    {
        $templates = ChecklistTemplate::with('items')
            ->where('category', $category)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    /**
     * Get active templates by category (Employee)
     */
    public function getActiveTemplatesByCategory(Request $request, string $category): JsonResponse
    {
        $templates = ChecklistTemplate::with('items')
            ->where('category', $category)
            ->where('is_active', true)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    /**
     * Get single template
     */
    public function getTemplate(Request $request, int $id): JsonResponse
    {
        $template = ChecklistTemplate::with('items')->find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $template
        ]);
    }

    /**
     * Create checklist template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category' => 'required|in:printer,switch,vvip,pc_desktop,access_point',
            'device_fields' => 'required|array',
            'configuration_items' => 'required|array',
            'special_fields' => 'nullable|array',
            'items' => 'required|array',
            'items.*.title' => 'required|string',
            'items.*.columns' => 'required|array',
            'items.*.items' => 'required|array',
            'items.*.order' => 'required|integer',
            'items.*.items.*.merge_columns' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create template
        // Generate name from category if not provided
        $categoryNames = [
            'printer' => 'Printer',
            'switch' => 'Switch',
            'vvip' => 'VVIP',
            'pc_desktop' => 'PC/Desktop',
            'access_point' => 'Access Point'
        ];
        $templateName = $request->name ?? ($categoryNames[$request->category] ?? ucfirst($request->category));

        $template = ChecklistTemplate::create([
            'category' => $request->category,
            'name' => $templateName,
            'device_fields' => $request->device_fields,
            'configuration_items' => $request->configuration_items,
            'special_fields' => $request->special_fields ?? [],
            'is_active' => $request->is_active ?? false,
        ]);

        // Create checklist items
        if (isset($request->items)) {
            foreach ($request->items as $item) {
                ChecklistItem::create([
                    'checklist_template_id' => $template->id,
                    'title' => $item['title'],
                    'columns' => $item['columns'],
                    'items' => $item['items'], // merge_columns already included in items JSON array
                    'order' => $item['order'],
                ]);
            }
        }

        $template->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Template created successfully',
            'data' => $template
        ], 201);
    }

    /**
     * Update checklist template
     */
    public function updateTemplate(Request $request, int $id): JsonResponse
    {
        $template = ChecklistTemplate::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category' => 'sometimes|in:printer,switch,vvip,pc_desktop,access_point',
            'device_fields' => 'sometimes|array',
            'configuration_items' => 'sometimes|array',
            'special_fields' => 'sometimes|array',
            'items' => 'sometimes|array',
            'items.*.title' => 'required_with:items|string',
            'items.*.columns' => 'required_with:items|array',
            'items.*.items' => 'required_with:items|array',
            'items.*.order' => 'required_with:items|integer',
            'items.*.items.*.merge_columns' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update template
        // Generate name from category if category is being updated and name is not provided
        $updateData = [];
        if ($request->has('category') && !$request->has('name')) {
            $categoryNames = [
                'printer' => 'Printer',
                'switch' => 'Switch',
                'vvip' => 'VVIP',
                'pc_desktop' => 'PC/Desktop',
                'access_point' => 'Access Point'
            ];
            $updateData['name'] = $categoryNames[$request->category] ?? ucfirst($request->category);
        }

        $baseUpdateData = [
            'device_fields',
            'configuration_items',
            'special_fields',
            'is_active'
        ];

        if ($request->has('category')) {
            $baseUpdateData[] = 'category';
        }

        $dataToUpdate = array_intersect_key($request->all(), array_flip($baseUpdateData));
        $dataToUpdate = array_merge($updateData, $dataToUpdate);
        $template->update($dataToUpdate);

        // Update items if provided
        if (isset($request->items)) {
            // Delete existing items
            ChecklistItem::where('checklist_template_id', $template->id)->delete();

            // Create new items
            foreach ($request->items as $item) {
                ChecklistItem::create([
                    'checklist_template_id' => $template->id,
                    'title' => $item['title'],
                    'columns' => $item['columns'],
                    'items' => $item['items'], // merge_columns already included in items JSON array
                    'order' => $item['order'],
                ]);
            }
        }

        $template->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Template updated successfully',
            'data' => $template
        ]);
    }

    /**
     * Delete checklist template
     */
    public function deleteTemplate(Request $request, int $id): JsonResponse
    {
        $template = ChecklistTemplate::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully'
        ]);
    }

    /**
     * Duplicate checklist template
     */
    public function duplicateTemplate(Request $request, int $id): JsonResponse
    {
        $template = ChecklistTemplate::with('items')->find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        $baseName = $template->name;
        $baseDeviceName = $template->device_fields['device'] ?? '';

        $baseName = preg_replace('/ \(Copy[0-9]*\)$/', '', $baseName);
        $baseDeviceName = preg_replace('/ \(Copy[0-9]*\)$/', '', $baseDeviceName);

        $newSuffix = ' (Copy)';
        $newName = $baseName . $newSuffix;
        $counter = 1;

        while (ChecklistTemplate::where('name', $newName)->exists()) {
            $newSuffix = " (Copy{$counter})";
            $newName = $baseName . $newSuffix;
            $counter++;
        }

        $newDeviceFields = $template->device_fields;
        $newDeviceFields['device'] = $baseDeviceName . $newSuffix;

        $newTemplate = ChecklistTemplate::create([
            'category' => $template->category,
            'name' => $newName, 
            'device_fields' => $newDeviceFields,
            'configuration_items' => $template->configuration_items,
            'special_fields' => $template->special_fields,
            'is_active' => false,
        ]);

        foreach ($template->items as $item) {
            ChecklistItem::create([
                'checklist_template_id' => $newTemplate->id,
                'title' => $item->title,
                'columns' => $item->columns,
                'items' => $item->items,
                'order' => $item->order,
            ]);
        }

        $newTemplate->load('items');

        return response()->json([
            'success' => true,
            'message' => 'Template duplicated successfully',
            'data' => $newTemplate
        ], 201);
    }

    /**
     * Get all maintenance records (Admin) - Only accepted records
     */
    public function getMaintenanceRecords(Request $request): JsonResponse
    {
        $category = $request->query('category');

        $query = MaintenanceRecord::with(['template', 'employee', 'photos', 'approvals.admin'])
            ->where('status', 'accepted');

        // Filter by category from record, not template (independent from template)
        if ($category) {
            $query->where('category', $category);
        }

        $records = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }

    /**
     * Get pending maintenance records by category (Admin)
     */
    public function getPendingRecords(Request $request, string $category): JsonResponse
    {
        $records = MaintenanceRecord::with(['template', 'employee', 'photos'])
            ->where('category', $category) // Filter by category from record, not template
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }

    /**
     * Get rejected maintenance records by category (Admin)
     */
    public function getRejectedRecords(Request $request, string $category): JsonResponse
    {
        $records = MaintenanceRecord::with(['template', 'employee', 'photos', 'approvals.admin'])
            ->where('category', $category) // Filter by category from record, not template
            ->where('status', 'rejected')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }

    /**
     * Accept maintenance record
     */
    public function acceptRecord(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $record = MaintenanceRecord::with(['template.items', 'employee', 'photos'])->find($id);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found'
            ], 404);
        }

        if ($record->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Record is not pending for approval'
            ], 400);
        }

        try {
            // Get template data first (before generating PDF)
            $templateData = $this->getTemplateData($record);

            // Generate PDF with signatures
            $pdfPath = $this->generateAndSavePDF($record, $admin, $templateData);

            // Update record status and save PDF path (only update these specific fields)
            $record->update([
                'status' => 'accepted',
                'pdf_path' => $pdfPath,
            ]);

            // Create approval record
            MaintenanceApproval::create([
                'maintenance_record_id' => $record->id,
                'admin_id' => $admin->id,
                'action' => 'accepted',
                'notes' => $request->notes ?? null,
            ]);

            $record->load(['template', 'employee', 'photos', 'approvals.admin']);

            return response()->json([
                'success' => true,
                'message' => 'Record accepted successfully',
                'data' => $record
            ]);
        } catch (\Exception $e) {
            Log::error('Accept Record Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject maintenance record
     */
    public function rejectRecord(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $record = MaintenanceRecord::find($id);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found'
            ], 404);
        }

        if ($record->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Record is not pending for approval'
            ], 400);
        }

        try {
            // Update record status (NO PDF saved)
            $record->status = 'rejected';
            $record->save();

            // Create approval record
            MaintenanceApproval::create([
                'maintenance_record_id' => $record->id,
                'admin_id' => $admin->id,
                'action' => 'rejected',
                'notes' => $request->notes ?? null,
            ]);

            $record->load(['template', 'employee', 'photos', 'approvals.admin']);

            return response()->json([
                'success' => true,
                'message' => 'Record rejected successfully',
                'data' => $record
            ]);
        } catch (\Exception $e) {
            Log::error('Reject Record Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate and save PDF with signatures
     */
    private function generateAndSavePDF(MaintenanceRecord $record, User $admin, $templateData = null): string
    {
        try {
            // Get template data (from template or snapshot) if not provided
            if (!$templateData) {
                $templateData = $this->getTemplateData($record);
            }

            // Create a temporary record copy for PDF view (don't modify original record)
            $recordForPdf = clone $record;
            $recordForPdf->template = $templateData;

            // Format date to Indonesia format
            $formatter = new \IntlDateFormatter(
                'id_ID',
                \IntlDateFormatter::FULL,
                \IntlDateFormatter::NONE,
                'Asia/Jakarta',
                \IntlDateFormatter::GREGORIAN,
                'EEEE, d MMMM yyyy'
            );

            $dateFormatted = $formatter->format(new \DateTime($record->created_at));

            // Get storage URL for images
            $storageUrl = asset('storage/');

            // Generate checklist form page (Page 1) with signatures
            $checklistHtml = view('pdfs.checklist', [
                'record' => $recordForPdf,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
                'admin' => $admin,
                'showSignatures' => true,
            ])->render();

            // Generate device photo page (Page 2)
            $devicePhotoHtml = view('pdfs.device_photo', [
                'record' => $recordForPdf,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
                'admin' => $admin,
                'showSignatures' => true,
            ])->render();

            // Generate PIC proof page (Page 3)
            $picProofHtml = view('pdfs.pic_proof', [
                'record' => $recordForPdf,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
                'admin' => $admin,
                'showSignatures' => true,
            ])->render();

            // Combine all pages with proper page break style
            $fullHtml = '
        <html>
        <head>
            <style>
                .page-break {
                    page-break-after: always;
                    page-break-inside: avoid;
                    clear: both;
                }
            </style>
        </head>
        <body>
            ' . $checklistHtml . '
            <div class="page-break"></div>
            ' . $devicePhotoHtml . '
            <div class="page-break"></div>
            ' . $picProofHtml . '
        </body>
        </html>';

            // Generate PDF
            $pdf = Pdf::loadHTML($fullHtml);
            $pdf->setPaper('A4', 'portrait');
            $pdf->setOption('enable-local-file-access', true);
            $pdf->setOption('no-stop-slow-scripts', true);

            // Save PDF to storage
            $pdfPath = 'maintenance_pdfs/maintenance_record_' . $record->id . '_' . time() . '.pdf';
            Storage::disk('public')->put($pdfPath, $pdf->output());

            return $pdfPath;
        } catch (\Exception $e) {
            Log::error('PDF Save Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get employee's own maintenance records
     */
    public function getMyMaintenanceRecords(Request $request): JsonResponse
    {
        $employee = $request->user();

        $records = MaintenanceRecord::with(['template', 'photos'])
            ->where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }

    /**
     * Create maintenance record
     */
    public function createMaintenanceRecord(Request $request): JsonResponse
    {
        $employee = $request->user();

        // Decode JSON strings if needed
        $deviceData = $request->device_data;
        if (is_string($deviceData)) {
            $deviceData = json_decode($deviceData, true);
        }

        $checklistResponses = $request->checklist_responses;
        if (is_string($checklistResponses)) {
            $checklistResponses = json_decode($checklistResponses, true);
        }

        $stokTintaResponses = $request->stok_tinta_responses;
        if (is_string($stokTintaResponses)) {
            $stokTintaResponses = json_decode($stokTintaResponses, true);
        }


        $validator = Validator::make($request->all(), [
            'checklist_template_id' => 'required|exists:checklist_templates,id',
            'notes' => 'required|string',
            'device_photos' => 'required|array|min:1|max:2',
            'device_photos.*' => 'required|image|mimes:jpeg,png,jpg',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle multiple photo uploads (max 2)
        $photoPaths = [];
        if ($request->hasFile('device_photos')) {
            foreach ($request->file('device_photos') as $photo) {
                $photoPath = $photo->store('maintenance_photos', 'public');
                $photoPaths[] = $photoPath;
            }
        }
        // Use first photo as primary photo_path for backward compatibility
        $primaryPhotoPath = !empty($photoPaths) ? $photoPaths[0] : null;

        // Get template to save snapshot
        $template = ChecklistTemplate::with('items')->find($request->checklist_template_id);

        // Create maintenance record with category and template snapshot
        $record = MaintenanceRecord::create([
            'checklist_template_id' => $request->checklist_template_id,
            'category' => $template->category, // Store category directly
            'template_snapshot' => [ // Store template structure as snapshot
                'name' => $template->name,
                'category' => $template->category,
                'device_fields' => $template->device_fields,
                'configuration_items' => $template->configuration_items,
                'special_fields' => $template->special_fields,
                'items' => $template->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'title' => $item->title,
                        'columns' => $item->columns,
                        'items' => $item->items,
                        'order' => $item->order,
                    ];
                })->toArray(),
            ],
            'employee_id' => $employee->id,
            'device_data' => $deviceData,
            'checklist_responses' => $checklistResponses,
            'stok_tinta_responses' => $stokTintaResponses,
            'notes' => $request->notes,
            'photo_path' => $primaryPhotoPath,
            'status' => 'pending',
        ]);

        // Create device photo records for all uploaded photos
        foreach ($photoPaths as $photoPath) {
            MaintenancePhoto::create([
                'maintenance_record_id' => $record->id,
                'photo_type' => 'device',
                'photo_path' => $photoPath,
            ]);
        }

        // Create PIC proof photo (use employee identity photo if available)
        $picProofPath = null;
        if ($employee->identity_photo) {
            $picProofPath = $employee->identity_photo;
        } else {
            // Use first device photo as fallback
            $picProofPath = $primaryPhotoPath;
        }

        MaintenancePhoto::create([
            'maintenance_record_id' => $record->id,
            'photo_type' => 'pic_proof',
            'photo_path' => $picProofPath,
            'employee_data' => [
                'name' => $employee->name,
                'identity_photo' => $employee->identity_photo,
                'signature' => $employee->signature,
                'account_created_at' => $employee->created_at,
            ],
        ]);

        $record->load(['template', 'employee', 'photos']);

        return response()->json([
            'success' => true,
            'message' => 'Maintenance record created successfully',
            'data' => $record
        ], 201);
    }

    /**
     * Get template data (from template or snapshot)
     */
    private function getTemplateData(MaintenanceRecord $record)
    {
        // If template exists, use it
        if ($record->template) {
            return (object) [
                'name' => $record->template->name,
                'category' => $record->template->category,
                'device_fields' => $record->template->device_fields,
                'configuration_items' => $record->template->configuration_items,
                'special_fields' => $record->template->special_fields,
                'items' => $record->template->items->map(function ($item) {
                    return (object) [
                        'id' => $item->id,
                        'title' => $item->title,
                        'columns' => $item->columns,
                        'items' => $item->items,
                        'order' => $item->order,
                    ];
                }),
            ];
        }

        // Otherwise, use snapshot
        if ($record->template_snapshot) {
            $snapshot = $record->template_snapshot;
            return (object) [
                'name' => $snapshot['name'] ?? 'Unknown Template',
                'category' => $snapshot['category'] ?? $record->category,
                'device_fields' => $snapshot['device_fields'] ?? [],
                'configuration_items' => $snapshot['configuration_items'] ?? [],
                'special_fields' => $snapshot['special_fields'] ?? [],
                'items' => collect($snapshot['items'] ?? [])->map(function ($item) {
                    return (object) [
                        'id' => $item['id'] ?? null,
                        'title' => $item['title'] ?? '',
                        'columns' => $item['columns'] ?? [],
                        'items' => $item['items'] ?? [],
                        'order' => $item['order'] ?? 0,
                    ];
                }),
            ];
        }

        // Fallback if both don't exist
        return (object) [
            'name' => 'Unknown Template',
            'category' => $record->category ?? 'unknown',
            'device_fields' => [],
            'configuration_items' => [],
            'special_fields' => [],
            'items' => collect([]),
        ];
    }

    /**
     * Generate PDF for maintenance record (preview/download)
     */
    public function generatePDF(Request $request, int $id)
    {
        $record = MaintenanceRecord::with(['template.items', 'employee', 'photos', 'approvals.admin'])->find($id);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found'
            ], 404);
        }

        try {
            // If record is accepted and PDF exists, return saved PDF
            if ($record->status === 'accepted' && $record->pdf_path && Storage::disk('public')->exists($record->pdf_path)) {
                $pdfPath = Storage::disk('public')->path($record->pdf_path);
                return response()->download($pdfPath, 'maintenance_record_' . $record->id . '.pdf');
            }

            // Otherwise, generate PDF on-the-fly (for preview or rejected records)
            $admin = $record->status === 'accepted' && $record->approvals->where('action', 'accepted')->first()
                ? $record->approvals->where('action', 'accepted')->first()->admin
                : null;

            // Get template data (from template or snapshot)
            $templateData = $this->getTemplateData($record);

            // Create a temporary record copy for PDF view (don't modify original record)
            $recordForPdf = clone $record;
            $recordForPdf->template = $templateData;

            // Format date to Indonesia format
            $formatter = new \IntlDateFormatter(
                'id_ID',
                \IntlDateFormatter::FULL,
                \IntlDateFormatter::NONE,
                'Asia/Jakarta',
                \IntlDateFormatter::GREGORIAN,
                'EEEE, d MMMM yyyy'
            );

            $dateFormatted = $formatter->format(new \DateTime($record->created_at));

            // Get storage URL for images
            $storageUrl = asset('storage/');

            // Show signatures only if accepted
            $showSignatures = $record->status === 'accepted';

            // Generate checklist form page (Page 1)
            $checklistHtml = view('pdfs.checklist', [
                'record' => $recordForPdf,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
                'admin' => $admin,
                'showSignatures' => $showSignatures,
            ])->render();

            // Generate device photo page (Page 2)
            $devicePhotoHtml = view('pdfs.device_photo', [
                'record' => $recordForPdf,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
                'admin' => $admin,
                'showSignatures' => $showSignatures,
            ])->render();

            // Generate PIC proof page (Page 3)
            $picProofHtml = view('pdfs.pic_proof', [
                'record' => $recordForPdf,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
                'admin' => $admin,
                'showSignatures' => $showSignatures,
            ])->render();

            // Combine all pages with proper page break style
            $fullHtml = '
        <html>
        <head>
            <style>
                .page-break {
                    page-break-after: always;
                    page-break-inside: avoid;
                    clear: both;
                }
            </style>
        </head>
        <body>
            ' . $checklistHtml . '
            <div class="page-break"></div>
            ' . $devicePhotoHtml . '
            <div class="page-break"></div>
            ' . $picProofHtml . '
        </body>
        </html>';

            // Generate PDF with specific options
            $pdf = Pdf::loadHTML($fullHtml);
            $pdf->setPaper('A4', 'portrait');

            // Set options to prevent extra pages
            $pdf->setOption('enable-local-file-access', true);
            $pdf->setOption('no-stop-slow-scripts', true);

            // Return PDF response
            return $pdf->download('maintenance_record_' . $record->id . '.pdf');
        } catch (\Exception $e) {
            Log::error('PDF Generation Error: ' . $e->getMessage());
            Log::error('Stack Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Preview PDF (return as response for iframe/embed)
     */
    public function previewPDF(Request $request, int $id)
    {
        $record = MaintenanceRecord::with(['template.items', 'employee', 'photos', 'approvals.admin'])->find($id);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found'
            ], 404);
        }

        try {
            // If record is accepted and PDF exists, return saved PDF
            if ($record->status === 'accepted' && $record->pdf_path && Storage::disk('public')->exists($record->pdf_path)) {
                $pdfPath = Storage::disk('public')->path($record->pdf_path);
                return response()->file($pdfPath);
            }

            // Otherwise, generate PDF on-the-fly
            $admin = $record->status === 'accepted' && $record->approvals->where('action', 'accepted')->first()
                ? $record->approvals->where('action', 'accepted')->first()->admin
                : null;

            // Get template data (from template or snapshot)
            $templateData = $this->getTemplateData($record);

            // Create a temporary record copy for PDF view (don't modify original record)
            $recordForPdf = clone $record;
            $recordForPdf->template = $templateData;

            // Format date to Indonesia format
            $formatter = new \IntlDateFormatter(
                'id_ID',
                \IntlDateFormatter::FULL,
                \IntlDateFormatter::NONE,
                'Asia/Jakarta',
                \IntlDateFormatter::GREGORIAN,
                'EEEE, d MMMM yyyy'
            );

            $dateFormatted = $formatter->format(new \DateTime($record->created_at));
            $storageUrl = asset('storage/');
            $showSignatures = $record->status === 'accepted';

            // Generate all pages
            $checklistHtml = view('pdfs.checklist', [
                'record' => $recordForPdf,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
                'admin' => $admin,
                'showSignatures' => $showSignatures,
            ])->render();

            $devicePhotoHtml = view('pdfs.device_photo', [
                'record' => $recordForPdf,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
                'admin' => $admin,
                'showSignatures' => $showSignatures,
            ])->render();

            $picProofHtml = view('pdfs.pic_proof', [
                'record' => $recordForPdf,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
                'admin' => $admin,
                'showSignatures' => $showSignatures,
            ])->render();

            $fullHtml = '
        <html>
        <head>
            <style>
                .page-break {
                    page-break-after: always;
                    page-break-inside: avoid;
                    clear: both;
                }
            </style>
        </head>
        <body>
            ' . $checklistHtml . '
            <div class="page-break"></div>
            ' . $devicePhotoHtml . '
            <div class="page-break"></div>
            ' . $picProofHtml . '
        </body>
        </html>';

            $pdf = Pdf::loadHTML($fullHtml);
            $pdf->setPaper('A4', 'portrait');
            $pdf->setOption('enable-local-file-access', true);
            $pdf->setOption('no-stop-slow-scripts', true);

            return $pdf->stream('maintenance_record_' . $record->id . '.pdf');
        } catch (\Exception $e) {
            Log::error('PDF Preview Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to preview PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete PDF from maintenance record (regenerate on next access)
     */
    public function deletePDF(Request $request, int $id): JsonResponse
    {
        $record = MaintenanceRecord::find($id);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found'
            ], 404);
        }

        if (!$record->pdf_path) {
            return response()->json([
                'success' => false,
                'message' => 'PDF file not found'
            ], 404);
        }

        try {
            // Delete PDF file from storage
            if (Storage::disk('public')->exists($record->pdf_path)) {
                Storage::disk('public')->delete($record->pdf_path);
            }

            // Update record to remove pdf_path
            $record->update([
                'pdf_path' => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'PDF deleted successfully. PDF will be regenerated on next download.'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete PDF Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete maintenance record completely (including PDF, photos, and all related data)
     */
    public function deleteRecord(Request $request, int $id): JsonResponse
    {
        $record = MaintenanceRecord::with(['photos'])->find($id);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found'
            ], 404);
        }

        try {
            // Delete PDF file from storage (if exists)
            if ($record->pdf_path && Storage::disk('public')->exists($record->pdf_path)) {
                Storage::disk('public')->delete($record->pdf_path);
            }

            // Delete photo file from storage (if exists)
            if ($record->photo_path && Storage::disk('public')->exists($record->photo_path)) {
                Storage::disk('public')->delete($record->photo_path);
            }

            // Delete all related photos from storage and database
            foreach ($record->photos as $photo) {
                if ($photo->photo_path && Storage::disk('public')->exists($photo->photo_path)) {
                    Storage::disk('public')->delete($photo->photo_path);
                }
                $photo->delete();
            }

            // Delete all approvals (cascade will handle this, but we'll do it explicitly)
            MaintenanceApproval::where('maintenance_record_id', $record->id)->delete();

            // Delete the record itself
            $record->delete();

            return response()->json([
                'success' => true,
                'message' => 'Maintenance record deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete Record Error: ' . $e->getMessage());
            Log::error('Stack Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate PDF preview for a template structure (Admin)
     */
    public function previewTemplatePDF(Request $request)
    {
        try {
            $templateData = $request->all();

            $dummyTemplate = (object) [
                'name' => $templateData['name'] ?? 'Template Preview',
                'category' => $templateData['category'] ?? 'unknown',
                'device_fields' => $templateData['device_fields'] ?? [],
                'configuration_items' => $templateData['configuration_items'] ?? [],
                'special_fields' => $templateData['special_fields'] ?? [],
                'items' => collect($templateData['items'] ?? [])->map(function ($item) {
                    return (object) [
                        'title' => $item['title'] ?? '',
                        'columns' => $item['columns'] ?? [],
                        'items' => $item['items'] ?? [],
                        'order' => $item['order'] ?? 0,
                    ];
                }),
            ];

            $dummyResponses = [];
            foreach ($dummyTemplate->items as $sectionIndex => $section) {
                $sectionItems = [];
                foreach ($section->items as $item) {
                    $item = (array) $item;

                    if (isset($item['isInkTonerRibbon']) && $item['isInkTonerRibbon']) {
                        $colors = [];
                        foreach (($item['colors'] ?? []) as $color) {
                            $color = (array) $color;
                            $colors[] = ['name' => $color['name'] ?? 'Warna', 'percentage' => '...%'];
                        }
                        $sectionItems[] = [
                            'isInkTonerRibbon' => true,
                            'description' => $item['description'] ?? 'Ink/Toner/Ribbon Type',
                            'colors' => $colors,
                            'merge_columns' => $item['merge_columns'] ?? false
                        ];
                    } else if (isset($item['merge_columns']) && $item['merge_columns']) {
                        $sectionItems[] = [
                            'description' => $item['description'] ?? 'Item Gabungan',
                            'merged_text' => '(Preview field gabungan)',
                            'merge_columns' => true
                        ];
                    } else {
                        $sectionItems[] = [
                            'description' => $item['description'] ?? 'Item Normal',
                            'normal' => false,
                            'error' => false,
                            'information' => '(Preview field informasi)',
                            'merge_columns' => false
                        ];
                    }
                }
                $dummyResponses[] = [
                    'sectionIndex' => $sectionIndex,
                    'sectionTitle' => $section->title,
                    'items' => $sectionItems,
                ];
            }

            $dummyStokTinta = [];
            if (isset($templateData['special_fields']['stok_tinta'])) {
                foreach ($templateData['special_fields']['stok_tinta'] as $stok) {
                    $dummyStokTinta[] = '...';
                }
            }

            $record = new \App\Models\MaintenanceRecord();
            $record->device_data = $templateData['device_fields'] ?? [];
            $record->checklist_responses = $dummyResponses;
            $record->stok_tinta_responses = $dummyStokTinta;
            $record->notes = "Ini adalah preview template.\nCatatan akan muncul di sini.";
            $record->employee = (object)['name' => '(Nama Karyawan)'];

            $recordForPdf = clone $record;
            $recordForPdf->template = $dummyTemplate;

            $admin = null;
            $dateFormatted = (new \DateTime())->format('d F Y');
            $storageUrl = asset('storage/');

            $checklistHtml = view('pdfs.checklist', [
                'record' => $recordForPdf,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
                'admin' => $admin,
                'showSignatures' => false,
            ])->render();

            $fullHtml = '
            <html>
            <head>
                <style>
                    /* Minimal styling untuk PDF */
                    @page { margin: 15mm; }
                    body { font-family: Arial, sans-serif; background: white; }
                </style>
            </head>
            <body>
                ' . $checklistHtml . '
            </body>
            </html>';

            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($fullHtml);
            $pdf->setPaper('A4', 'portrait');
            $pdf->setOption('enable-local-file-access', true);

            return $pdf->stream('te mplate_preview.pdf');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Template PDF Preview Error: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat preview PDF: ' . $e->getMessage()
            ], 500);
        }
    }
}
