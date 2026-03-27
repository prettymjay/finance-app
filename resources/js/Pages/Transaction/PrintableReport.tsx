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
            body {
              font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
              padding: 32px 40px;
              color: #0f172a;
              background: #ffffff;
              line-height: 1.45;
            }
            h1, h2, h3, p, span {
              margin: 0;
            }
            .report-shell {
              max-width: 980px;
              margin: 0 auto;
            }
            .eyebrow {
              font-size: 11px;
              letter-spacing: 0.28em;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
            }
            .title {
              margin-top: 8px;
              font-size: 38px;
              font-weight: 700;
              letter-spacing: -0.03em;
            }
            .subtitle {
              margin-top: 8px;
              font-size: 14px;
              color: #475569;
            }
            .meta {
              margin-top: 18px;
              padding-top: 14px;
              border-top: 1px solid #cbd5e1;
              font-size: 13px;
              color: #475569;
              display: flex;
              justify-content: space-between;
              gap: 16px;
            }
            .period {
              margin-top: 12px;
              font-size: 13px;
              color: #475569;
            }
            .period strong {
              color: #0f172a;
            }
            .summary-grid {
              margin-top: 30px;
              display: grid;
              grid-template-columns: 1.15fr 1fr;
              gap: 22px;
            }
            .panel {
              border: 1px solid #cbd5e1;
              border-radius: 18px;
              padding: 20px 22px;
            }
            .panel-title {
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              color: #475569;
            }
            .hero-value {
              margin-top: 12px;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: -0.03em;
            }
            .sheet-column {
              display: grid;
              gap: 16px;
            }
            .balance-table {
              width: 100%;
              margin-top: 18px;
              border-collapse: collapse;
            }
            .balance-table td {
              padding: 10px 0;
              border-bottom: 1px solid #e2e8f0;
              vertical-align: top;
            }
            .balance-table td:last-child {
              text-align: right;
              font-weight: 700;
            }
            .list-box {
              border: 1px solid #e2e8f0;
              border-radius: 18px;
              padding: 18px;
              min-height: 220px;
            }
            .list-box-header {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              gap: 12px;
              margin-bottom: 14px;
            }
            .list-heading {
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.22em;
              text-transform: uppercase;
            }
            .list-total {
              font-size: 12px;
              font-weight: 700;
            }
            .income {
              color: #166534;
              background: #f0fdf4;
              border-color: #bbf7d0;
            }
            .expense {
              color: #991b1b;
              background: #fef2f2;
              border-color: #fecaca;
            }
            .line-item {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              padding: 10px 0;
              border-bottom: 1px dashed #cbd5e1;
              font-size: 13px;
            }
            .line-item:last-child {
              border-bottom: 0;
              padding-bottom: 0;
            }
            .line-item span:last-child {
              font-weight: 700;
            }
            .line-item-main {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .meta-line {
              display: block;
              margin-top: 2px;
              font-size: 11px;
              color: #64748b;
            }
            .statement-table {
              width: 100%;
              margin-top: 28px;
              border-collapse: collapse;
              font-size: 13px;
              table-layout: auto;
            }
            .statement-table th,
            .statement-table td {
              border: 1px solid #cbd5e1;
              padding: 10px 8px;
              text-align: left;
              vertical-align: middle;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .statement-table th {
              background: #e2e8f0;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.12em;
            }
            .amount-col,
            .balance-col {
              text-align: right;
              white-space: nowrap;
            }
            .index-col {
              width: 5%;
              text-align: center;
            }
            .category-col {
              width: 20%;
            }
            .reference-col {
              width: 12%;
            }
            .type-col {
              width: 11%;
              text-align: center;
            }
            .date-col {
              width: 12%;
              text-align: center;
            }
            .amount-col {
              width: 15%;
            }
            .balance-col {
              width: 15%;
            }
            .signatories {
              margin-top: 64px;
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 56px 44px;
            }
            .signatory {
              padding-top: 34px;
              text-align: center;
            }
            .signatory-line {
              border-top: 1px solid #0f172a;
              padding-top: 10px;
              font-size: 13px;
              font-weight: 600;
              letter-spacing: 0.04em;
            }
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
        <div
          ref={printRef}
          className="report-shell"
          style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
        >
          <div className="border-b border-slate-200 pb-6">
            <p className="eyebrow text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Financial Statement
            </p>
            <h1 className="title mt-2 text-4xl font-semibold tracking-tight text-slate-900">
              Church Financial Report
            </h1>
            <p className="subtitle mt-2 text-sm text-slate-500">Transaction Summary Report</p>
            <div className="meta mt-5 flex flex-col gap-1 text-sm text-slate-500 md:flex-row md:justify-between">
              <span>Prepared financial summary of recorded church transactions</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="period mt-3 text-sm text-slate-600">
              Reporting Period:{' '}
              <strong className="font-semibold text-slate-900">
                {dateFrom || 'Beginning'} to {dateTo || 'Present'}
              </strong>
            </div>
          </div>

          <div className="summary-grid mt-8 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_1fr]">
            <div className="panel rounded-3xl border border-slate-200 p-6">
              <p className="panel-title text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Balance Sheet
              </p>
              <h2 className="hero-value mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                {formatCurrency(summary.finalBalance)}
              </h2>

              <table className="balance-table mt-5 w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="py-3 text-slate-600">Running Balance</td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(summary.finalBalance)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-600">Total Income</td>
                    <td className="py-3 text-right font-semibold text-emerald-700">
                      {formatCurrency(summary.totalIncome)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-600">Total Expense</td>
                    <td className="py-3 text-right font-semibold text-rose-700">
                      {formatCurrency(summary.totalExpense)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-900 font-semibold">Final Balance</td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(summary.finalBalance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="sheet-column">
              <div className="list-box income rounded-3xl border p-5">
                <div className="list-box-header">
                  <p className="list-heading text-xs font-semibold uppercase tracking-[0.22em]">Income Sheet</p>
                  <span className="list-total font-semibold">{formatCurrency(summary.totalIncome)}</span>
                </div>
                {summary.incomes.length > 0 ? (
                  summary.incomes.map((item) => (
                    <div key={item.id} className="line-item flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="line-item-main">
                        <span>{item.category?.name || item.reference_no}</span>
                        <span className="meta-line">{item.reference_no} | {item.transaction_date.slice(0, 10)}</span>
                      </span>
                      <span>{formatCurrency(Number(item.amount))}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No income transactions recorded.</p>
                )}
              </div>

              <div className="list-box expense rounded-3xl border p-5">
                <div className="list-box-header">
                  <p className="list-heading text-xs font-semibold uppercase tracking-[0.22em]">Expense Sheet</p>
                  <span className="list-total font-semibold">{formatCurrency(summary.totalExpense)}</span>
                </div>
                {summary.expenses.length > 0 ? (
                  summary.expenses.map((item) => (
                    <div key={item.id} className="line-item flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="line-item-main">
                        <span>{item.category?.name || item.reference_no}</span>
                        <span className="meta-line">{item.reference_no} | {item.transaction_date.slice(0, 10)}</span>
                      </span>
                      <span>{formatCurrency(Number(item.amount))}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No expense transactions recorded.</p>
                )}
              </div>
            </div>
          </div>

          <table className="statement-table mt-8 w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="index-col px-3 py-3">#</th>
                <th className="category-col px-3 py-3">Category</th>
                <th className="reference-col px-3 py-3">Reference</th>
                <th className="type-col px-3 py-3">Type</th>
                <th className="date-col px-3 py-3">Date</th>
                <th className="amount-col px-3 py-3">Amount</th>
                <th className="balance-col px-3 py-3">Running Balance</th>
              </tr>
            </thead>

            <tbody>
              {data.map((t, i) => {
                runningBalance += t.transaction_type === 'income' ? Number(t.amount) : -Number(t.amount)

                return (
                  <tr key={t.id}>
                    <td className="index-col px-3 py-3">{i + 1}</td>
                    <td className="category-col px-3 py-3">{t.category?.name || 'N/A'}</td>
                    <td className="reference-col px-3 py-3">{t.reference_no}</td>
                    <td className="type-col px-3 py-3 capitalize">{t.transaction_type}</td>
                    <td className="date-col px-3 py-3">{t.transaction_date.slice(0, 10)}</td>
                    <td className="amount-col px-3 py-3">{formatCurrency(Number(t.amount))}</td>
                    <td className="balance-col px-3 py-3">{formatCurrency(runningBalance)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="signatories mt-16 grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2">
            <div className="signatory pt-10 text-center">
              <p className="signatory-line border-t border-slate-900 pt-3 text-sm font-semibold tracking-[0.04em]">
                Prepared By
              </p>
            </div>
            <div className="signatory pt-10 text-center">
              <p className="signatory-line border-t border-slate-900 pt-3 text-sm font-semibold tracking-[0.04em]">
                Checked By
              </p>
            </div>
            <div className="signatory pt-10 text-center">
              <p className="signatory-line border-t border-slate-900 pt-3 text-sm font-semibold tracking-[0.04em]">
                Recommending Approval
              </p>
            </div>
            <div className="signatory pt-10 text-center">
              <p className="signatory-line border-t border-slate-900 pt-3 text-sm font-semibold tracking-[0.04em]">
                Approve By
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrintableReport
