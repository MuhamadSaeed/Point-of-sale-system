<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    // daily report
    public function daily(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date'
        ]);

        $date = $request->date
            ? Carbon::parse($request->date)->startOfDay()
            : Carbon::today();

        $invoices = Invoice::whereDate('created_at', $date)
            ->where('status', 'paid')
            ->get();

        return response()->json([
            'success' => true,
            'date' => $date->toDateString(),
            'total_invoices' => $invoices->count(),
            'total_sales' => round($invoices->sum('total'), 2),
            'total_profit' => round($invoices->sum('profit'), 2),
        ]);
    }

    // monthly report
    public function monthly(Request $request)
    {
        $request->validate([
            'year'  => 'nullable|integer|min:2000',
            'month' => 'nullable|integer|min:1|max:12',
        ]);

        $year  = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;

        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth   = Carbon::create($year, $month, 1)->endOfMonth();

        $invoicesQuery = Invoice::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->where('status', 'paid');

        $totalInvoices = $invoicesQuery->count();
        $totalSales    = $invoicesQuery->sum('total');
        $totalProfit   = $invoicesQuery->sum('profit');

        // breakdown
        $dailyBreakdown = Invoice::selectRaw("
                DATE(created_at) as date,
                SUM(total) as sales,
                SUM(profit) as profit
            ")
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->where('status', 'paid')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'year' => $year,
            'month' => $month,
            'total_invoices' => $totalInvoices,
            'total_sales' => round($totalSales, 2),
            'total_profit' => round($totalProfit, 2),
            'daily_breakdown' => $dailyBreakdown,
        ]);
    }
}