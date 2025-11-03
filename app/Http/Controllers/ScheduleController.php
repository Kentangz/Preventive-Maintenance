<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends Controller
{
    /**
     * Get all schedules
     */
    public function index(Request $request): JsonResponse
    {
        $schedules = Schedule::with('user')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    /**
     * Get single schedule
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $schedule
        ]);
    }

    /**
     * Create schedule
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'document' => 'nullable|file', 
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle document upload
        $documentPath = null;
        $documentName = null;
        $documentType = null;
        $documentSize = null;

        $data = $request->only(['title','description']);
        $data['user_id'] = Auth::id();

        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $documentPath = $file->store('schedule_documents', 'public');
            $documentName = $file->getClientOriginalName();
            $documentType = $file->getMimeType();
            $documentSize = $file->getSize();
        }

        // Create schedule
        $schedule = Schedule::create([
            'title' => $request->title,
            'description' => $request->description,
            'document_path' => $documentPath,
            'document_name' => $documentName,
            'document_type' => $documentType,
            'document_size' => $documentSize,
            'user_id' => $data['user_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Schedule created successfully',
            'data' => $schedule
        ], 201);
    }

    /**
     * Update schedule
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'document' => 'nullable|file',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle document upload if new file is provided
        if ($request->hasFile('document')) {
            // Delete old document if exists
            if ($schedule->document_path && Storage::disk('public')->exists($schedule->document_path)) {
                Storage::disk('public')->delete($schedule->document_path);
            }

            $file = $request->file('document');
            $documentPath = $file->store('schedule_documents', 'public');
            $documentName = $file->getClientOriginalName();
            $documentType = $file->getMimeType();
            $documentSize = $file->getSize();

            $schedule->update([
                'title' => $request->title ?? $schedule->title,
                'description' => $request->description ?? $schedule->description,
                'document_path' => $documentPath,
                'document_name' => $documentName,
                'document_type' => $documentType,
                'document_size' => $documentSize,
            ]);
        } else {
            // Update without document
            $schedule->update($request->only([
                'title',
                'description'
            ]));
        }

        return response()->json([
            'success' => true,
            'message' => 'Schedule updated successfully',
            'data' => $schedule
        ]);
    }

    /**
     * Delete schedule
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found'
            ], 404);
        }

        // Delete document if exists
        if ($schedule->document_path && Storage::disk('public')->exists($schedule->document_path)) {
            Storage::disk('public')->delete($schedule->document_path);
        }

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Schedule deleted successfully'
        ]);
    }

    /**
     * Download schedule document
     */
    public function downloadDocument(Request $request, int $id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found'
            ], 404);
        }

        if (!$schedule->document_path || !Storage::disk('public')->exists($schedule->document_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        $filePath = Storage::disk('public')->path($schedule->document_path);
        $fileName = $schedule->document_name ?: basename($schedule->document_path);

        return response()->download($filePath, $fileName);
    }
}