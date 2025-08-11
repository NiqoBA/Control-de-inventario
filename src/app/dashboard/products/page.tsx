'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [stockInModalOpen, setStockInModalOpen] = useState(false)
  const [stockOutModalOpen, setStockOutModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    quantity: 0,
    min_quantity: 0,
    unit_price: 0,
    unit_currency: 'USD',
    supplier: '',
    location: '',
  })
  const [stockTransaction, setStockTransaction] = useState({
    quantity: 0,
    reason: '',
    notes: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
    } else {
      setCategories(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const productData = {
      ...formData,
      quantity: Number(formData.quantity),
      min_quantity: Number(formData.min_quantity),
      unit_price: Number(formData.unit_price),
      unit_currency: formData.unit_currency,
    }

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)

      if (error) {
        console.error('Error updating product:', error)
      } else {
        fetchProducts()
        setModalOpen(false)
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) {
        console.error('Error creating product:', error)
      } else {
        fetchProducts()
        setModalOpen(false)
        resetForm()
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      category: product.category,
      quantity: product.quantity,
      min_quantity: product.min_quantity,
      unit_price: product.unit_price,
      unit_currency: product.unit_currency || 'USD',
      supplier: product.supplier || '',
      location: product.location || '',
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting product:', error)
      } else {
        fetchProducts()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      category: '',
      quantity: 0,
      min_quantity: 0,
      unit_price: 0,
      unit_currency: 'USD',
      supplier: '',
      location: '',
    })
    setEditingProduct(null)
  }

  const resetStockTransaction = () => {
    setStockTransaction({
      quantity: 0,
      reason: '',
      notes: ''
    })
    setSelectedProduct(null)
  }

  const handleStockIn = (product: Product) => {
    setSelectedProduct(product)
    setStockInModalOpen(true)
  }

  const handleStockOut = (product: Product) => {
    setSelectedProduct(product)
    setStockOutModalOpen(true)
  }

  const handleStockTransaction = async (type: 'in' | 'out') => {
    if (!selectedProduct || stockTransaction.quantity <= 0) return

    const supabase = createClient()

    // Validar stock disponible para salidas
    if (type === 'out' && stockTransaction.quantity > selectedProduct.quantity) {
      alert('No hay suficiente stock disponible para esta salida.')
      return
    }

    try {
      // Crear la transacción
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          product_id: selectedProduct.id,
          type: type,
          quantity: stockTransaction.quantity,
          reason: stockTransaction.reason,
          notes: stockTransaction.notes
        }])

      if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        alert('Error al procesar la transacción.')
        return
      }

      // Actualizar el stock del producto
      const newQuantity = type === 'in' 
        ? selectedProduct.quantity + stockTransaction.quantity
        : selectedProduct.quantity - stockTransaction.quantity

      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', selectedProduct.id)

      if (updateError) {
        console.error('Error updating product quantity:', updateError)
        alert('Error al actualizar el stock del producto.')
        return
      }

      // Cerrar modal y actualizar lista
      setStockInModalOpen(false)
      setStockOutModalOpen(false)
      resetStockTransaction()
      fetchProducts()

      alert(`Transacción de ${type === 'in' ? 'entrada' : 'salida'} procesada exitosamente.`)
    } catch (error) {
      console.error('Error in stock transaction:', error)
      alert('Error al procesar la transacción.')
    }
  }

  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity <= 0) return { status: 'Agotado', color: 'rgb(239, 68, 68)' }
    if (quantity <= minQuantity) return { status: 'Stock Bajo', color: 'rgb(245, 158, 11)' }
    return { status: 'En Stock', color: 'rgb(34, 197, 94)' }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <LoadingSpinner size="lg" text="Cargando productos..." />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Productos</h1>
          <p style={{ color: '#6B7280' }}>Gestiona el inventario de productos</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          icon={
            <svg style={{ height: '1.25rem', width: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Agregar Producto
        </Button>
      </div>

      {/* Products Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {products.map((product) => {
          const stockStatus = getStockStatus(product.quantity, product.min_quantity)
          return (
            <div
              key={product.id}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                    {product.name}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                      <strong>ID:</strong> <span style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>{product.id}</span>
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                      <strong>SKU:</strong> {product.sku}
                    </p>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(128, 128, 0, 0.1)',
                    color: 'rgb(128, 128, 0)',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {product.category}
                  </span>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  background: `${stockStatus.color}20`,
                  color: stockStatus.color,
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {stockStatus.status}
                </div>
              </div>

              {product.description && (
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
                  {product.description}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Cantidad</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>{product.quantity}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Precio Unitario</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>
                    {product.unit_currency === 'USD' ? '$' : '$U'} {product.unit_price}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleStockIn(product)}
                  style={{ flex: 1 }}
                >
                  Entrada
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStockOut(product)}
                  style={{ flex: 1 }}
                >
                  Salida
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(product)}
                  style={{ flex: 1 }}
                >
                  Editar
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {products.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <svg style={{ height: '3rem', width: '3rem', color: '#9CA3AF', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>No hay productos</h3>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Comienza agregando tu primer producto al inventario.</p>
          <Button onClick={() => setModalOpen(true)}>
            Agregar Producto
          </Button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          resetForm()
        }}
        title={editingProduct ? 'Editar Producto' : 'Agregar Producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Categoría *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Cantidad *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.quantity}
                onChange={(e) => {
                  const value = Math.floor(Number(e.target.value))
                  setFormData({ ...formData, quantity: value >= 0 ? value : 0 })
                }}
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault()
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Stock Mínimo *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={formData.min_quantity}
                onChange={(e) => {
                  const value = Math.floor(Number(e.target.value))
                  setFormData({ ...formData, min_quantity: value >= 0 ? value : 0 })
                }}
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault()
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Precio Unitario *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={formData.unit_price}
                  onChange={(e) => {
                    const value = Math.floor(Number(e.target.value))
                    setFormData({ ...formData, unit_price: value >= 0 ? value : 0 })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                      e.preventDefault()
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
                <select
                  value={formData.unit_currency}
                  onChange={(e) => setFormData({ ...formData, unit_currency: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    background: 'white',
                    minWidth: '80px'
                  }}
                >
                  <option value="USD">USD</option>
                  <option value="UYU">Pesos Uruguayos</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Proveedor
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            {editingProduct && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  if (editingProduct) {
                    handleDelete(editingProduct.id)
                    setModalOpen(false)
                    resetForm()
                  }
                }}
              >
                Eliminar Producto
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingProduct ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </div>
        </form>
      </Modal>

      {/* Stock In Modal */}
      <Modal
        isOpen={stockInModalOpen}
        onClose={() => {
          setStockInModalOpen(false)
          resetStockTransaction()
        }}
        title="Entrada de Stock"
        size="md"
      >
        {selectedProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              padding: '1rem',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#059669', marginBottom: '0.5rem' }}>
                Producto: {selectedProduct.name}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#047857' }}>
                Stock actual: <strong>{selectedProduct.quantity}</strong> unidades
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Cantidad a agregar *
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={stockTransaction.quantity}
                onChange={(e) => {
                  const value = Math.floor(Number(e.target.value))
                  setStockTransaction({ ...stockTransaction, quantity: value >= 1 ? value : 0 })
                }}
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault()
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Razón de la entrada *
              </label>
              <select
                required
                value={stockTransaction.reason}
                onChange={(e) => setStockTransaction({ ...stockTransaction, reason: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="">Seleccionar razón</option>
                <option value="Compra">Compra</option>
                <option value="Devolución">Devolución</option>
                <option value="Ajuste de inventario">Ajuste de inventario</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Notas adicionales
              </label>
              <textarea
                value={stockTransaction.notes}
                onChange={(e) => setStockTransaction({ ...stockTransaction, notes: e.target.value })}
                rows={3}
                placeholder="Detalles adicionales sobre la entrada de stock..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setStockInModalOpen(false)
                  resetStockTransaction()
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={() => handleStockTransaction('in')}
                disabled={stockTransaction.quantity <= 0 || !stockTransaction.reason}
              >
                Procesar Entrada
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Stock Out Modal */}
      <Modal
        isOpen={stockOutModalOpen}
        onClose={() => {
          setStockOutModalOpen(false)
          resetStockTransaction()
        }}
        title="Salida de Stock"
        size="md"
      >
        {selectedProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              padding: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#DC2626', marginBottom: '0.5rem' }}>
                Producto: {selectedProduct.name}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#B91C1C' }}>
                Stock disponible: <strong>{selectedProduct.quantity}</strong> unidades
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Cantidad a retirar *
              </label>
              <input
                type="number"
                required
                min="1"
                max={selectedProduct.quantity}
                step="1"
                value={stockTransaction.quantity}
                onChange={(e) => {
                  const value = Math.floor(Number(e.target.value))
                  const maxValue = selectedProduct.quantity
                  setStockTransaction({ 
                    ...stockTransaction, 
                    quantity: value >= 1 && value <= maxValue ? value : 0 
                  })
                }}
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault()
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
              {stockTransaction.quantity > selectedProduct.quantity && (
                <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem' }}>
                  No hay suficiente stock disponible
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Razón de la salida *
              </label>
              <select
                required
                value={stockTransaction.reason}
                onChange={(e) => setStockTransaction({ ...stockTransaction, reason: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="">Seleccionar razón</option>
                <option value="Venta">Venta</option>
                <option value="Consumo interno">Consumo interno</option>
                <option value="Daño">Daño</option>
                <option value="Vencimiento">Vencimiento</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Ajuste de inventario">Ajuste de inventario</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Notas adicionales
              </label>
              <textarea
                value={stockTransaction.notes}
                onChange={(e) => setStockTransaction({ ...stockTransaction, notes: e.target.value })}
                rows={3}
                placeholder="Detalles adicionales sobre la salida de stock..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setStockOutModalOpen(false)
                  resetStockTransaction()
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => handleStockTransaction('out')}
                disabled={
                  stockTransaction.quantity <= 0 || 
                  stockTransaction.quantity > selectedProduct.quantity || 
                  !stockTransaction.reason
                }
              >
                Procesar Salida
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
} 