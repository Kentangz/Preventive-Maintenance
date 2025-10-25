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

    .pic-info {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid black;
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

    <div class="title">BUKTI PIC YANG MELAKUKAN MAINTENANCE</div>

    <div class="pic-info">
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

    <div class="photo-section">
      <div class="photo-label">Foto Identitas</div>
      <div class="photo-container">
        @php
        $identityPhoto = $record->employee->identity_photo;
        $photoPath = $identityPhoto ? $storageUrl . '/' . $identityPhoto : '';
        @endphp

        @if($photoPath)
        <img src="{{ $photoPath }}" alt="Identity Photo">
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
        $signaturePath = $signature ? $storageUrl . '/' . $signature : '';
        @endphp

        @if($signaturePath)
        <img src="{{ $signaturePath }}" alt="Signature">
        @else
        <span style="color: #999; font-style: italic;">Tidak ada tanda tangan</span>
        @endif
      </div>
    </div>

    <div style="text-align: center; margin-top: 50px; font-size: 12px;">
      <div><strong>Officer Preventive Maintenance</strong></div>
      <div style="margin-top: 60px; text-decoration: underline; font-weight: bold;">
        {{ $record->employee->name }}
      </div>
    </div>
  </div>
</body>

</html>