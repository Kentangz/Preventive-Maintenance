<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaintenanceRecord extends Model
{
    protected $fillable = [
        'checklist_template_id',
        'category',
        'template_snapshot',
        'employee_id',
        'device_data',
        'checklist_responses',
        'stok_tinta_responses',
        'notes',
        'photo_path',
        'pdf_path',
        'status',
    ];

    protected $casts = [
        'device_data' => 'array',
        'template_snapshot' => 'array',
        'checklist_responses' => 'array',
        'stok_tinta_responses' => 'array',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(ChecklistTemplate::class, 'checklist_template_id')->withDefault(function () {
            // Return a default template object if template is deleted
            // This allows PDF generation to work even if template is deleted
            return null;
        });
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(MaintenancePhoto::class);
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(MaintenanceApproval::class);
    }

    public function latestApproval()
    {
        return $this->hasOne(MaintenanceApproval::class)->latestOfMany();
    }
}
