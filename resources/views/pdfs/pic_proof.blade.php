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
      margin: 30px 0;
    }

    .photo-container {
      border: 2px solid black;
      padding: 5px;
      display: inline-block;
      border-radius: 50%;
      overflow: hidden;
      width: 120px;
      height: 120px;
    }

    .photo-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .signature-section {
      margin: 40px 0;
      text-align: center;
    }

    .signature-label {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 10px;
    }

    .signature-box {
      border: 1px solid black;
      width: 250px;
      height: 80px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .signature-box img {
      max-width: 100%;
      max-height: 100%;
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
            <div class="info-row">
              <div class="label">Device:</div>
              <div class="value">{{ $record->device_data['device'] ?? '' }}</div>
            </div>
            <div class="info-row">
              <div class="label">Location:</div>
              <div class="value">{{ $record->device_data['location'] ?? '' }}</div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div class="photo-section">
      <div class="photo-label">Foto Identitas</div>
      <div class="photo-container">
        @php
        $identityPhoto = $record->employee->identity_photo;
        $photoPath = '';
        if ($identityPhoto) {
        $photoPath = storage_path('app/public/' . $identityPhoto);
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
    </div>

    <div class="signature-section">
      <div class="signature-label">Tanda Tangan</div>
      <div class="signature-box">
        @php
        $signature = $record->employee->signature;
        $signaturePath = '';
        if ($signature) {
        $signaturePath = storage_path('app/public/' . $signature);
        }
        @endphp

        @if($signaturePath && file_exists($signaturePath))
        <img src="data:image/png;base64,{{ base64_encode(file_get_contents($signaturePath)) }}" alt="Signature">
        @else
        <span style="color: #999; font-style: italic;">Tidak ada tanda tangan</span>
        @endif
      </div>
    </div>

    <!-- Signature Section -->
    <table class="signature-table">
      <tr>
        <td>
          <div style="margin-bottom: 5px; font-size: 12px; visibility: hidden">Placeholder</div>
          <div class="signature-title">Person In Charge, SIG</div>
          <div class="signature-name">{{ is_array($record->template->device_fields) ? ($record->template->device_fields['admin_name'] ?? 'Admin') : ($record->template->device_fields ?? 'Admin') }}</div>
        </td>
        <td>
          <div class="date-location" style="margin-right:80px; font-size: 12px">{{ $record->device_data['location'] ?? 'Tuban' }}, {{ $date }}</div>
          <div class="signature-title">Officer Preventive Maintenance</div>
          <div class="signature-name">{{ $record->employee->name }}</div>
        </td>
      </tr>
    </table>
  </div>
</body>

</html>