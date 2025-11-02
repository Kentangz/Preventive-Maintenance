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
        // Drop existing foreign key constraint
        Schema::table('maintenance_records', function (Blueprint $table) {
            $table->dropForeign(['checklist_template_id']);
        });
        
        // Make checklist_template_id nullable (if not already)
        Schema::table('maintenance_records', function (Blueprint $table) {
            $table->foreignId('checklist_template_id')->nullable()->change();
        });
        
        // Re-add foreign key with SET NULL on delete (records remain even if template is deleted)
        Schema::table('maintenance_records', function (Blueprint $table) {
            $table->foreign('checklist_template_id')
                  ->references('id')
                  ->on('checklist_templates')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key
        Schema::table('maintenance_records', function (Blueprint $table) {
            $table->dropForeign(['checklist_template_id']);
        });
        
        // Re-add with cascade (original behavior)
        Schema::table('maintenance_records', function (Blueprint $table) {
            $table->foreign('checklist_template_id')
                  ->references('id')
                  ->on('checklist_templates')
                  ->onDelete('cascade');
        });
    }
};
