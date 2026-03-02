<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('branch_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete()
                ->index();
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });
    }
};
