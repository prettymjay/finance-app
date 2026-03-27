import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps } from '@/types'
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import AddEditTransaction from './AddEditTransaction'
import PrintableReport from './PrintableReport'

interface Category {
  id: number
  name: string
}

interface TransactionType {
  id: number
  category_id: number
  category?: Category
  reference_no: string
  transaction_type: string
  transaction_date: string
  amount: number
  description: string
}

const Transaction = ({ auth }: PageProps) => {
  const [transactions, setTransactions] = useState<TransactionType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [editData, setEditData] = useState<TransactionType | null>(null)
  const [printData, setPrintData] = useState<TransactionType[]>([])
  const [printDateFrom, setPrintDateFrom] = useState('')
  const [printDateTo, setPrintDateTo] = useState('')
  const [searchCategory, setSearchCategory] = useState('')

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [])

  const normalizeDate = (value: string) => {
    if (!value) return ''
    return value.slice(0, 10)
  }

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/transaction/list')
      setTransactions(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories')
      setCategories(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      await axios.delete(`/transaction/${id}`)
      fetchTransactions()
    } catch (e) {
      console.error(e)
    }
  }

  const handlePrint = async () => {
    try {
      const res = await axios.get('/print-transactions', {
        params: {
          start_date: printDateFrom,
          end_date: printDateTo,
          category_id: searchCategory,
        },
      })

      setPrintData(res.data)
      setShowPrintModal(true)
    } catch (error) {
      console.error(error)
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchCategory = searchCategory ? String(t.category_id) === searchCategory : true
      return matchCategory
    })
  }, [transactions, searchCategory])

  const balanceSheet = useMemo(() => {
    const incomes = filteredTransactions.filter((t) => t.transaction_type === 'income')
    const expenses = filteredTransactions.filter((t) => t.transaction_type === 'expense')

    const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0)
    const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0)

    return {
      incomes,
      expenses,
      totalIncome,
      totalExpense,
      finalBalance: totalIncome - totalExpense,
    }
  }, [filteredTransactions])

  let runningBalance = 0

  return (
    <AuthenticatedLayout user={auth.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Print
            </button>
            <button
              onClick={() => {
                setEditData(null)
                setShowModal(true)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Add Transaction
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col lg:flex-row lg:flex-wrap gap-3">
          <input
            type="date"
            value={printDateFrom}
            onChange={(e) => setPrintDateFrom(e.target.value)}
            className="border rounded-lg px-3 py-2"
            title="Print Date From"
            aria-label="Print Date From"
          />

          <input
            type="date"
            value={printDateTo}
            onChange={(e) => setPrintDateTo(e.target.value)}
            className="border rounded-lg px-3 py-2"
            title="Print Date To"
            aria-label="Print Date To"
          />

          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setPrintDateFrom('')
              setPrintDateTo('')
              setSearchCategory('')
            }}
            className="bg-gray-300 px-4 py-2 rounded-lg"
          >
            Reset
          </button>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-6">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Reference</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">RunningBalance</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t, i) => {
                      runningBalance += t.transaction_type === 'income' ? Number(t.amount) : -Number(t.amount)

                      return (
                        <tr key={t.id} className="border-t">
                          <td className="px-3 py-2">{i + 1}</td>
                          <td className="px-3 py-2">{t.category?.name || 'N/A'}</td>
                          <td className="px-3 py-2">{t.reference_no}</td>
                          <td className={t.transaction_type === 'income' ? 'text-green-600 px-3 py-2' : 'text-red-600 px-3 py-2'}>
                            {t.transaction_type}
                          </td>
                          <td className="px-3 py-2">{normalizeDate(t.transaction_date)}</td>
                          <td className="px-3 py-2">PHP {Number(t.amount).toLocaleString()}</td>
                          <td className="px-3 py-2 font-semibold">PHP {runningBalance.toLocaleString()}</td>
                          <td className="px-3 py-2 flex gap-2">
                            <button
                              onClick={() => {
                                setEditData(t)
                                setShowModal(true)
                              }}
                              className="bg-yellow-400 px-2 py-1 rounded"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(t.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.1fr_1fr_1fr] gap-6">
          <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Balance Sheet
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
              PHP {balanceSheet.finalBalance.toLocaleString()}
            </h2>

            <table className="mt-6 w-full border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-3 text-slate-600">Total Income</td>
                  <td className="py-3 text-right font-semibold text-emerald-700">
                    PHP {balanceSheet.totalIncome.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-3 text-slate-600">Total Expense</td>
                  <td className="py-3 text-right font-semibold text-rose-700">
                    PHP {balanceSheet.totalExpense.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900">Final Balance</td>
                  <td className="py-3 text-right font-semibold text-slate-900">
                    PHP {balanceSheet.finalBalance.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 shadow-md rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Income Sheet
              </p>
              <span className="text-sm font-semibold text-emerald-900">
                PHP {balanceSheet.totalIncome.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              {balanceSheet.incomes.length > 0 ? (
                balanceSheet.incomes.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-b border-emerald-200/70 pb-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.category?.name || 'N/A'}</p>
                      <p className="text-xs text-slate-500">
                        {item.reference_no} | {normalizeDate(item.transaction_date)}
                      </p>
                    </div>
                    <span className="font-semibold text-emerald-900">
                      PHP {Number(item.amount).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No income transactions found.</p>
              )}
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 shadow-md rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
                Expense Sheet
              </p>
              <span className="text-sm font-semibold text-rose-900">
                PHP {balanceSheet.totalExpense.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              {balanceSheet.expenses.length > 0 ? (
                balanceSheet.expenses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-b border-rose-200/70 pb-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.category?.name || 'N/A'}</p>
                      <p className="text-xs text-slate-500">
                        {item.reference_no} | {normalizeDate(item.transaction_date)}
                      </p>
                    </div>
                    <span className="font-semibold text-rose-900">
                      PHP {Number(item.amount).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No expense transactions found.</p>
              )}
            </div>
          </div>
        </div>

        {showModal && (
          <AddEditTransaction
            onClose={() => setShowModal(false)}
            onSuccess={fetchTransactions}
            editData={editData}
          />
        )}

        {showPrintModal && (
          <PrintableReport
            data={printData}
            dateFrom={printDateFrom}
            dateTo={printDateTo}
            onClose={() => setShowPrintModal(false)}
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}

export default Transaction
