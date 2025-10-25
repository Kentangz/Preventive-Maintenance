<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenancePhoto extends Model
{
    protected $fillable = [
        'maintenance_record_id',
        'photo_type',
        'photo_path',
        'employee_data',
    ];

    protected $casts = [
        'employee_data' => 'array',
    ];

    public function maintenanceRecord(): BelongsTo
    {
        return $this->belongsTo(MaintenanceRecord::class, 'maintenance_record_id');
    }
}
