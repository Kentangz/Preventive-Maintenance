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
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_template_id')->constrained()->onDelete('cascade');
            $table->foreignId('employee_id')->constrained()->onDelete('cascade'); // User/pegawai yang melakukan maintenance
            $table->json('device_data'); // Device, ID Tagging Asset, OpCo, Merk/Type, Serial Number, Location
            $table->json('checklist_responses'); // Array of responses untuk setiap item checklist
            $table->text('notes'); // Catatan dari user
            $table->string('photo_path')->nullable(); // Foto perangkat setelah maintenance
            $table->enum('status', ['draft', 'completed'])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_records');
    }
};
