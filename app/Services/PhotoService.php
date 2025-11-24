<?php

namespace App\Services;

use App\Models\MaintenanceRecord;
use App\Models\MaintenancePhoto;
use App\Models\Employee;
use Illuminate\Support\Facades\Storage;

class PhotoService
{
  /**
   * Upload device photos and create photo records
   * Returns array of photo paths
   */
  public function uploadDevicePhotos(array $photos, int $recordId): array
  {
    $photoPaths = [];

    foreach ($photos as $photo) {
      $photoPath = $photo->store('maintenance_photos', 'public');
      $photoPaths[] = $photoPath;

      MaintenancePhoto::create([
        'maintenance_record_id' => $recordId,
        'photo_type' => 'device',
        'photo_path' => $photoPath,
      ]);
    }

    return $photoPaths;
  }

  /**
   * Create PIC proof photo from employee identity photo
   * Falls back to device photo if identity photo not available
   */
  public function createPicProofPhoto(Employee $employee, int $recordId, string $fallbackPath): void
  {
    $picProofPath = null;

    if ($employee->identity_photo) {
      $originalPath = storage_path('app/public/' . $employee->identity_photo);

      if (file_exists($originalPath)) {
        $extension = pathinfo($employee->identity_photo, PATHINFO_EXTENSION);
        $snapshotPath = 'maintenance_pic_proofs/record_' . $recordId . '_' . time() . '.' . $extension;

        Storage::disk('public')->put($snapshotPath, file_get_contents($originalPath));
        $picProofPath = $snapshotPath;
      } else {
        $picProofPath = $fallbackPath;
      }
    } else {
      $picProofPath = $fallbackPath;
    }

    MaintenancePhoto::create([
      'maintenance_record_id' => $recordId,
      'photo_type' => 'pic_proof',
      'photo_path' => $picProofPath,
      'employee_data' => [
        'name' => $employee->name,
        'identity_photo' => $employee->identity_photo,
        'identity_photo_snapshot' => $picProofPath,
        'signature' => $employee->signature,
        'account_created_at' => $employee->created_at,
      ],
    ]);
  }

  /**
   * Delete all photos associated with a maintenance record
   */
  public function deletePhotos(MaintenanceRecord $record): void
  {
    if ($record->photo_path && Storage::disk('public')->exists($record->photo_path)) {
      Storage::disk('public')->delete($record->photo_path);
    }
    foreach ($record->photos as $photo) {
      if ($photo->photo_path && Storage::disk('public')->exists($photo->photo_path)) {
        Storage::disk('public')->delete($photo->photo_path);
      }
      $photo->delete();
    }
  }
}
