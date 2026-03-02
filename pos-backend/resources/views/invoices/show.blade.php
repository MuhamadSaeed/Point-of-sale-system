<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>الفاتورة</title>

    <style>
        body {
            font-family: "DejaVu Sans", Arial, sans-serif;
            font-size: 14px;
            direction: rtl;
            text-align: right;
        }

        h2 {
            margin-bottom: 5px;
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
            text-align: right; /* علشان الأرقام تبقى مرتبة */
        }

        .print-btn {
            margin-bottom: 15px;
        }
    </style>
</head>
<body>

<button class="print-btn" onclick="window.print()">طباعة</button>

<h2>فاتورة رقم #{{ $invoice->invoice_number }}</h2>

<p>
    <strong>التاريخ:</strong> {{ $invoice->created_at->format('Y-m-d H:i') }}<br>
    <strong>الكاشير:</strong> {{ $invoice->user->name }}<br>
    <strong>الفرع:</strong> {{ $invoice->branch?->name ?? '-' }}<br>
    <strong>الحالة:</strong> {{ ucfirst($invoice->status) }}<br>
    <strong>طريقة الدفع:</strong> {{ $invoice->payment_method ?? '-' }}
</p>

@if($invoice->customer)
    <p>
        <strong>العميل:</strong> {{ $invoice->customer->name }}<br>
        <strong>الهاتف:</strong> {{ $invoice->customer->phone ?? '-' }}
    </p>
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
    <p>الإجمالي قبل الخصم: {{ number_format($invoice->subtotal, 2) }}</p>
    <p>الخصم: {{ number_format($invoice->discount, 2) }}</p>
    <h3>الإجمالي النهائي: {{ number_format($invoice->total, 2) }}</h3>
</div>

</body>
</html>