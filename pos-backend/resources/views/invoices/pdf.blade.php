<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
    body {
        font-family: dejavusans;
        direction: rtl;
        text-align: right;
        font-size: 14px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
    }

    table, th, td {
        border: 1px solid #000;
    }

    th, td {
        padding: 8px;
        text-align: right;
    }

    .totals {
        margin-top: 20px;
        text-align: right;
    }
</style>
</head>
<body>

<h2>فاتورة رقم #{{ $invoice->invoice_number }}</h2>

<div class="info">
    التاريخ: {{ $invoice->created_at->format('Y-m-d H:i') }} <br>
    الكاشير: {{ $invoice->user->name }} <br>
    طريقة الدفع: {{ $invoice->payment_method ?? '-' }}
</div>

@if($invoice->customer)
<div class="info">
    العميل: {{ $invoice->customer->name }} <br>
    الهاتف: {{ $invoice->customer->phone ?? '-' }}
</div>
@endif

<table>
    <thead>
        <tr>
            <th>المنتج</th>
            <th>السعر</th>
            <th>الكمية</th>
            <th>الإجمالي</th>
        </tr>
    </thead>
    <tbody>
        @foreach($invoice->items as $item)
        <tr>
            <td>{{ $item->product->name }}</td>
            <td>{{ number_format($item->price, 2) }}</td>
            <td>{{ $item->quantity }}</td>
            <td>{{ number_format($item->total, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<div class="totals">
    الإجمالي قبل الخصم: {{ number_format($invoice->subtotal, 2) }} <br>
    الخصم: {{ number_format($invoice->discount, 2) }} <br>
    <strong>الإجمالي النهائي: {{ number_format($invoice->total, 2) }}</strong>
</div>

</body>
</html>