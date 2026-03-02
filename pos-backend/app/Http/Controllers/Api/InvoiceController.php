<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Mpdf\Mpdf;
use App\Jobs\SendInvoiceEmail;

class InvoiceController extends Controller
{
    // craete
    public function store(Request $request)
    {
        $invoice = Invoice::create([
            'invoice_number' => Str::uuid(),
            'user_id' => auth()->id(),
            'customer_id' => $request->customer_id,
            'branch_id' => auth()->user()->branch_id,
            'subtotal' => 0,
            'discount' => 0,
            'total' => 0,
            'profit' => 0,
            'status' => 'open',
        ]);

        return response()->json([
            'success' => true,
            'data' => $invoice
        ], 201);
    }

    // add items
    public function addItems(Request $request, $invoiceId)
    {
        $invoice = Invoice::findOrFail($invoiceId);

        if ($invoice->status !== 'open') {
            return response()->json([
                'success' => false,
                'message' => 'Invoice closed'
            ], 403);
        }

        if (auth()->user()->role === 'cashier' && $invoice->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($data, $invoice) {

            foreach ($data['items'] as $item) {

                $product = Product::findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    abort(400, 'Not enough stock');
                }

                $profit = ($item['price'] - $product->purchase_price) * $item['quantity'];

                $invoice->items()->create([
                    'product_id' => $product->id,
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'total' => $item['price'] * $item['quantity'],
                    'profit' => $profit,
                ]);

                $product->decrement('stock', $item['quantity']);
            }

            $subtotal = $invoice->items()->sum('total');
            $profit   = $invoice->items()->sum('profit');

            $invoice->update([
                'subtotal' => $subtotal,
                'total'    => $subtotal,
                'profit'   => $profit,
            ]);
        });

        return response()->json(['success' => true]);
    }

    // discount
    public function applyDiscount(Request $request, Invoice $invoice)
    {
        if ($invoice->status !== 'open') {
            return response()->json([
                'success' => false,
                'message' => 'Invoice closed'
            ], 403);
        }

        if (auth()->user()->role === 'cashier' && $invoice->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'discount' => 'required|numeric|min:0'
        ]);

        if ($request->discount > $invoice->subtotal) {
            return response()->json([
                'success' => false,
                'message' => 'Discount exceeds subtotal'
            ], 400);
        }

        $ratio = $invoice->subtotal > 0
            ? $request->discount / $invoice->subtotal
            : 0;

        $invoice->update([
            'discount' => $request->discount,
            'total' => $invoice->subtotal - $request->discount,
            'profit' => max(0, $invoice->profit * (1 - $ratio)),
        ]);

        return response()->json([
            'success' => true,
            'data' => $invoice->fresh()
        ]);
    }

    // pay
    public function markAsPaid(Request $request, $invoiceId)
    {
        $invoice = Invoice::findOrFail($invoiceId);

        if ($invoice->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Invoice already paid'
            ], 400);
        }

        if (auth()->user()->role === 'cashier' && $invoice->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'payment_method' => 'required|in:cash,card,wallet'
        ]);

        $invoice->update([
            'status' => 'paid',
            'payment_method' => $request->payment_method,
        ]);

        return response()->json(['success' => true]);
    }

    // list
    public function index(Request $request)
    {
        $query = Invoice::with(['customer', 'user'])
            ->where('branch_id', auth()->user()->branch_id)
            ->latest();

        if (auth()->user()->role === 'cashier') {
            $query->where('user_id', auth()->id());
        }

        if ($request->search) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->date) {
            $query->whereDate('created_at', $request->date);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(10),
        ]);
    }

    // show
    public function show($id)
    {
        $invoice = Invoice::with(['items.product', 'customer', 'user'])
            ->findOrFail($id);

        if (auth()->user()->role === 'cashier' && $invoice->user_id !== auth()->id()) {
            return response()->json(['success' => false], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $invoice
        ]);
    }

    // print
    public function print($id)
    {
        $invoice = Invoice::with(['items.product', 'customer', 'user'])
            ->findOrFail($id);

        if (auth()->user()->role === 'cashier' && $invoice->user_id !== auth()->id()) {
            abort(403);
        }

        if ($invoice->status !== 'paid') {
            abort(403);
        }

        return view('invoices.show', compact('invoice'));
    }

    // pdf
    public function pdf($id)
    {
        $invoice = Invoice::with(['items.product', 'customer', 'user'])
            ->findOrFail($id);

        if (auth()->user()->role === 'cashier' && $invoice->user_id !== auth()->id()) {
            return response()->json(['success' => false], 403);
        }

        $html = view('invoices.pdf', compact('invoice'))->render();

        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'default_font' => 'dejavusans',
        ]);

        $mpdf->autoScriptToLang = true;
        $mpdf->autoLangToFont = true;
        $mpdf->SetDirectionality('rtl');

        $mpdf->WriteHTML($html);

        return response(
            $mpdf->Output('', 'S')
        )->header('Content-Type', 'application/pdf');
    }

    // email
    public function sendByEmail($id)
    {
        $invoice = Invoice::with(['customer'])
            ->findOrFail($id);

        if (auth()->user()->role === 'cashier' && $invoice->user_id !== auth()->id()) {
            return response()->json(['success' => false], 403);
        }

        if (!$invoice->customer?->email) {
            return response()->json([
                'success' => false,
                'message' => 'Customer has no email'
            ], 400);
        }

        SendInvoiceEmail::dispatch(
            $invoice->id,
            $invoice->customer->email
        );

        return response()->json(['success' => true]);
    }
}