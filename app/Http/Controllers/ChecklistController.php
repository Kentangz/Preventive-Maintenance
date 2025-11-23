<?php

namespace App\Http\Controllers;

use App\Models\ChecklistTemplate;
use App\Models\MaintenanceRecord;
use App\Services\ChecklistTemplateService;
use App\Services\MaintenanceRecordService;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ChecklistController extends Controller
{
    public function __construct(
        private ChecklistTemplateService $templateService,
        private MaintenanceRecordService $recordService,
        private PdfService $pdfService
    ) {}

    /**
     * Get all checklist templates (Admin)
     */
    public function getTemplates(Request $request): JsonResponse
    {
        $templates = $this->templateService->getAllTemplates();

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
        $templates = $this->templateService->getTemplatesByCategory($category);

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
        $templates = $this->templateService->getTemplatesByCategory($category, activeOnly: true);

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
        $template = $this->templateService->getTemplate($id);

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

        $template = $this->templateService->createTemplate($request->all());

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

        $template = $this->templateService->updateTemplate($id, $request->all());

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

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
        $deleted = $this->templateService->deleteTemplate($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

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
        $template = $this->templateService->duplicateTemplate($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Template duplicated successfully',
            'data' => $template
        ], 201);
    }

    /**
     * Get all maintenance records (Admin) - Only accepted records
     */
    public function getMaintenanceRecords(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $records = $this->recordService->getRecords('accepted', $category);

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
        $records = $this->recordService->getRecords('pending', $category);

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
        $records = $this->recordService->getRecords('rejected', $category);

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

        try {
            $record = $this->recordService->acceptRecord($id, $admin, $request->notes);

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'Record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Record accepted successfully',
                'data' => $record
            ]);
        } catch (\Exception $e) {
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

        try {
            $record = $this->recordService->rejectRecord($id, $admin, $request->notes);

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'Record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Record rejected successfully',
                'data' => $record
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get employee's own maintenance records
     */
    public function getMyMaintenanceRecords(Request $request): JsonResponse
    {
        $employee = $request->user();
        $records = $this->recordService->getEmployeeRecords($employee->id);

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

        $template = ChecklistTemplate::with('items')->find($request->checklist_template_id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        $recordData = [
            'device_data' => $deviceData,
            'checklist_responses' => $checklistResponses,
            'stok_tinta_responses' => $stokTintaResponses,
            'notes' => $request->notes,
        ];

        $record = $this->recordService->createRecord(
            $employee,
            $template,
            $recordData,
            $request->file('device_photos')
        );

        return response()->json([
            'success' => true,
            'message' => 'Maintenance record created successfully',
            'data' => $record
        ], 201);
    }

    /**
     * Generate PDF for maintenance record (download)
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
            if ($record->status === 'accepted' && $record->pdf_path && Storage::disk('public')->exists($record->pdf_path)) {
                $pdfPath = Storage::disk('public')->path($record->pdf_path);
                return response()->download($pdfPath, 'maintenance_record_' . $record->id . '.pdf');
            }

            $admin = $record->status === 'accepted' && $record->approvals->where('action', 'accepted')->first()
                ? $record->approvals->where('action', 'accepted')->first()->admin
                : null;

            $templateData = $this->recordService->getTemplateData($record);
            $showSignatures = $record->status === 'accepted';

            $pdf = $this->pdfService->generatePdfStream($record, $admin, $showSignatures);
            $record->template = $templateData;

            return $pdf->download('maintenance_record_' . $record->id . '.pdf');
        } catch (\Exception $e) {
            Log::error('PDF Generation Error: ' . $e->getMessage());
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
            if ($record->status === 'accepted' && $record->pdf_path && Storage::disk('public')->exists($record->pdf_path)) {
                $pdfPath = Storage::disk('public')->path($record->pdf_path);
                return response()->file($pdfPath);
            }

            $admin = $record->status === 'accepted' && $record->approvals->where('action', 'accepted')->first()
                ? $record->approvals->where('action', 'accepted')->first()->admin
                : null;

            $templateData = $this->recordService->getTemplateData($record);
            $showSignatures = $record->status === 'accepted';

            $record->template = $templateData;

            $pdf = $this->pdfService->generatePdfStream($record, $admin, $showSignatures);

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

        try {
            $deleted = $this->pdfService->deletePdf($record);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'PDF file not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'PDF deleted successfully. PDF will be regenerated on next download.'
            ]);
        } catch (\Exception $e) {
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
        try {
            $deleted = $this->recordService->deleteRecord($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Record not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Maintenance record deleted successfully'
            ]);
        } catch (\Exception $e) {
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
            $pdf = $this->pdfService->generateTemplatePdfPreview($templateData);

            return $pdf->stream('template_preview.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat preview PDF: ' . $e->getMessage()
            ], 500);
        }
    }
}
