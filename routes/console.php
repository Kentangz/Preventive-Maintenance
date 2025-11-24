<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Artisan::command('logs:clear', function () {
//     foreach (glob(storage_path('logs/*.log')) as $file) {
//         file_put_contents($file, '');
//     }
//     $this->comment('Logs have been cleared!');
// });
