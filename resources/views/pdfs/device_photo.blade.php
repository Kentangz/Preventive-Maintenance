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

    .device-info-table {
      width: 100%;
      border: 1px solid black;
      border-collapse: collapse;
      margin: 15px 0;
    }

    .device-info-table td {
      vertical-align: top;
      border: none;
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

    .info-row {
      display: grid;
      grid-template-columns: 150px 1fr;
      margin: 8px 0;
      font-size: 12px;
    }

    .info-row .label {
      font-weight: bold;
    }

    .info-row .value {
      font-style: italic;
      color: #666;
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

    <div class="title">BUKTI FOTO PERANGKAT SETELAH MAINTENANCE</div>

    <!-- Device Info Section -->
    <table class="device-info-table">
      <tr>
        <td>
          <div class="info-header">Device Information</div>
          <div class="info-content">
            <div class="info-row">
              <div class="label">Device:</div>
              <div class="value">{{ $record->device_data['device'] ?? '' }}</div>
            </div>
            <div class="info-row">
              <div class="label">Merk/Type:</div>
              <div class="value">{{ $record->device_data['merk_type'] ?? '' }}</div>
            </div>
            <div class="info-row">
              <div class="label">Serial Number:</div>
              <div class="value">{{ $record->device_data['serial_number'] ?? '' }}</div>
            </div>
            <div class="info-row">
              <div class="label">Location:</div>
              <div class="value">{{ $record->device_data['location'] ?? '' }}</div>
            </div>
            <div class="info-row">
              <div class="label">Date:</div>
              <div class="value">{{ $date }}</div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div class="photo-section">
      @php
      $devicePhotos = $record->photos->where('photo_type', 'device')->take(2);
      @endphp

      @foreach($devicePhotos as $index => $devicePhoto)
      <div class="photo-item">
        <div class="photo-container" style="display: flex; align-items: center; justify-content: center; width: 30%; margin-bottom: 15px; border-radius: 0;">
          @php
          $photoPath = '';
          if ($devicePhoto && $devicePhoto->photo_path) {
          $photoPath = storage_path('app/public/' . $devicePhoto->photo_path);
          }
          @endphp

          @if($photoPath && file_exists($photoPath))
          <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents($photoPath)) }}" alt="Device Photo" style="display: flex; align-items: center; justify-content: center; width: 30%; margin-bottom: 15px; border-radius: 0;">
          @else
          <div style="padding: 50px; text-align: center; color: #999;">
            Foto tidak tersedia
          </div>
          @endif
        </div>
      </div>
      @endforeach

      @if($devicePhotos->count() === 0)
      <div class="photo-item">
        <div class="photo-container">
          <div style="padding: 50px; text-align: center; color: #999;">
            Foto tidak tersedia
          </div>
        </div>
      </div>
      @endif
    </div>

    <!-- Signature Section -->
    <table class="signature-table">
      <tr>
        <td style="padding-right: 20px;">
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
        <td style="padding-left: 20px;">
          <div style="text-align: right; margin-bottom: 0px;margin-right: 60px; font-size: 12px;">{{ $record->device_data['opco'] ?? 'Tuban' }}, {{ $date }}</div>
          <div class="signature-title">Officer Preventive Maintenance</div>
          <div style="text-align: right; margin-bottom: 5px;margin-right: 60px; font-size: 12px;">
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