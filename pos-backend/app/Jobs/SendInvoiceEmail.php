<?php

namespace App\Jobs;

use App\Mail\InvoiceMail;
use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendInvoiceEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $invoiceId;
    public string $email;

    public function __construct(int $invoiceId, string $email)
    {
        $this->invoiceId = $invoiceId;
        $this->email = $email;
    }

    public function handle(): void
    {
        $invoice = Invoice::with([
            'items.product',
            'customer',
            'user',
        ])->findOrFail($this->invoiceId);

        Mail::to($this->email)->send(
            new InvoiceMail($invoice)
        );
    }
}
