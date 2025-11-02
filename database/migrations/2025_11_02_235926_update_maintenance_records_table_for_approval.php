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
        // Update status enum to include pending, accepted, rejected
        DB::statement("ALTER TABLE maintenance_records MODIFY COLUMN status ENUM('draft', 'completed', 'pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending'");
        
        // Add pdf_path field for storing final PDF with signatures
        Schema::table('maintenance_records', function (Blueprint $table) {
            $table->string('pdf_path')->nullable()->after('photo_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_records', function (Blueprint $table) {
            $table->dropColumn('pdf_path');
        });
        
        // Revert status enum
        DB::statement("ALTER TABLE maintenance_records MODIFY COLUMN status ENUM('draft', 'completed') NOT NULL DEFAULT 'draft'");
    }
};

