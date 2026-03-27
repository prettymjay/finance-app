import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

interface MonthlySeriesItem {
    label: string;
    income: number;
    expense: number;
}

interface AllocationItem {
    label: string;
    value: number;
}

interface Summary {
    total_income: number;
    total_expense: number;
    balance: number;
    transaction_count: number;
    income_allocation: AllocationItem[];
    monthly_series: MonthlySeriesItem[];
}

const formatCurrency = (value: number) => `PHP ${value.toLocaleString()}`;
const donutColors = ['#1d4ed8', '#a16207', '#15803d', '#dc2626', '#7c3aed', '#0f766e'];

export default function Dashboard({ auth }: PageProps) {
    const [summary, setSummary] = useState<Summary>({
        total_income: 0,
        total_expense: 0,
        balance: 0,
        transaction_count: 0,
        income_allocation: [],
        monthly_series: [],
    });

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await axios.get('/dashboard-summary');
            setSummary(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const maxMonthlyValue = useMemo(() => {
        const allValues = summary.monthly_series.flatMap((item) => [item.income, item.expense]);
        return Math.max(...allValues, 1);
    }, [summary.monthly_series]);

    const donutStyle = useMemo(() => {
        const total = summary.income_allocation.reduce((sum, item) => sum + item.value, 0);

        if (!total) {
            return {
                background: 'conic-gradient(#cbd5e1 0deg 360deg)',
            };
        }

        let current = 0;
        const stops = summary.income_allocation.map((item, index) => {
            const start = current;
            const angle = (item.value / total) * 360;
            current += angle;
            return `${donutColors[index % donutColors.length]} ${start}deg ${current}deg`;
        });

        return {
            background: `conic-gradient(${stops.join(', ')})`,
        };
    }, [summary.income_allocation]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <div className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 p-8 shadow-sm min-h-[320px] flex flex-col">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">Total Income</p>
                            <h3 className="mt-6 min-h-[120px] text-5xl font-semibold tracking-tight text-emerald-950 leading-[0.95] flex items-start">
                                {formatCurrency(summary.total_income)}
                            </h3>
                            <p className="mt-auto pt-6 text-sm text-emerald-800">Cash inflow from all recorded income categories</p>
                        </div>

                        <div className="rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-100/70 p-8 shadow-sm min-h-[320px] flex flex-col">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-700">Total Expense</p>
                            <h3 className="mt-6 min-h-[120px] text-5xl font-semibold tracking-tight text-rose-950 leading-[0.95] flex items-start">
                                {formatCurrency(summary.total_expense)}
                            </h3>
                            <p className="mt-auto pt-6 text-sm text-rose-800">Outgoing funds across all expense transactions</p>
                        </div>

                        <div className="rounded-[2rem] border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-sky-100/70 p-8 shadow-sm min-h-[320px] flex flex-col">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">Final Balance</p>
                            <h3 className="mt-6 min-h-[120px] text-5xl font-semibold tracking-tight text-sky-950 leading-[0.95] flex items-start">
                                {formatCurrency(summary.balance)}
                            </h3>
                            <p className="mt-auto pt-6 text-sm text-sky-800">Net position after deducting all expenses</p>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100/70 p-8 shadow-sm min-h-[320px] flex flex-col">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600">Transactions</p>
                            <h3 className="mt-6 min-h-[120px] text-5xl font-semibold tracking-tight text-slate-950 leading-[0.95] flex items-start">
                                {summary.transaction_count.toLocaleString()}
                            </h3>
                            <p className="mt-auto pt-6 text-sm text-slate-600">Total records included in the dashboard summary</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">
                        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <p className="text-sm font-semibold tracking-tight text-blue-900">Income Allocation</p>

                            <div className="mt-6 flex justify-center">
                                <div
                                    className="relative h-40 w-40 rounded-full"
                                    style={donutStyle}
                                >
                                    <div className="absolute inset-[22px] rounded-full bg-white flex items-center justify-center text-center">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Income</p>
                                            <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                                                {formatCurrency(summary.total_income)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {summary.income_allocation.length > 0 ? (
                                    summary.income_allocation.map((item, index) => (
                                        <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: donutColors[index % donutColors.length] }}
                                                />
                                                <span className="truncate text-slate-700">{item.label}</span>
                                            </div>
                                            <span className="font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">No income allocation data yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                                        Monthly Overview
                                    </p>
                                    <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                                        Income and Expense Bar Graph
                                    </h3>
                                </div>
                                <div className="flex gap-4 text-sm text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                                        Income
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-rose-500" />
                                        Expense
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-end min-h-[340px]">
                                {summary.monthly_series.map((item) => (
                                    <div key={item.label} className="flex flex-col justify-end h-full rounded-3xl bg-slate-50 px-4 py-5">
                                        <div className="flex items-end justify-center gap-3 h-56">
                                            <div className="flex flex-col items-center justify-end h-full">
                                                <div
                                                    className="w-11 rounded-t-[1rem] bg-emerald-500 shadow-sm"
                                                    style={{ height: `${(item.income / maxMonthlyValue) * 100}%` }}
                                                />
                                                <span className="mt-3 text-xs font-medium text-slate-500">Income</span>
                                            </div>
                                            <div className="flex flex-col items-center justify-end h-full">
                                                <div
                                                    className="w-11 rounded-t-[1rem] bg-rose-500 shadow-sm"
                                                    style={{ height: `${(item.expense / maxMonthlyValue) * 100}%` }}
                                                />
                                                <span className="mt-3 text-xs font-medium text-slate-500">Expense</span>
                                            </div>
                                        </div>
                                        <div className="mt-5 text-center">
                                            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {formatCurrency(item.income)} / {formatCurrency(item.expense)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
