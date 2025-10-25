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

    .info-section {
      border: 1px solid black;
      margin: 15px 0;
      display: flex;
      gap: 0;
    }

    .info-left {
      width: 40%;
    }

    .info-right {
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

    .info-row {
      display: grid;
      grid-template-columns: 100px 1fr;
      margin: 5px 0;
      font-size: 12px;
    }

    .date-box {
      display: grid;
      grid-template-columns: 80px 1fr;
      border: 1px solid black;
      font-size: 12px;
    }

    .date-box .label {
      padding: 5px;
      text-align: center;
      border-right: 1px solid black;
    }

    .date-box .value {
      padding: 5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 11px;
    }

    table,
    th,
    td {
      border: 1px solid black;
    }

    th {
      background: #d3d3d3;
      padding: 4px;
      text-align: center;
      font-weight: bold;
    }

    td {
      padding: 4px 6px;
      vertical-align: top;
    }

    .no-col {
      width: 40px;
      text-align: center;
      border: none;
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

    .title-row td {
      border: none;
      padding: 4px 8px;
    }

    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      font-size: 12px;
    }

    .signature-box {
      text-align: center;
      width: 45%;
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

    <div class="title">CHECKLIST PREVENTIVE MAINTENANCE</div>

    <div class="info-section">
      <div class="info-left">
        <div class="info-header">Configurations Items</div>
        <div class="info-content">
          <div style="border-bottom: 1px solid black; padding-bottom: 2px; margin-bottom: 2px;">
            <div style="font-style: italic; color: #666; font-size: 11px">
              {{ $record->template->configuration_items[0] ?? 'PC' }}
            </div>
          </div>
          <div style="font-size: 11px; margin-bottom: 8px">Device</div>
          <div style="border-bottom: 1px solid black; padding-bottom: 2px; margin-bottom: 2px;">
            <div style="font-style: italic; color: #666; font-size: 11px">
              {{ $record->device_data['merk_type'] ?? '' }}
            </div>
          </div>
          <div style="font-size: 11px">Merk/ Type</div>
        </div>
      </div>

      <div class="info-right">
        <div class="date-box">
          <div class="label">Date</div>
          <div class="value" style="font-style: italic; color: #666">{{ $date }}</div>
        </div>
        <div style="padding: 10px">
          <div style="display: flex; gap: 20px; margin-bottom: 8px">
            <div style="flex: 1">
              <div style="border-bottom: 1px solid black; padding-bottom: 2px; margin-bottom: 2px;">
                <div style="font-style: italic; color: #666; font-size: 11px">
                  {{ $record->device_data['id_tagging_asset'] ?? '' }}
                </div>
              </div>
              <div style="font-size: 11px">ID Tagging Asset</div>
            </div>
            <div style="flex: 1">
              <div style="border-bottom: 1px solid black; padding-bottom: 2px; margin-bottom: 2px;">
                <div style="font-style: italic; color: #666; font-size: 11px">
                  {{ $record->device_data['opco'] ?? '' }}
                </div>
              </div>
              <div style="font-size: 11px">OpCo</div>
            </div>
          </div>
          <div style="display: flex; gap: 20px">
            <div style="flex: 1">
              <div style="border-bottom: 1px solid black; padding-bottom: 2px; margin-bottom: 2px;">
                <div style="font-style: italic; color: #666; font-size: 11px">
                  {{ $record->device_data['serial_number'] ?? '' }}
                </div>
              </div>
              <div style="font-size: 11px">Serial Number</div>
            </div>
            <div style="flex: 1">
              <div style="border-bottom: 1px solid black; padding-bottom: 2px; margin-bottom: 2px;">
                <div style="font-style: italic; color: #666; font-size: 11px">
                  {{ $record->device_data['location'] ?? '' }}
                </div>
              </div>
              <div style="font-size: 11px">Location</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <table>
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
        $itemNum = 1;
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
        <tr style="height: 20px">
          <td colspan="5" style="border: none"></td>
        </tr>
        @endforeach

        <tr class="title-row">
          <td class="no-col"></td>
          <td colspan="4" class="desc-col" style="font-weight: bold">Notes</td>
        </tr>
        <tr>
          <td class="no-col"></td>
          <td colspan="4" style="border-left: 1px solid black; padding: 15px; vertical-align: top">
            <div style="font-size: 11px; line-height: 1.6; min-height: 60px">
              {{ $record->notes }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="signature-section">
      <div class="signature-box">
        <div style="margin-bottom: 5px; font-size: 12px; visibility: hidden">Placeholder</div>
        <div class="signature-title">Person In Charge, SIG</div>
        <div class="signature-name">{{ $record->template->device_fields['admin_name'] ?? 'Admin' }}</div>
      </div>
      <div class="signature-box">
        <div class="date-location">{{ $record->device_data['location'] ?? 'Tuban' }}, {{ $date }}</div>
        <div class="signature-title">Officer Preventive Maintenance</div>
        <div class="signature-name">{{ $record->employee->name }}</div>
      </div>
    </div>
  </div>
</body>

</html>