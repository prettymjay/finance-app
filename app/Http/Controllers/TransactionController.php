<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Transaction;

class TransactionController extends Controller
{
    //

    public function index()
    {
        return Inertia::render('Transaction/Transaction'); //react component nga naa under sa pages nga folder
    }

    public function getTransactions()
    {
        $transactions = Transaction::with(['category'])->get();

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'reference_no' => 'required|string',
            'transaction_type' => 'required|in:income,expense',
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $transaction = Transaction::create([
            'category_id' => $request->category_id,
            'reference_no' => $request->reference_no,
            'transaction_type' => $request->transaction_type,
            'transaction_date' => $request->transaction_date,
            'amount' => $request->amount,
            'description' => $request->description,
        ]);

        return response()->json($transaction, 201);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'reference_no' => 'required|string',
            'transaction_type' => 'required|in:income,expense',
            'transaction_date' => 'required|date',
            'amount' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $transaction->update([
            'category_id' => $request->category_id,
            'reference_no' => $request->reference_no,
            'transaction_type' => $request->transaction_type,
            'transaction_date' => $request->transaction_date,
            'amount' => $request->amount,
            'description' => $request->description,
        ]);

        return response()->json($transaction);
    }

    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();

        return response()->json(null, 204);
    }

    public function print(Request $request)
    {
        $query = Transaction::with('category');

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('transaction_date', [
                $request->start_date,
                $request->end_date,
            ]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('transaction_date', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->whereDate('transaction_date', '<=', $request->end_date);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $transactions = $query->orderBy('transaction_date')->get();

        return response()->json($transactions);
    }
}
