<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }

    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: white;
    }

    .container {
      width: 100%;
      border: 2px solid black;
      padding: 15px;
    }

    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }

    .header-table td {
      vertical-align: middle;
      border: none;
    }

    .logo-left {
      width: 15%;
      text-align: left;
    }

    .logo-left img {
      max-width: 80px;
      height: auto;
    }

    .header-center {
      width: 70%;
      text-align: center;
      padding: 0 10px;
    }

    .header-center-bold {
      font-weight: bold;
      font-size: 13px;
      margin-bottom: 2px;
    }

    .header-center-normal {
      font-size: 12px;
    }

    .logo-right {
      width: 15%;
      text-align: right;
    }

    .logo-right img {
      max-width: 80px;
      height: auto;
    }

    .title {
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      padding: 8px;
      border: 1px solid black;
      margin: 10px 0;
    }

    .info-header {
      background: #d3d3d3;
      padding: 5px 10px;
      font-weight: bold;
      font-size: 12px;
      border-bottom: 1px solid black;
    }

    .info-content {
      padding: 10px;
    }

    .pic-info-table {
      width: 100%;
      border: 1px solid black;
      border-collapse: collapse;
      margin: 15px 0;
    }

    .pic-info-table td {
      vertical-align: top;
      border: none;
    }

    .info-row {
      display: grid;
      grid-template-columns: 150px 1fr;
      margin: 12px 0;
      font-size: 12px;
    }

    .info-row .label {
      font-weight: bold;
    }

    .info-row .value {
      font-style: italic;
      color: #666;
    }

    .photo-section {
      text-align: center;
      margin: 20px 0;
    }

    .photo-label {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 10px;
    }

    .photo-section img {
      max-width: 60%;
      max-height: 400px;
      width: auto;
      height: auto;
      object-fit: contain;
      border: 2px solid #ddd;
    }

    .signature-section {
      margin: 20px 0;
      text-align: center;
    }

    .signature-label {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 10px;
    }

    .signature-section img {
      max-width: 300px;
      max-height: 100px;
      width: auto;
      height: auto;
      object-fit: contain;
      border: 1px solid #ddd;
    }

    .signature-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
      font-size: 12px;
    }

    .signature-table td {
      text-align: center;
      width: 50%;
      vertical-align: top;
      border: none;
    }

    .signature-title {
      margin-bottom: 60px;
    }

    .signature-name {
      text-decoration: underline;
      font-weight: bold;
    }
  </style>
</head>

<body>
  <div class="container">
    <!-- Header with 3 columns -->
    <table class="header-table">
      <tr>
        <td class="logo-left">
          @php
          $logoSisiPath = public_path('images/logo-SISI.png');
          @endphp
          @if(file_exists($logoSisiPath))
          <img src="data:image/png;base64,{{ base64_encode(file_get_contents($logoSisiPath)) }}" alt="SISI Logo">
          @else
          <div style="font-size: 40px; font-weight: bold; color: #0066cc; font-style: italic;">SiSi</div>
          @endif
        </td>
        <td class="header-center">
          <div class="header-center-bold">PT. Sinergi Informatika Semen Indonesia</div>
          <div class="header-center-normal">Digital Service - Ops & Dev Infra</div>
        </td>
        <td class="logo-right">
          @php
          $logoSigPath = public_path('images/logo-SIG.png');
          @endphp
          @if(file_exists($logoSigPath))
          <img src="data:image/png;base64,{{ base64_encode(file_get_contents($logoSigPath)) }}" alt="SIG Logo">
          @else
          <div style="font-size: 40px; font-weight: bold; color: #cc0000; font-style: italic;">SIG</div>
          @endif
        </td>
      </tr>
    </table>

    <div class="title">BUKTI PIC YANG MELAKUKAN MAINTENANCE</div>

    <!-- PIC Info Section -->
    <table class="pic-info-table">
      <tr>
        <td>
          <div class="info-header">PIC Information</div>
          <div class="info-content">
            <div class="info-row">
              <div class="label">Nama:</div>
              <div class="value">{{ $record->employee->name }}</div>
            </div>
            <div class="info-row">
              <div class="label">Tanggal Akun Dibuat:</div>
              <div class="value">{{ $record->employee->created_at->format('d F Y') }}</div>
            </div>
            <div class="info-row">
              <div class="label">Tanggal Maintenance:</div>
              <div class="value">{{ $date }}</div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div class="photo-section">
      <div class="photo-label">Foto Identitas</div>
      @php
      // Use snapshot from MaintenancePhoto if available, otherwise fallback to employee identity_photo
      $picProofPhoto = $record->photos->firstWhere('photo_type', 'pic_proof');
      $photoPath = '';

      if ($picProofPhoto && $picProofPhoto->photo_path) {
      // Use snapshot from MaintenancePhoto
      $photoPath = storage_path('app/public/' . $picProofPhoto->photo_path);
      } elseif ($record->employee && $record->employee->identity_photo) {
      // Fallback to employee identity_photo if snapshot doesn't exist
      $photoPath = storage_path('app/public/' . $record->employee->identity_photo);
      }
      @endphp

      @if($photoPath && file_exists($photoPath))
      <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents($photoPath)) }}" alt="Identity Photo">
      @else
      <div style="padding: 40px; text-align: center; color: #999;">
        Tidak ada foto
      </div>
      @endif
    </div>

    <!-- Signature Section -->
    <table class="signature-table">
      <tr>
        <td>
          <div class="signature-title">Person In Charge, SIG</div>
          <div style="margin-bottom: 5px; font-size: 12px; text-align: center;">
            @if(isset($showSignatures) && $showSignatures && isset($admin) && $admin && $admin->signature)
            @php
            $adminSignaturePath = storage_path('app/public/' . $admin->signature);
            @endphp
            @if(file_exists($adminSignaturePath))
            <img src="data:image/png;base64,{{ base64_encode(file_get_contents($adminSignaturePath)) }}"
              alt="Admin Signature"
              style="max-width: 150px; max-height: 60px; margin-bottom: 5px;" />
            @endif
            @endif
          </div>
          <div class="signature-name">{{ isset($admin) && $admin ? $admin->name : (is_array($record->template->device_fields) ? ($record->template->device_fields['admin_name'] ?? 'Admin') : ($record->template->device_fields ?? 'Admin')) }}</div>
        </td>
        <td>
          <div style="text-align: right; margin-right: 80px; font-size: 12px; margin-bottom: 0;">{{ $record->device_data['opco'] ?? 'Tuban' }}, {{ $date }}</div>
          <div class="signature-title">Officer Preventive Maintenance</div>
          <div style="text-align: right; margin-bottom: 5px; margin-right: 80px; font-size: 12px;">
            @if(isset($showSignatures) && $showSignatures && $record->employee && $record->employee->signature)
            @php
            $employeeSignaturePath = storage_path('app/public/' . $record->employee->signature);
            @endphp
            @if(file_exists($employeeSignaturePath))
            <img src="data:image/png;base64,{{ base64_encode(file_get_contents($employeeSignaturePath)) }}"
              alt="Employee Signature"
              style="max-width: 150px; max-height: 60px; margin-bottom: 5px;" />
            @endif
            @endif
          </div>
          <div class="signature-name">{{ $record->employee->name }}</div>
        </td>
      </tr>
    </table>
  </div>
</body>

</html>