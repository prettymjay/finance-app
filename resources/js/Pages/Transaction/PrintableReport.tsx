import React, { useMemo, useRef } from 'react'

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
}

interface Props {
  data: TransactionType[]
  dateFrom?: string
  dateTo?: string
  onClose: () => void
}

const formatCurrency = (value: number) => `PHP ${value.toLocaleString()}`

const PrintableReport = ({ data, dateFrom, dateTo, onClose }: Props) => {
  const printRef = useRef<HTMLDivElement>(null)

  const summary = useMemo(() => {
    let runningBalance = 0
    let totalIncome = 0
    let totalExpense = 0
    const incomes: TransactionType[] = []
    const expenses: TransactionType[] = []

    data.forEach((item) => {
      const amount = Number(item.amount)
      if (item.transaction_type === 'income') {
        totalIncome += amount
        runningBalance += amount
        incomes.push(item)
      } else {
        totalExpense += amount
        runningBalance -= amount
        expenses.push(item)
      }
    })

    return {
      totalIncome,
      totalExpense,
      finalBalance: runningBalance,
      incomes,
      expenses,
    }
  }, [data])

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML
    if (!printContents) return

    const printWindow = window.open('', '_blank', 'width=1000,height=800')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Transaction Summary Report</title>
          <style>
            body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 32px 40px; background: #fff; color: #0f172a; }
            .report-shell { max-width: 980px; margin: 0 auto; }
            .summary-grid { display: grid; grid-template-columns: 1fr; gap: 16px; align-items: start; }
            .summary-grid > div:nth-child(2) { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .panel { border-radius: 18px; background: #fff; padding: 16px; }
            .list-box { border: 1px solid #cbd5e1; border-radius: 18px; background: #fff; padding: 16px; }
            .panel-title, .list-heading { font-size: 12px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 10px; }
            .hero-value { font-size: 32px; font-weight: 700; margin-bottom: 16px; }
            .balance-table, .statement-table { width: 100%; border-collapse: collapse; }
            .balance-table td, .statement-table th, .statement-table td { border: 1px solid #cbd5e1; padding: 10px; }
            .statement-table th { background: #e2e8f0; text-transform: uppercase; font-size: 12px; }
            .amount-col, .balance-col { text-align: right; }
            .income { background: #f0fdf4; border-color: #bbf7d0; }
            .expense { background: #fef2f2; border-color: #fecaca; }
            .line-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; }
            .line-item:last-child { border-bottom: 0; }
            .line-item-main { display: flex; flex-direction: column; }
            .meta-line { font-size: 11px; color: #64748b; }
            .signatories { margin-top: 32px; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 24px; }
            .signatory-line { border-top: 1px solid #0f172a; margin-top: 40px; text-align: center; font-weight: 600; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  let runningBalance = 0

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-6xl p-8 rounded-[2rem] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div ref={printRef} className="report-shell">
          <div className="border-b border-slate-200 pb-6">
            <p className="eyebrow text-xs uppercase tracking-[0.28em] text-slate-500">Financial Statement</p>
            <h1 className="title text-4xl font-semibold">Church Financial Report</h1>
            <p className="subtitle text-sm text-slate-500">Transaction Summary Report</p>
            <div className="meta mt-5 flex flex-col gap-1 md:flex-row md:justify-between text-sm text-slate-500">
              <span>Prepared financial summary of recorded church transactions</span>
              <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="period mt-3 text-sm text-slate-600">
              Reporting Period: <strong className="font-semibold text-slate-900">{dateFrom || 'Beginning'} to {dateTo || 'Present'}</strong>
            </div>
          </div>

          <div className="summary-grid mt-8 grid grid-cols-1 gap-5">
            <div className="panel">
              <p className="panel-title">Balance Sheet</p>
              <h2 className="hero-value">{formatCurrency(summary.finalBalance)}</h2>
              <table className="balance-table">
                <tbody>
                  <tr><td>Running Balance</td><td className="text-right font-semibold">{formatCurrency(summary.finalBalance)}</td></tr>
                  <tr><td>Total Income</td><td className="text-right font-semibold text-emerald-700">{formatCurrency(summary.totalIncome)}</td></tr>
                  <tr><td>Total Expense</td><td className="text-right font-semibold text-rose-700">{formatCurrency(summary.totalExpense)}</td></tr>
                  <tr><td className="font-semibold">Final Balance</td><td className="text-right font-semibold">{formatCurrency(summary.finalBalance)}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="list-box income">
                <div className="list-box-header">
                  <p className="list-heading">Income Sheet</p>
                  <span className="list-total text-emerald-900">{formatCurrency(summary.totalIncome)}</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {summary.incomes.length > 0 ? (
                    summary.incomes.map((item) => (
                      <div key={item.id} className="line-item">
                        <div className="line-item-main">
                          <span className="font-medium text-slate-900">{item.category?.name || item.reference_no}</span>
                          <span className="meta-line">{item.reference_no} | {item.transaction_date.slice(0, 10)}</span>
                        </div>
                        <span className="font-semibold text-emerald-700">{formatCurrency(Number(item.amount))}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No income transactions recorded.</p>
                  )}
                </div>
              </div>

              <div className="list-box expense">
                <div className="list-box-header">
                  <p className="list-heading">Expense Sheet</p>
                  <span className="list-total text-rose-900">{formatCurrency(summary.totalExpense)}</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {summary.expenses.length > 0 ? (
                    summary.expenses.map((item) => (
                      <div key={item.id} className="line-item">
                        <div className="line-item-main">
                          <span className="font-medium text-slate-900">{item.category?.name || item.reference_no}</span>
                          <span className="meta-line">{item.reference_no} | {item.transaction_date.slice(0, 10)}</span>
                        </div>
                        <span className="font-semibold text-rose-700">{formatCurrency(Number(item.amount))}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No expense transactions recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Transaction Ledger</h2>
            <div className="overflow-x-auto">
              <table className="statement-table w-full">
                <thead>
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Reference</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((t, idx) => {
                      runningBalance += t.transaction_type === 'income' ? Number(t.amount) : -Number(t.amount)
                      return (
                        <tr key={t.id}>
                          <td className="px-3 py-2">{idx + 1}</td>
                          <td className="px-3 py-2">{t.category?.name || 'N/A'}</td>
                          <td className="px-3 py-2">{t.reference_no}</td>
                          <td className={t.transaction_type === 'income' ? 'text-emerald-700 px-3 py-2' : 'text-rose-700 px-3 py-2'}>{t.transaction_type}</td>
                          <td className="px-3 py-2">{t.transaction_date.slice(0, 10)}</td>
                          <td className="px-3 py-2">{formatCurrency(Number(t.amount))}</td>
                          <td className="px-3 py-2 font-semibold">{formatCurrency(runningBalance)}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-500">No transactions available for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="signatories mt-16 grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2">
            <div className="signatory pt-10 text-center">
              <p className="signatory-line">Prepared By</p>
            </div>
            <div className="signatory pt-10 text-center">
              <p className="signatory-line">Checked By</p>
            </div>
            <div className="signatory pt-10 text-center">
              <p className="signatory-line">Recommending Approval</p>
            </div>
            <div className="signatory pt-10 text-center">
              <p className="signatory-line">Approve By</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Close</button>
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded">Print</button>
        </div>
      </div>
    </div>
  )
}

export default PrintableReport
