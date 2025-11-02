<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('maintenance_records', function (Blueprint $table) {
            // Add category field to store category directly (so records are independent from template)
            $table->string('category')->nullable()->after('checklist_template_id');
            // Add template snapshot to store template structure (for PDF generation even if template is deleted)
            $table->json('template_snapshot')->nullable()->after('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('maintenance_records', function (Blueprint $table) {
            $table->dropColumn(['category', 'template_snapshot']);
        });
    }
};
