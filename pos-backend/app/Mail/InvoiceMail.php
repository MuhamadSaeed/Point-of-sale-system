<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public Invoice $invoice;

    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }

    public function build()
    {
        // generate PDF
        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $this->invoice
        ]);

        return $this->subject('Your Invoice #' . $this->invoice->invoice_number)
            ->view('emails.invoice')
            ->attachData(
                $pdf->output(),
                'invoice-' . $this->invoice->invoice_number . '.pdf',
                [
                    'mime' => 'application/pdf',
                ]
            );
    }
}


