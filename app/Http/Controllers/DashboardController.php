<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller {

    public function index()
    {
        return inertia('Dashboard');
    }

    public function summary()
    {
        $totalIncome = Transaction::query()
            ->where('transaction_type', 'income')
            ->sum('amount');

        $totalExpense = Transaction::query()
            ->where('transaction_type', 'expense')
            ->sum('amount');

        $transactionCount = Transaction::query()->count();
        $incomeAllocation = Transaction::query()
            ->with('category')
            ->where('transaction_type', 'income')
            ->get()
            ->groupBy(fn ($transaction) => $transaction->category?->name ?? 'Uncategorized')
            ->map(function ($transactions, $categoryName) {
                return [
                    'label' => $categoryName,
                    'value' => (float) $transactions->sum('amount'),
                ];
            })
            ->sortByDesc('value')
            ->values();

        $monthlySeries = collect(range(5, 0, -1))
            ->map(function ($monthsAgo) {
                $date = Carbon::now()->subMonths($monthsAgo);

                return [
                    'label' => $date->format('M Y'),
                    'income' => (float) Transaction::query()
                        ->where('transaction_type', 'income')
                        ->whereYear('transaction_date', $date->year)
                        ->whereMonth('transaction_date', $date->month)
                        ->sum('amount'),
                    'expense' => (float) Transaction::query()
                        ->where('transaction_type', 'expense')
                        ->whereYear('transaction_date', $date->year)
                        ->whereMonth('transaction_date', $date->month)
                        ->sum('amount'),
                ];
            })
            ->push([
                'label' => Carbon::now()->format('M Y'),
                'income' => (float) Transaction::query()
                    ->where('transaction_type', 'income')
                    ->whereYear('transaction_date', Carbon::now()->year)
                    ->whereMonth('transaction_date', Carbon::now()->month)
                    ->sum('amount'),
                'expense' => (float) Transaction::query()
                    ->where('transaction_type', 'expense')
                    ->whereYear('transaction_date', Carbon::now()->year)
                    ->whereMonth('transaction_date', Carbon::now()->month)
                    ->sum('amount'),
            ])
            ->values();

        return response()->json([
            'total_income' => (float) $totalIncome,
            'total_expense' => (float) $totalExpense,
            'balance' => (float) ($totalIncome - $totalExpense),
            'transaction_count' => $transactionCount,
            'income_allocation' => $incomeAllocation,
            'monthly_series' => $monthlySeries,
        ]);
    }
}
