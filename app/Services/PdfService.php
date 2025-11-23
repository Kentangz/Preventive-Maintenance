<?php

namespace App\Services;

use App\Models\MaintenanceRecord;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfService
{
  /**
   * Generate PDF and return as stream for preview
   */
  public function generatePdfStream(MaintenanceRecord $record, ?User $admin = null, bool $showSignatures = false)
  {
    $fullHtml = $this->generatePdfHtml($record, $admin, $showSignatures);

    $pdf = Pdf::loadHTML($fullHtml);
    $pdf->setPaper('A4', 'portrait');
    $pdf->setOption('enable-local-file-access', true);
    $pdf->setOption('no-stop-slow-scripts', true);

    return $pdf;
  }

  /**
   * Generate PDF and save to storage with signatures
   */
  public function generateAndSavePdf(MaintenanceRecord $record, User $admin, $templateData = null): string
  {
    try {
      $fullHtml = $this->generatePdfHtml($record, $admin, true, $templateData);

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
   * Generate template preview PDF (for admin preview without actual record)
   */
  public function generateTemplatePdfPreview(array $templateData)
  {
    try {
      $dummyTemplate = $this->createDummyTemplate($templateData);
      $dummyRecord = $this->createDummyRecord($templateData, $dummyTemplate);

      $recordForPdf = clone $dummyRecord;
      $recordForPdf->template = $dummyTemplate;

      $dateFormatted = (new \DateTime())->format('d F Y');
      $storageUrl = asset('storage/');

      $checklistHtml = view('pdfs.checklist', [
        'record' => $recordForPdf,
        'date' => $dateFormatted,
        'storageUrl' => $storageUrl,
        'admin' => null,
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

      $pdf = Pdf::loadHTML($fullHtml);
      $pdf->setPaper('A4', 'portrait');
      $pdf->setOption('enable-local-file-access', true);

      return $pdf;
    } catch (\Exception $e) {
      Log::error('Template PDF Preview Error: ' . $e->getMessage() . ' on line ' . $e->getLine());
      throw $e;
    }
  }

  /**
   * Delete PDF file from storage
   */
  public function deletePdf(MaintenanceRecord $record): bool
  {
    if (!$record->pdf_path) {
      return false;
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

      return true;
    } catch (\Exception $e) {
      Log::error('Delete PDF Error: ' . $e->getMessage());
      throw $e;
    }
  }

  /**
   * Format date to Indonesia format
   */
  public function formatDate(\DateTime $date): string
  {
    $formatter = new \IntlDateFormatter(
      'id_ID',
      \IntlDateFormatter::FULL,
      \IntlDateFormatter::NONE,
      'Asia/Jakarta',
      \IntlDateFormatter::GREGORIAN,
      'EEEE, d MMMM yyyy'
    );

    return $formatter->format($date);
  }

  /**
   * Generate complete PDF HTML with all pages
   */
  private function generatePdfHtml(MaintenanceRecord $record, ?User $admin, bool $showSignatures, $templateData = null): string
  {
    // Ensure photos are loaded
    if (!$record->relationLoaded('photos')) {
      $record->load('photos');
    }

    // Create a temporary record copy for PDF view
    $recordForPdf = clone $record;
    $recordForPdf->template = $templateData;
    $recordForPdf->setRelation('photos', $record->photos);

    // Format date
    $dateFormatted = $this->formatDate(new \DateTime($record->created_at));
    $storageUrl = asset('storage/');

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

    // Combine all pages with proper page breaks
    return '
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
  }

  /**
   * Create dummy template object for preview
   */
  private function createDummyTemplate(array $templateData): object
  {
    return (object) [
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
  }

  /**
   * Create dummy record for template preview
   */
  private function createDummyRecord(array $templateData, object $dummyTemplate): \App\Models\MaintenanceRecord
  {
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

    return $record;
  }
}
