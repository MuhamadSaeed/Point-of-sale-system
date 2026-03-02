<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Branch; 

class Product extends Model
{
    protected $fillable = [
        'name',
        'purchase_price',
        'sale_price',
        'stock',
        'branch_id',
    ];
    
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}


