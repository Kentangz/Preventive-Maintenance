<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify enum to add new categories
        DB::statement("ALTER TABLE checklist_templates MODIFY COLUMN category ENUM('printer', 'switch', 'vvip', 'pc_desktop', 'access_point') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum values
        DB::statement("ALTER TABLE checklist_templates MODIFY COLUMN category ENUM('printer', 'switch', 'vvip') NOT NULL");
    }
};
