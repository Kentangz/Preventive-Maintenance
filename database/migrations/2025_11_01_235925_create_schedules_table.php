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
        if (!Schema::hasTable('schedules')) {
            Schema::create('schedules', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('document_path')->nullable();
                $table->string('document_name')->nullable();
                $table->string('document_type')->nullable();
                $table->integer('document_size')->nullable();
                $table->timestamps();
            });
        } else {
            // Table exists, just add missing column if needed
            Schema::table('schedules', function (Blueprint $table) {
                if (!Schema::hasColumn('schedules', 'schedule_date')) {
                    $table->date('schedule_date')->nullable()->after('description');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
