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
        Schema::create('checklist_templates', function (Blueprint $table) {
            $table->id();
            $table->enum('category', ['printer', 'switch', 'vvip']); // Kategori template
            $table->string('name'); // Nama template (optional)
            $table->json('device_fields'); // Device, ID Tagging Asset, OpCo, Merk/Type, Serial Number, Location
            $table->json('configuration_items'); // PC, etc.
            $table->json('special_fields'); // Ink/Toner/Ribbon (printer only), Stok Tinta (printer only)
            $table->boolean('is_active')->default(true); // Status aktif/tidak aktif
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checklist_templates');
    }
};
