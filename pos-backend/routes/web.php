<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InvoicePdfController;

Route::get('/', function () {
    return view('welcome');
});

