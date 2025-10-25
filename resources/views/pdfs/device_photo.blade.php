<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: white;
    }

    .container {
      max-width: 210mm;
      margin: 0 auto;
      border: 2px solid black;
      padding: 15px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .logo-left {
      font-size: 40px;
      font-weight: bold;
      color: #0066cc;
      font-style: italic;
    }

    .header-center {
      text-align: center;
      flex-grow: 1;
    }

    .header-center div:first-child {
      font-weight: bold;
      font-size: 13px;
    }

    .header-center div:last-child {
      font-size: 12px;
    }

    .logo-right {
      font-size: 40px;
      font-weight: bold;
      color: #cc0000;
      font-style: italic;
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

    .device-info {
      margin: 30px 0;
      padding: 15px;
      border: 1px solid black;
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
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <div class="logo-left">SiSi</div>
      <div class="header-center">
        <div>PT. Sinergi Informatika Semen Indonesia</div>
        <div>Digital Service - Ops & Dev Infra</div>
      </div>
      <div class="logo-right">SIG</div>
    </div>

    <div class="title">BUKTI FOTO PERANGKAT SETELAH MAINTENANCE</div>

    <div class="device-info">
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

    <div style="text-align: center; margin-top: 50px; font-size: 12px;">
      <div><strong>Officer Preventive Maintenance</strong></div>
      <div style="margin-top: 80px; text-decoration: underline; font-weight: bold;">
        {{ $record->employee->name }}
      </div>
    </div>
  </div>
</body>

</html>