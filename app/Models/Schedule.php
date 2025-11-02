<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'title',
        'description',
        'document_path',
        'document_name',
        'document_type',
        'document_size',
    ];
}
