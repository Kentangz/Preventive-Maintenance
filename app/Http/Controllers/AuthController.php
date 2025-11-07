<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * Admin Login
     */
    public function adminLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->where('role', 'admin')->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user->last_login = now();
        $user->save();

        // Create Sanctum token
        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Employee Login/Authentication
     */
    public function employeeAuth(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'identity_photo' => 'required|image|mimes:jpeg,png,jpg',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle photo upload
        $photoPath = null;
        if ($request->hasFile('identity_photo')) {
            $photoPath = $request->file('identity_photo')->store('employee_photos', 'public');
        }

        // Create or update employee record
        $employee = Employee::create([
            'name' => $request->name,
            'identity_photo' => $photoPath,
            'session_id' => session()->getId(),
            'last_login' => now(),
        ]);

        // Create Sanctum token for employee
        $token = $employee->createToken('employee-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Authentication successful',
            'token' => $token,
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'identity_photo' => $photoPath,
            ]
        ]);
    }

    /**
     * Get current user (admin)
     */
    public function getCurrentAdmin(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'signature' => $user->signature,
            ]
        ]);
    }

    /**
     * Get current employee
     */
    public function getCurrentEmployee(Request $request): JsonResponse
    {
        $employee = $request->user();

        if (!$employee || !$employee instanceof Employee) {
            return response()->json([
                'success' => false,
                'message' => 'No active employee session'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'identity_photo' => $employee->identity_photo,
                'signature' => $employee->signature,
            ]
        ]);
    }

    /**
     * Update admin profile
     */
    public function updateAdminProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'signature' => 'nullable|image|mimes:jpeg,png,jpg',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->name = $request->name;
        $user->email = $request->email;

        // Handle signature upload
        if ($request->hasFile('signature')) {
            // Delete old signature if exists
            if ($user->signature && Storage::disk('public')->exists($user->signature)) {
                Storage::disk('public')->delete($user->signature);
            }
            $user->signature = $request->file('signature')->store('admin_signatures', 'public');
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'signature' => $user->signature,
            ]
        ]);
    }

    /**
     * Update employee profile
     */
    public function updateEmployeeProfile(Request $request): JsonResponse
    {
        $employee = $request->user();

        if (!$employee || !$employee instanceof Employee) {
            return response()->json([
                'success' => false,
                'message' => 'No active employee session'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'signature' => 'nullable|image|mimes:jpeg,png,jpg',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $employee->name = $request->name;

        // Handle signature upload
        if ($request->hasFile('signature')) {
            // Delete old signature if exists
            if ($employee->signature && Storage::disk('public')->exists($employee->signature)) {
                Storage::disk('public')->delete($employee->signature);
            }
            $employee->signature = $request->file('signature')->store('employee_signatures', 'public');
        }

        $employee->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'identity_photo' => $employee->identity_photo,
                'signature' => $employee->signature,
            ]
        ]);
    }

    /**
     * Logout admin
     */
    public function adminLogout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Logout employee
     */
    public function employeeLogout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}
