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

    .info-table {
      width: 100%;
      border: 1px solid black;
      border-collapse: collapse;
      margin: 15px 0;
    }

    .info-table td {
      vertical-align: top;
      border: none;
    }

    .info-left-cell {
      width: 40%;
      border-right: 1px solid black;
    }

    .info-right-cell {
      width: 60%;
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

    .date-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 1px solid black;
      font-size: 12px;
    }

    .date-table td {
      border: none;
    }

    .date-label {
      width: 80px;
      padding: 5px;
      text-align: center;
      border-right: 1px solid black;
    }

    .date-value {
      padding: 5px;
      font-style: italic;
      color: #666;
    }

    .device-info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }

    .device-info-table td {
      border: none;
      padding: 0;
    }

    .field-container {
      padding-right: 10px;
    }

    table.checklist {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 11px;
    }

    table.checklist,
    table.checklist th,
    table.checklist td {
      border: 1px solid black;
    }

    table.checklist th {
      background: #d3d3d3;
      padding: 4px;
      text-align: center;
      font-weight: bold;
      font-size: 11px;
    }

    table.checklist td {
      padding: 4px 6px;
      vertical-align: top;
    }

    .no-col {
      width: 40px;
      text-align: center;
      border: none !important;
    }

    .desc-col {
      padding-left: 8px;
    }

    .condition-header {
      text-align: center;
      background: #d3d3d3;
    }

    .check-col {
      width: 50px;
      text-align: center;
      vertical-align: middle;
    }

    .info-col {
      width: 180px;
    }

    .check-item {
      font-style: italic;
      padding: 1px 4px;
      font-size: 12px;
      background: #f5f5f5;
    }

    tbody tr {
      height: 18px;
    }

    .title-row td {
      padding: 4px 8px;
      border: none !important;
    }

    /* Remove borders from no-col in all tbody rows */
    tbody tr .no-col {
      border: none !important;
    }

    /* Remove borders from title rows */
    .title-row td {
      border: none !important;
    }

    /* Remove borders from notes rows */
    .notes-row td {
      border: none !important;
    }

    /* Keep border only in header */
    thead .no-col {
      border: 1px solid black !important;
    }

    .spacer-row td {
      border: none !important;
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

    .date-location {
      text-align: right;
      margin-bottom: 10px;
      font-size: 12px;
    }

    .field-underline {
      border-bottom: 1px solid black;
      padding-bottom: 2px;
      margin-bottom: 2px;
    }

    .field-value {
      font-style: italic;
      color: #666;
      font-size: 11px;
    }

    .field-label {
      font-size: 11px;
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

    <div class="title">CHECKLIST PREVENTIVE MAINTENANCE</div>

    <!-- Info Section -->
    <table class="info-table">
      <tr>
        <td class="info-left-cell">
          <div class="info-header">Configurations Items</div>
          <div class="info-content">
            <div class="field-underline">
              <div class="field-value">
                {{ $record->device_data['device'] ?? '' }}
              </div>
            </div>
            <div class="field-label" style="margin-bottom: 8px">Device</div>

            <div class="field-underline">
              <div class="field-value">
                {{ $record->device_data['merk_type'] ?? '' }}
              </div>
            </div>
            <div class="field-label">Merk/ Type</div>
          </div>
        </td>
        <td class="info-right-cell">
          <table class="date-table">
            <tr>
              <td class="date-label">Date</td>
              <td class="date-value">{{ $date }}</td>
            </tr>
          </table>
          <div class="info-content">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 33.33%; padding: 0 10px 0 0; vertical-align: top;">
                  <div class="field-underline">
                    <div class="field-value">{{ $record->device_data['id_tagging_asset'] ?? '' }}</div>
                  </div>
                  <div class="field-label">ID Tagging Asset</div>
                </td>
                <td style="width: 33.33%; padding: 0 10px; vertical-align: top;">
                  <div class="field-underline">
                    <div class="field-value">{{ $record->device_data['opco'] ?? '' }}</div>
                  </div>
                  <div class="field-label">OpCo</div>
                </td>
                <td style="width: 33.33%; padding: 0 0 0 10px; vertical-align: top;">
                </td>
              </tr>
              <tr>
                <td style="width: 33.33%; padding: 0 10px 0 0; vertical-align: top; padding-top: 8px;">
                  <div class="field-underline">
                    <div class="field-value">{{ $record->device_data['serial_number'] ?? '' }}</div>
                  </div>
                  <div class="field-label">Serial Number</div>
                </td>
                <td style="width: 33.33%; padding: 0 10px; vertical-align: top; padding-top: 8px;">
                  <div class="field-underline">
                    <div class="field-value">{{ $record->device_data['location'] ?? '' }}</div>
                  </div>
                  <div class="field-label">Location</div>
                </td>
                <td style="width: 33.33%; padding: 0 0 0 10px; vertical-align: top;">
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <!-- Checklist Table -->
    <table class="checklist">
      <thead>
        <tr>
          <th class="no-col" rowspan="2">No</th>
          <th rowspan="2">Description</th>
          <th colspan="2" class="condition-header">Condition</th>
          <th rowspan="2" class="info-col">Information</th>
        </tr>
        <tr>
          <th class="check-col">Normal</th>
          <th class="check-col">Error</th>
        </tr>
      </thead>
      <tbody>
        @php
        $sectionNum = 1;
        @endphp
        @foreach($record->checklist_responses as $section)
        <tr class="title-row">
          <td class="no-col" style="font-weight: bold">{{ $sectionNum++ }}.</td>
          <td colspan="4" class="desc-col" style="font-weight: bold">{{ $section['sectionTitle'] }}</td>
        </tr>
        @foreach($section['items'] as $item)
        <tr>
          <td class="no-col"></td>
          <td class="desc-col check-item" style="border-left: 1px solid black">
            {{ $item['description'] }}
          </td>
          <td class="check-col">{{ $item['normal'] ? '✓' : '' }}</td>
          <td class="check-col">{{ $item['error'] ? '✓' : '' }}</td>
          <td>{{ $item['information'] ?? '' }}</td>
        </tr>
        @endforeach
        <tr class="spacer-row" style="height: 20px">
          <td colspan="5"></td>
        </tr>
        @endforeach

        {{-- Special fields for Printer category --}}
        @if($record->template->category === 'printer')
        {{-- Ink/Toner/Ribbon type --}}
        @if(isset($record->template->special_fields['ink_toner_ribbon']))
        <tr class="title-row">
          <td class="no-col" style="font-weight: bold">{{ $sectionNum++ }}.</td>
          <td colspan="4" class="desc-col" style="font-weight: bold">Ink/Toner/Ribbon type</td>
        </tr>
        @foreach($record->template->special_fields['ink_toner_ribbon'] as $color)
        <tr>
          <td class="no-col"></td>
          <td class="desc-col check-item" style="border-left: 1px solid black"></td>
          <td colspan="2" style="text-align: left; vertical-align: middle; padding-left: 10px;">
            {{ is_array($color) ? ($color['description'] ?? '') : $color }}
          </td>
          <td style="text-align: center">%</td>
        </tr>
        @endforeach
        <tr class="spacer-row" style="height: 20px">
          <td colspan="5"></td>
        </tr>
        @endif

        {{-- Stok tinta --}}
        @if(isset($record->template->special_fields['stok_tinta']))
        <tr class="title-row">
          <td class="no-col" style="font-weight: bold">{{ $sectionNum++ }}.</td>
          <td colspan="4" class="desc-col" style="font-weight: bold">Stok tinta</td>
        </tr>
        @foreach($record->template->special_fields['stok_tinta'] as $stok)
        <tr>
          <td class="no-col"></td>
          <td class="desc-col check-item" style="border-left: 1px solid black">
            {{ is_array($stok) ? ($stok['description'] ?? '') : $stok }}
          </td>
          <td colspan="3" style="text-align: center; vertical-align: middle">
            1pcs
          </td>
        </tr>
        @endforeach
        <tr class="spacer-row" style="height: 20px">
          <td colspan="5"></td>
        </tr>
        @endif
        @endif

        <tr class="title-row notes-row">
          <td class="no-col"></td>
          <td colspan="4" class="desc-col" style="font-weight: bold">Notes</td>
        </tr>
        <tr>
          <td class="no-col"></td>
          <td colspan="4" style="padding: 15px; vertical-align: top">
            <div style="font-size: 11px; line-height: 1.6; min-height: 60px">
              {{ $record->notes }}
            </div>
          </td>
        </tr>
        <tr class="spacer-row" style="height: 20px">
          <td colspan="5"></td>
        </tr>
      </tbody>
    </table>

    <!-- Signature Section -->
    <table class="signature-table">
      <tr>
        <td style="padding-right: 20px;">
          <div style="margin-bottom: 0px; font-size: 12px; visibility: hidden;">Placeholder</div>
          <div class="signature-title">Person In Charge, SIG</div>
          <div class="signature-name">{{ is_array($record->template->device_fields) ? ($record->template->device_fields['admin_name'] ?? 'Admin') : ($record->template->device_fields ?? 'Admin') }}</div>
        </td>
        <td style="padding-left: 20px;">
          <div style="text-align: right; margin-bottom: 0px;margin-right: 60px; font-size: 12px;">{{ $record->device_data['location'] ?? 'Tuban' }}, {{ $date }}</div>
          <div class="signature-title">Officer Preventive Maintenance</div>
          <div class="signature-name">{{ $record->employee->name }}</div>
        </td>
      </tr>
    </table>
  </div>
</body>

</html>