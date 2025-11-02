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

    .photo-section {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin: 20px 0;
      flex-wrap: wrap;
    }

    .photo-item {
      flex: 1;
      max-width: 48%;
      min-width: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .photo-item img {
      max-width: 100%;
      max-height: 350px;
      width: auto;
      height: auto;
      object-fit: contain;
      border: 1px solid #ddd;
    }

    .photo-item.single {
      max-width: 60%;
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
    <div class="photo-section">
      @php
      $devicePhotos = $record->photos->where('photo_type', 'device')->take(2);
      $photoCount = $devicePhotos->count();
      @endphp

      @foreach($devicePhotos as $index => $devicePhoto)
      <div class="photo-item {{ $photoCount === 1 ? 'single' : '' }}">
        @php
        $photoPath = '';
        if ($devicePhoto && $devicePhoto->photo_path) {
        $photoPath = storage_path('app/public/' . $devicePhoto->photo_path);
        }
        @endphp

        @if($photoPath && file_exists($photoPath))
        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents($photoPath)) }}" alt="Device Photo {{ $index + 1 }}">
        @else
        <div style="padding: 50px; text-align: center; color: #999;">
          Foto tidak tersedia
        </div>
        @endif
      </div>
      @endforeach

      @if($photoCount === 0)
      <div class="photo-item single">
        <div style="padding: 50px; text-align: center; color: #999;">
          Foto tidak tersedia
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