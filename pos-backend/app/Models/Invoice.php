<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Branch;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'user_id',
        'customer_id',
        'branch_id',
        'subtotal',
        'discount',
        'total',
        'status',
        'profit',
        'payment_method',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }
    
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}

