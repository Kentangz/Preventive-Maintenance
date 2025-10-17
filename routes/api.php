<?php

use App\Http\Controllers\AuthController;
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
