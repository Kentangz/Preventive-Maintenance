<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChecklistController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Admin Authentication Routes
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'adminLogin']);
    Route::post('/logout', [AuthController::class, 'adminLogout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'getCurrentAdmin'])->middleware('auth:sanctum');
    Route::patch('/profile', [AuthController::class, 'updateAdminProfile'])->middleware('auth:sanctum');
});

// Employee Authentication Routes
Route::prefix('employee')->group(function () {
    Route::post('/auth', [AuthController::class, 'employeeAuth']);
    Route::post('/logout', [AuthController::class, 'employeeLogout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'getCurrentEmployee'])->middleware('auth:sanctum');
    Route::patch('/profile', [AuthController::class, 'updateEmployeeProfile'])->middleware('auth:sanctum');
});

// Checklist Routes (Admin & Employee)
Route::middleware('auth:sanctum')->group(function () {
    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::get('/checklist-templates', [ChecklistController::class, 'getTemplates']); // List all templates
        Route::get('/checklist-templates/{category}', [ChecklistController::class, 'getTemplatesByCategory']); // Filter by category
        Route::post('/checklist-templates', [ChecklistController::class, 'createTemplate']);
        Route::get('/checklist-templates/{id}', [ChecklistController::class, 'getTemplate']);
        Route::put('/checklist-templates/{id}', [ChecklistController::class, 'updateTemplate']);
        Route::delete('/checklist-templates/{id}', [ChecklistController::class, 'deleteTemplate']);
        Route::get('/maintenance-records', [ChecklistController::class, 'getMaintenanceRecords']); // List maintenance records for admin
    });

    // Employee Routes
    Route::prefix('employee')->group(function () {
        Route::get('/checklist-templates/{category}', [ChecklistController::class, 'getActiveTemplatesByCategory']); // Get active templates for employee
        Route::post('/maintenance-records', [ChecklistController::class, 'createMaintenanceRecord']);
        Route::get('/maintenance-records', [ChecklistController::class, 'getMyMaintenanceRecords']); // Get employee's own records
    });

    // PDF Generation (Both admin and employee)
    Route::get('/maintenance-records/{id}/pdf', [ChecklistController::class, 'generatePDF']);
});
