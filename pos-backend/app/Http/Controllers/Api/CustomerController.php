<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    //list
    public function index(Request $request)
    {
        $query = Customer::query();

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('phone', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->paginate(20),
        ]);
    }

    // craete
    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:customers,email',
        ]);

        $customer = Customer::create($request->only([
            'name',
            'phone',
            'email',
        ]));

        return response()->json([
            'success' => true,
            'data' => $customer,
        ], 201);
    }

    //update
    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $request->validate([
            'name'  => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:customers,email,' . $customer->id,
        ]);

        $customer->update($request->only([
            'name',
            'phone',
            'email',
        ]));

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }

    // delete
    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);

        if ($customer->invoices()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete customer with invoices'
            ], 400);
        }

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer deleted successfully',
        ]);
    }

    // show
    public function show($id)
    {
        $customer = Customer::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }

}