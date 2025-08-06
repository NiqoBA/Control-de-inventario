'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, Employee } from '@/types'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'

interface StockRequest {
  id: string
  employee_id: string
  product_name: string
  product_id?: string
  quantity: number
  priority: 'baja' | 'media' | 'alta' | 'urgente'
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'completada'
  reason: string
  notes?: string
  requested_at: string
  employee?: Employee
  product?: Product
}

export default function StockRequestsPage() {
  const [requests, setRequests] = useState<StockRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<StockRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<StockRequest | null>(null)
  
  // Filtros y ordenamiento
  const [filters, setFilters] = useState({
    priority: '',
    employee: '',
    status: ''
  })
  const [sortBy, setSortBy] = useState<'requested_at' | 'priority' | 'employee'>('requested_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const [formData, setFormData] = useState({
    employee_id: '',
    product_name: '',
    product_id: '',
    quantity: 1,
    priority: 'media' as 'baja' | 'media' | 'alta' | 'urgente',
    reason: '',
    notes: ''
  })

  useEffect(() => {
    fetchRequests()
    fetchEmployees()
    fetchProducts()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [requests, filters, sortBy, sortOrder])

  const applyFiltersAndSort = () => {
    let filtered = [...requests]

    // Aplicar filtros
    if (filters.priority) {
      filtered = filtered.filter(request => request.priority === filters.priority)
    }
    if (filters.employee) {
      filtered = filtered.filter(request => request.employee_id === filters.employee)
    }
    if (filters.status) {
      filtered = filtered.filter(request => request.status === filters.status)
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'requested_at':
          aValue = new Date(a.requested_at).getTime()
          bValue = new Date(b.requested_at).getTime()
          break
        case 'priority':
          const priorityOrder = { 'urgente': 4, 'alta': 3, 'media': 2, 'baja': 1 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
          break
        case 'employee':
          aValue = a.employee ? `${a.employee.name} ${a.employee.surname}` : ''
          bValue = b.employee ? `${b.employee.name} ${b.employee.surname}` : ''
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

    setFilteredRequests(filtered)
  }

  const clearFilters = () => {
    setFilters({
      priority: '',
      employee: '',
      status: ''
    })
    setSortBy('requested_at')
    setSortOrder('desc')
  }

  const fetchRequests = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('stock_requests')
      .select(`
        *,
        employee:employees(*),
        product:products(*)
      `)
      .order('requested_at', { ascending: false })

    if (error) {
      console.error('Error fetching requests:', error)
    } else {
      setRequests(data || [])
    }
    setLoading(false)
  }

  const fetchEmployees = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching employees:', error)
    } else {
      setEmployees(data || [])
    }
  }

  const fetchProducts = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
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

    const requestData = {
      employee_id: formData.employee_id,
      product_name: formData.product_name,
      product_id: formData.product_id || null,
      quantity: Number(formData.quantity),
      priority: formData.priority,
      reason: formData.reason,
      notes: formData.notes || null,
      status: 'pendiente'
    }

    if (editingRequest) {
      const { error } = await supabase
        .from('stock_requests')
        .update(requestData)
        .eq('id', editingRequest.id)

      if (error) {
        console.error('Error updating request:', error)
      } else {
        fetchRequests()
        setModalOpen(false)
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from('stock_requests')
        .insert([requestData])

      if (error) {
        console.error('Error creating request:', error)
      } else {
        fetchRequests()
        setModalOpen(false)
        resetForm()
      }
    }
  }

  const handleEdit = (request: StockRequest) => {
    setEditingRequest(request)
    setFormData({
      employee_id: request.employee_id,
      product_name: request.product_name,
      product_id: request.product_id || '',
      quantity: request.quantity,
      priority: request.priority,
      reason: request.reason,
      notes: request.notes || ''
    })
    setModalOpen(true)
  }

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('stock_requests')
      .update({ status: newStatus })
      .eq('id', requestId)

    if (error) {
      console.error('Error updating request status:', error)
    } else {
      fetchRequests()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) {
      const supabase = createClient()
      const { error } = await supabase
        .from('stock_requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting request:', error)
      } else {
        fetchRequests()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      employee_id: '',
      product_name: '',
      product_id: '',
      quantity: 1,
      priority: 'media',
      reason: '',
      notes: ''
    })
    setEditingRequest(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'rgb(239, 68, 68)'
      case 'alta': return 'rgb(245, 158, 11)'
      case 'media': return 'rgb(59, 130, 246)'
      case 'baja': return 'rgb(34, 197, 94)'
      default: return 'rgb(107, 114, 128)'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada': return 'rgb(34, 197, 94)'
      case 'aprobada': return 'rgb(59, 130, 246)'
      case 'rechazada': return 'rgb(239, 68, 68)'
      case 'pendiente': return 'rgb(245, 158, 11)'
      default: return 'rgb(107, 114, 128)'
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <LoadingSpinner size="lg" text="Cargando solicitudes..." />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Solicitudes de Stock</h1>
          <p style={{ color: '#6B7280' }}>Gestiona las solicitudes de stock de los empleados</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          icon={
            <svg style={{ height: '1.25rem', width: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        >
          Nueva Solicitud
        </Button>
      </div>

      {/* Filters and Sort Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          style={{
            padding: '0.75rem',
            border: '1px solid #D1D5DB',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            background: 'white'
          }}
        >
          <option value="">Prioridad</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <select
          value={filters.employee}
          onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
          style={{
            padding: '0.75rem',
            border: '1px solid #D1D5DB',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            background: 'white'
          }}
        >
          <option value="">Empleado</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} {employee.surname}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={{
            padding: '0.75rem',
            border: '1px solid #D1D5DB',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            background: 'white'
          }}
        >
          <option value="">Estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
          <option value="completada">Completada</option>
        </select>
        <Button variant="secondary" onClick={clearFilters}>
          Limpiar Filtros
        </Button>
      </div>

      {/* Results Summary */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem',
        background: '#F9FAFB',
        borderRadius: '0.5rem',
        border: '1px solid #E5E7EB'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
          Mostrando {filteredRequests.length} de {requests.length} solicitudes
          {(filters.priority || filters.employee || filters.status) && (
            <span style={{ color: '#D97706', fontWeight: '500' }}>
              {' '}(filtradas)
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
          Ordenado por: {sortBy === 'requested_at' ? 'Fecha' : sortBy === 'priority' ? 'Prioridad' : 'Empleado'} 
          ({sortOrder === 'asc' ? 'ascendente' : 'descendente'})
        </div>
      </div>

      {/* Requests Table */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th 
                  style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#374151',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => {
                    if (sortBy === 'employee') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortBy('employee')
                      setSortOrder('asc')
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Empleado
                    {sortBy === 'employee' && (
                      <svg style={{ height: '1rem', width: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Producto/Objeto
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Cantidad
                </th>
                <th 
                  style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#374151',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => {
                    if (sortBy === 'priority') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortBy('priority')
                      setSortOrder('desc')
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Prioridad
                    {sortBy === 'priority' && (
                      <svg style={{ height: '1rem', width: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Estado
                </th>
                <th 
                  style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#374151',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => {
                    if (sortBy === 'requested_at') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortBy('requested_at')
                      setSortOrder('desc')
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Fecha
                    {sortBy === 'requested_at' && (
                      <svg style={{ height: '1rem', width: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#111827' }}>
                    {request.employee ? `${request.employee.name} ${request.employee.surname}` : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#111827' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{request.product_name}</div>
                      {request.product && (
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          SKU: {request.product.sku}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#111827', fontWeight: '500' }}>
                    {request.quantity}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: `${getPriorityColor(request.priority)}20`,
                      color: getPriorityColor(request.priority),
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {request.priority}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: `${getStatusColor(request.status)}20`,
                      color: getStatusColor(request.status),
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {request.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                    {new Date(request.requested_at).toLocaleDateString('es-ES')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          border: '1px solid #D1D5DB',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          background: 'white'
                        }}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                        <option value="completada">Completada</option>
                      </select>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(request)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(request.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6B7280'
          }}>
            <svg style={{ height: '3rem', width: '3rem', color: '#9CA3AF', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>No hay solicitudes</h3>
            <p style={{ marginBottom: '1.5rem' }}>Comienza creando la primera solicitud de stock.</p>
            <Button onClick={() => setModalOpen(true)}>
              Crear Solicitud
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          resetForm()
        }}
        title={editingRequest ? 'Editar Solicitud' : 'Nueva Solicitud de Stock'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Empleado *
              </label>
              <select
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="">Seleccionar empleado</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} {employee.surname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Prioridad *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: 'white'
                }}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Producto existente (opcional)
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => {
                const selectedProduct = products.find(p => p.id === e.target.value)
                setFormData({ 
                  ...formData, 
                  product_id: e.target.value,
                  product_name: selectedProduct ? selectedProduct.name : formData.product_name
                })
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                background: 'white'
              }}
            >
              <option value="">Seleccionar producto existente (opcional)</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - SKU: {product.sku}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Nombre del producto/objeto *
            </label>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="Nombre del producto o nuevo objeto"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Cantidad *
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e) => {
                  const value = Math.floor(Number(e.target.value))
                  setFormData({ ...formData, quantity: value >= 1 ? value : 1 })
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
                Razón de la solicitud *
              </label>
              <select
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
                <option value="Stock agotado">Stock agotado</option>
                <option value="Stock bajo">Stock bajo</option>
                <option value="Nuevo proyecto">Nuevo proyecto</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Reposición">Reposición</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Notas adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Detalles adicionales sobre la solicitud..."
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
            {editingRequest && (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  if (editingRequest) {
                    handleDelete(editingRequest.id)
                    setModalOpen(false)
                    resetForm()
                  }
                }}
              >
                Eliminar Solicitud
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
              {editingRequest ? 'Actualizar' : 'Crear'} Solicitud
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
} 