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
        Schema::create('checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_template_id')->constrained()->onDelete('cascade');
            $table->string('title'); // Judul section (contoh: "Check Device Functions")
            $table->json('columns'); // Array of column headers (contoh: ["No", "Description", "Normal", "Error", "Information"])
            $table->json('items'); // Array of items dengan description, normal, error, information
            $table->integer('order')->default(0); // Urutan item
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checklist_items');
    }
};
