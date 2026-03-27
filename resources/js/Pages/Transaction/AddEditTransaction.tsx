import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface Category {
  id: number
  name: string
}

interface TransactionType {
  id: number
  category_id: number
  reference_no: string
  transaction_type: string
  transaction_date: string
  amount: number | string
  description: string
}

interface Props {
  onClose: () => void
  onSuccess: () => void
  editData?: TransactionType | null
}

const AddEditTransaction = ({ onClose, onSuccess, editData }: Props) => {
  const [form, setForm] = useState({
    category_id: '',
    reference_no: '',
    transaction_type: 'income',
    transaction_date: '',
    amount: '',
    description: '',
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()

    if (editData) {
      setForm({
        category_id: String(editData.category_id),
        reference_no: editData.reference_no ?? '',
        transaction_type: editData.transaction_type ?? 'income',
        transaction_date: editData.transaction_date ?? '',
        amount: String(editData.amount ?? ''),
        description: editData.description ?? '',
      })
      return
    }

    setForm({
      category_id: '',
      reference_no: '',
      transaction_type: 'income',
      transaction_date: '',
      amount: '',
      description: '',
    })
  }, [editData])

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories')
      setCategories(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editData) {
        await axios.put(`/transaction/${editData.id}`, form)
      } else {
        await axios.post('/transaction', form)
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">{editData ? 'Edit Transaction' : 'Add Transaction'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="reference_no"
            placeholder="Reference No"
            value={form.reference_no}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />

          <select
            name="transaction_type"
            value={form.transaction_type}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="date"
            name="transaction_date"
            value={form.transaction_date}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditTransaction
