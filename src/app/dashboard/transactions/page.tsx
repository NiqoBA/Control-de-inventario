'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction, Product } from '@/types'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // Filtros y ordenamiento
  const [filters, setFilters] = useState({
    type: '',
    product: ''
  })
  const [sortBy, setSortBy] = useState<'created_at' | 'product' | 'type'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'in' as 'in' | 'out',
    quantity: 0,
    reason: '',
    notes: '',
  })

  useEffect(() => {
    fetchTransactions()
    fetchProducts()
  }, [])

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...transactions]

    // Aplicar filtros
    if (filters.type) {
      filtered = filtered.filter(transaction => transaction.type === filters.type)
    }
    if (filters.product) {
      filtered = filtered.filter(transaction => transaction.product_id === filters.product)
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'product':
          aValue = a.product?.name || ''
          bValue = b.product?.name || ''
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTransactions(filtered)
  }, [transactions, filters, sortBy, sortOrder])

  useEffect(() => {
    applyFiltersAndSort()
  }, [applyFiltersAndSort])

  const clearFilters = () => {
    setFilters({
      type: '',
      product: ''
    })
    setSortBy('created_at')
    setSortOrder('desc')
  }

  const fetchTransactions = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        product:products(name, sku)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }

  const fetchProducts = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku')
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
    } else {
      setProducts(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          ...formData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }])

      if (error) throw error

      setShowModal(false)
      resetForm()
      fetchTransactions()
    } catch (error) {
      console.error('Error creating transaction:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      product_id: '',
      type: 'in',
      quantity: 0,
      reason: '',
      notes: '',
    })
  }

  const getTransactionTypeColor = (type: 'in' | 'out') => {
    return type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getTransactionTypeText = (type: 'in' | 'out') => {
    return type === 'in' ? 'Entrada' : 'Salida'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mustard"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-gray-600">Gestiona las entradas y salidas de inventario</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-mustard text-white rounded-md hover:bg-mustard-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mustard"
        >
          Nueva Transacción
        </button>
      </div>

      {/* Filters and Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="mt-1 block w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-mustard focus:border-mustard"
          >
            <option value="">Todos los tipos</option>
            <option value="in">Entrada</option>
            <option value="out">Salida</option>
          </select>
          <select
            value={filters.product}
            onChange={(e) => setFilters({ ...filters, product: e.target.value })}
            className="mt-1 block w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-mustard focus:border-mustard"
          >
            <option value="">Todos los productos</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'created_at' | 'product' | 'type')}
            className="mt-1 block w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-mustard focus:border-mustard"
          >
            <option value="created_at">Fecha</option>
            <option value="product">Producto</option>
            <option value="type">Tipo</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="mt-1 block w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-mustard focus:border-mustard"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-2 sm:mb-0">
            Mostrando {filteredTransactions.length} de {transactions.length} transacciones
            {(filters.type || filters.product) && (
              <span className="text-orange-600 font-medium">
                {' '}(filtradas)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Ordenado por: {sortBy === 'created_at' ? 'Fecha' : sortBy === 'product' ? 'Producto' : 'Tipo'} 
            ({sortOrder === 'asc' ? 'ascendente' : 'descendente'})
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Razón
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.product?.name || 'Producto no encontrado'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.product?.sku || 'SKU no disponible'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                    {getTransactionTypeText(transaction.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {transactions.length === 0 ? 'No hay transacciones' : 'No se encontraron transacciones'}
            </h3>
            <p className="text-gray-600 mb-4">
              {transactions.length === 0 
                ? 'Comienza creando la primera transacción de inventario.'
                : 'Intenta ajustar los filtros para ver más resultados.'
              }
            </p>
            {transactions.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-mustard text-white rounded-md hover:bg-mustard-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mustard"
              >
                Crear Transacción
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nueva Transacción
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Producto</label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-mustard focus:border-mustard"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'in' | 'out' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-mustard focus:border-mustard"
                  >
                    <option value="in">Entrada</option>
                    <option value="out">Salida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-mustard focus:border-mustard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Razón</label>
                  <input
                    type="text"
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-mustard focus:border-mustard"
                    placeholder="Ej: Compra, Venta, Ajuste, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-mustard focus:border-mustard"
                    rows={3}
                    placeholder="Notas adicionales..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-mustard rounded-md hover:bg-mustard-dark"
                  >
                    Crear Transacción
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 