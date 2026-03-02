<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>فاتورة</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px; direction:rtl; text-align:right;">

    <div style="max-width:600px; margin:auto; background:#ffffff; padding:20px; border-radius:8px;">

        <h2 style="margin-top:0;">فاتورة رقم #{{ $invoice->invoice_number }}</h2>

        <p>
            مرحباً {{ $invoice->customer?->name ?? 'عميلنا العزيز' }}،
        </p>

        <p>
            شكراً لشرائك من متجرنا. مرفق مع هذه الرسالة نسخة من الفاتورة بصيغة PDF.
        </p>

        <hr>

        <p><strong>الإجمالي قبل الخصم:</strong> {{ number_format($invoice->subtotal, 2) }} جنيه</p>
        <p><strong>الخصم:</strong> {{ number_format($invoice->discount, 2) }} جنيه</p>
        <p><strong>الإجمالي النهائي:</strong> {{ number_format($invoice->total, 2) }} جنيه</p>
        <p><strong>الحالة:</strong> {{ ucfirst($invoice->status) }}</p>

        <br>

        <p>
            مع تحياتنا،<br>
            <strong>{{ config('app.name') }}</strong><br>
        </p>

    </div>

</body>
</html>