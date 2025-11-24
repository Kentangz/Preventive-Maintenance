<?php

namespace App\Services;

use App\Models\MaintenanceRecord;
use App\Models\MaintenanceApproval;
use App\Models\ChecklistTemplate;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class MaintenanceRecordService
{
  public function __construct(
    private PhotoService $photoService,
    private PdfService $pdfService
  ) {}

  /**
   * Get maintenance records with filters
   */
  public function getRecords(?string $status = null, ?string $category = null): Collection
  {
    $query = MaintenanceRecord::with(['template', 'employee', 'photos', 'approvals.admin']);

    if ($status) {
      $query->where('status', $status);
    }

    if ($category) {
      $query->where('category', $category);
    }

    return $query->orderBy('created_at', 'desc')->get();
  }

  /**
   * Get employee's own maintenance records
   */
  public function getEmployeeRecords(int $employeeId): Collection
  {
    return MaintenanceRecord::with(['template', 'photos'])
      ->where('employee_id', $employeeId)
      ->orderBy('created_at', 'desc')
      ->get();
  }

  /**
   * Create maintenance record
   */
  public function createRecord(Employee $employee, ChecklistTemplate $template, array $data, array $devicePhotos): MaintenanceRecord
  {
    // Create maintenance record with template snapshot
    $record = MaintenanceRecord::create([
      'checklist_template_id' => $template->id,
      'category' => $template->category,
      'template_snapshot' => $this->saveTemplateSnapshot($template),
      'employee_id' => $employee->id,
      'device_data' => $data['device_data'],
      'checklist_responses' => $data['checklist_responses'],
      'stok_tinta_responses' => $data['stok_tinta_responses'] ?? null,
      'notes' => $data['notes'],
      'photo_path' => null, // Will be set after upload
      'status' => 'pending',
    ]);

    // Upload device photos
    $photoPaths = $this->photoService->uploadDevicePhotos($devicePhotos, $record->id);

    // Set primary photo path (first photo for backward compatibility)
    if (!empty($photoPaths)) {
      $record->update(['photo_path' => $photoPaths[0]]);
    }

    // Create PIC proof photo
    $fallbackPath = $photoPaths[0] ?? null;
    $this->photoService->createPicProofPhoto($employee, $record->id, $fallbackPath);

    return $record->load(['template', 'employee', 'photos']);
  }

  /**
   * Accept maintenance record
   */
  public function acceptRecord(int $id, User $admin, ?string $notes = null): ?MaintenanceRecord
  {
    $record = MaintenanceRecord::with(['template.items', 'employee', 'photos'])->find($id);

    if (!$record) {
      return null;
    }

    if ($record->status !== 'pending') {
      throw new \Exception('Record is not pending for approval');
    }

    try {
      // Get template data first (before generating PDF)
      $templateData = $this->getTemplateData($record);

      // Generate PDF with signatures
      $pdfPath = $this->pdfService->generateAndSavePdf($record, $admin, $templateData);

      // Update record status and save PDF path
      $record->update([
        'status' => 'accepted',
        'pdf_path' => $pdfPath,
      ]);

      // Create approval record
      MaintenanceApproval::create([
        'maintenance_record_id' => $record->id,
        'admin_id' => $admin->id,
        'action' => 'accepted',
        'notes' => $notes,
      ]);

      return $record->load(['template', 'employee', 'photos', 'approvals.admin']);
    } catch (\Exception $e) {
      Log::error('Accept Record Error: ' . $e->getMessage());
      throw $e;
    }
  }

  /**
   * Reject maintenance record
   */
  public function rejectRecord(int $id, User $admin, ?string $notes = null): ?MaintenanceRecord
  {
    $record = MaintenanceRecord::find($id);

    if (!$record) {
      return null;
    }

    if ($record->status !== 'pending') {
      throw new \Exception('Record is not pending for approval');
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
        'notes' => $notes,
      ]);

      return $record->load(['template', 'employee', 'photos', 'approvals.admin']);
    } catch (\Exception $e) {
      Log::error('Reject Record Error: ' . $e->getMessage());
      throw $e;
    }
  }

  /**
   * Delete maintenance record completely
   */
  public function deleteRecord(int $id): bool
  {
    $record = MaintenanceRecord::with(['photos'])->find($id);

    if (!$record) {
      return false;
    }

    try {
      // Delete PDF file from storage (if exists)
      if ($record->pdf_path) {
        $this->pdfService->deletePdf($record);
      }

      // Delete all photos
      $this->photoService->deletePhotos($record);

      // Delete all approvals
      MaintenanceApproval::where('maintenance_record_id', $record->id)->delete();

      // Delete the record itself
      $record->delete();

      return true;
    } catch (\Exception $e) {
      Log::error('Delete Record Error: ' . $e->getMessage());
      Log::error('Stack Trace: ' . $e->getTraceAsString());
      throw $e;
    }
  }

  /**
   * Get template data (from template or snapshot)
   */
  public function getTemplateData(MaintenanceRecord $record): object
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
   * Save template structure as snapshot
   */
  public function saveTemplateSnapshot(ChecklistTemplate $template): array
  {
    return [
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
    ];
  }
}
