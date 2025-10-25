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
        Schema::create('maintenance_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_record_id')->constrained()->onDelete('cascade');
            $table->string('photo_type'); // 'device' (foto perangkat) atau 'pic_proof' (bukti PIC)
            $table->string('photo_path'); // Path ke file foto
            $table->json('employee_data')->nullable(); // Data pegawai (nama, foto, signature) untuk PIC proof
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_photos');
    }
};
