<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ReportController;

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// ================= USERS =================
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']); 
    Route::put('/users/{id}', [UserController::class, 'update']); 
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});


// ================= PRODUCTS =================
Route::middleware('auth:sanctum')->prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/{id}', [ProductController::class, 'show']);
    
    Route::middleware('role:admin')->group(function () {
        Route::post('/', [ProductController::class, 'store']);
        Route::put('/{id}', [ProductController::class, 'update']);
        Route::delete('/{id}', [ProductController::class, 'destroy']);
    });
});

// ================= CUSTOMERS =================
Route::middleware('auth:sanctum')->prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index']);
    Route::post('/', [CustomerController::class, 'store']);

    Route::get('/{id}', [CustomerController::class, 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::put('/{id}', [CustomerController::class, 'update']);
        Route::delete('/{id}', [CustomerController::class, 'destroy']);
    });
});

// ================= INVOICES =================
Route::middleware('auth:sanctum')->prefix('invoices')->group(function () {

    Route::get('/', [InvoiceController::class, 'index']);
    Route::post('/', [InvoiceController::class, 'store']);

    Route::post('/{invoice}/items', [InvoiceController::class, 'addItems']);
    Route::post('/{invoice}/discount', [InvoiceController::class, 'applyDiscount']);
    Route::post('/{invoice}/pay', [InvoiceController::class, 'markAsPaid']);

    Route::get('/{invoice}/print', [InvoiceController::class, 'print']);
    Route::get('/{invoice}/pdf', [InvoiceController::class, 'pdf']);
    Route::post('/{invoice}/send-email', [InvoiceController::class, 'sendByEmail']);

    Route::get('/{invoice}', [InvoiceController::class, 'show']);
});


// ================= REPORTS (ADMIN ONLY) =================
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/reports/daily', [ReportController::class, 'daily']);
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
});