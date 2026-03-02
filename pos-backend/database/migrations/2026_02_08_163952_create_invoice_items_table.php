<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('invoice_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->constrained()
                ->restrictOnDelete();

            $table->decimal('price', 10, 2);
            $table->integer('quantity');
            $table->decimal('total', 10, 2);
            $table->decimal('profit', 10, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('invoice_items');
    }
};
