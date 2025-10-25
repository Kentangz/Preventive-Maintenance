<?php

namespace App\Http\Controllers;

use App\Models\ChecklistTemplate;
use App\Models\ChecklistItem;
use App\Models\MaintenanceRecord;
use App\Models\MaintenancePhoto;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
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
            'category' => 'required|in:printer,switch,vvip',
            'name' => 'required|string|max:255',
            'device_fields' => 'required|array',
            'configuration_items' => 'required|array',
            'special_fields' => 'nullable|array',
            'items' => 'required|array',
            'items.*.title' => 'required|string',
            'items.*.columns' => 'required|array',
            'items.*.items' => 'required|array',
            'items.*.order' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create template
        $template = ChecklistTemplate::create([
            'category' => $request->category,
            'name' => $request->name,
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
                    'items' => $item['items'],
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
            'category' => 'sometimes|in:printer,switch,vvip',
            'name' => 'sometimes|string|max:255',
            'device_fields' => 'sometimes|array',
            'configuration_items' => 'sometimes|array',
            'special_fields' => 'sometimes|array',
            'items' => 'sometimes|array',
            'items.*.title' => 'required_with:items|string',
            'items.*.columns' => 'required_with:items|array',
            'items.*.items' => 'required_with:items|array',
            'items.*.order' => 'required_with:items|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update template
        $template->update($request->only([
            'category',
            'name',
            'device_fields',
            'configuration_items',
            'special_fields',
            'is_active'
        ]));

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
                    'items' => $item['items'],
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
     * Get all maintenance records (Admin)
     */
    public function getMaintenanceRecords(Request $request): JsonResponse
    {
        $category = $request->query('category');

        $query = MaintenanceRecord::with(['template', 'employee', 'photos']);

        if ($category) {
            $query->whereHas('template', function ($q) use ($category) {
                $q->where('category', $category);
            });
        }

        $records = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
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

        $validator = Validator::make($request->all(), [
            'checklist_template_id' => 'required|exists:checklist_templates,id',
            'device_data' => 'required|array',
            'checklist_responses' => 'required|array',
            'notes' => 'required|string',
            'device_photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle photo upload
        $photoPath = null;
        if ($request->hasFile('device_photo')) {
            $photoPath = $request->file('device_photo')->store('maintenance_photos', 'public');
        }

        // Create maintenance record
        $record = MaintenanceRecord::create([
            'checklist_template_id' => $request->checklist_template_id,
            'employee_id' => $employee->id,
            'device_data' => $request->device_data,
            'checklist_responses' => $request->checklist_responses,
            'notes' => $request->notes,
            'photo_path' => $photoPath,
            'status' => 'completed',
        ]);

        // Create device photo record
        MaintenancePhoto::create([
            'maintenance_record_id' => $record->id,
            'photo_type' => 'device',
            'photo_path' => $photoPath,
        ]);

        // Create PIC proof photo
        MaintenancePhoto::create([
            'maintenance_record_id' => $record->id,
            'photo_type' => 'pic_proof',
            'photo_path' => $photoPath, // Will be replaced with actual PIC proof
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
     * Generate PDF for maintenance record
     */
    public function generatePDF(Request $request, int $id)
    {
        $record = MaintenanceRecord::with(['template', 'employee', 'photos'])->find($id);

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Record not found'
            ], 404);
        }

        try {
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

            // Generate checklist form page (Page 1)
            $checklistHtml = view('pdfs.checklist', [
                'record' => $record,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
            ])->render();

            // Generate device photo page (Page 2)
            $devicePhotoHtml = view('pdfs.device_photo', [
                'record' => $record,
                'storageUrl' => $storageUrl,
            ])->render();

            // Generate PIC proof page (Page 3)
            $picProofHtml = view('pdfs.pic_proof', [
                'record' => $record,
                'date' => $dateFormatted,
                'storageUrl' => $storageUrl,
            ])->render();

            // Combine all pages
            $fullHtml = $checklistHtml . '<div style="page-break-after: always;"></div>' .
                $devicePhotoHtml . '<div style="page-break-after: always;"></div>' .
                $picProofHtml;

            // Generate PDF
            $pdf = Pdf::loadHTML($fullHtml);
            $pdf->setPaper('A4', 'portrait');

            // Return PDF response
            return $pdf->download('maintenance_record_' . $record->id . '.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate PDF: ' . $e->getMessage()
            ], 500);
        }
    }
}
