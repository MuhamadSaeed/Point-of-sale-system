<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // list
    public function index(Request $request)
    {
        $query = User::select('id', 'name', 'email', 'role', 'branch_id');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }


    // show
    public function show($id)
    {
        $user = User::select('id', 'name', 'email', 'role', 'branch_id')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    // craete
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,cashier',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'branch_id' => $request->branch_id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $user->only('id','name','email','role','branch_id'),
        ], 201);
    }

    // update
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|required|in:admin,cashier',
            'branch_id' => 'nullable|exists:branches,id',
        ]);

        $data = $request->only(['name', 'email', 'role', 'branch_id']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'data' => $user->only('id','name','email','role','branch_id'),
        ]);
    }

    //delete
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // prevent deleting yourself
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account',
            ], 403);
        }

        // prevent deleting last admin
        if ($user->role === 'admin' && User::where('role','admin')->count() <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'System must have at least one admin',
            ], 403);
        }

        // prevent deleting user with invoices
        if ($user->invoices()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete user with existing invoices',
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }
}
