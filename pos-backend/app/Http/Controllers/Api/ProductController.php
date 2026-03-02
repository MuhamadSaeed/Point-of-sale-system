<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // $query = Product::query();
    // $query->where('branch_id', auth()->user()->branch_id);
    
    // list
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->paginate(20),
        ]);
    }

    // craeet
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        $product = Product::create([
            'name' => $request->name,
            'purchase_price' => $request->purchase_price,
            'sale_price' => $request->sale_price,
            'stock' => $request->stock,
            'branch_id' => auth()->user()->branch_id,
        ]);


        return response()->json([
            'success' => true,
            'data' => $product,
        ], 201);
    }

    // update
    public function update(Request $request, $id)
    {
        $product = Product::where('id', $id)
            ->where('branch_id', auth()->user()->branch_id)
            ->firstOrFail();

        $request->validate([
            'name' => 'required|string|max:255',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        $product->update($request->only([
            'name',
            'purchase_price',
            'sale_price',
            'stock',
        ]));

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    // delete
    public function destroy($id)
    {
        $product = Product::where('id', $id)
            ->where('branch_id', auth()->user()->branch_id)
            ->firstOrFail();

        try {
            $product->delete();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete product linked to invoices'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    public function show($id)
    {
        $product = Product::where('id', $id)
            ->where('branch_id', auth()->user()->branch_id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }


}