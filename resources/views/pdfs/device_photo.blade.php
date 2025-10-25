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
      font-size: 40px;
      font-weight: bold;
      color: #0066cc;
      font-style: italic;
      text-align: left;
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
      font-size: 40px;
      font-weight: bold;
      color: #cc0000;
      font-style: italic;
      text-align: right;
    }

    .title {
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      padding: 8px;
      border: 1px solid black;
      margin: 10px 0;
    }

    .photo-section {
      text-align: center;
      margin: 40px 0;
    }

    .photo-container {
      border: 2px solid black;
      padding: 10px;
      display: inline-block;
      max-width: 100%;
    }

    .photo-container img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    .photo-label {
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      margin-top: 15px;
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
        <td class="logo-left">SiSi</td>
        <td class="header-center">
          <div class="header-center-bold">PT. Sinergi Informatika Semen Indonesia</div>
          <div class="header-center-normal">Digital Service - Ops & Dev Infra</div>
        </td>
        <td class="logo-right">SIG</td>
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
      <div class="photo-container">
        @php
        $devicePhoto = $record->photos->where('photo_type', 'device')->first();
        $photoPath = $devicePhoto ? $storageUrl . '/' . $devicePhoto->photo_path : '';
        @endphp

        @if($photoPath)
        <img src="{{ $photoPath }}" alt="Device Photo">
        @else
        <div style="padding: 50px; text-align: center; color: #999;">
          Foto tidak tersedia
        </div>
        @endif
      </div>
      <div class="photo-label">Foto Perangkat Setelah Maintenance</div>
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