'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Employee, Product, ProductAssignment } from '@/types'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [assignments, setAssignments] = useState<ProductAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
  })
  const [assignmentData, setAssignmentData] = useState({
    product_id: '',
    quantity: 1,
  })

  useEffect(() => {
    fetchEmployees()
    fetchProducts()
    fetchAssignments()
  }, [])

  const fetchEmployees = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching employees:', error)
    } else {
      setEmployees(data || [])
    }
    setLoading(false)
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

  const fetchAssignments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('product_assignments')
      .select(`
        *,
        product:products(*),
        employee:employees(*)
      `)
      .order('assigned_at', { ascending: false })

    if (error) {
      console.error('Error fetching assignments:', error)
    } else {
      setAssignments(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    if (editingEmployee) {
      const { error } = await supabase
        .from('employees')
        .update(formData)
        .eq('id', editingEmployee.id)

      if (error) {
        console.error('Error updating employee:', error)
      } else {
        fetchEmployees()
        setModalOpen(false)
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from('employees')
        .insert([formData])

      if (error) {
        console.error('Error creating employee:', error)
      } else {
        fetchEmployees()
        setModalOpen(false)
        resetForm()
      }
    }
  }

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
      surname: employee.surname,
    })
    setEditingEmployee(employee)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      const supabase = createClient()
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting employee:', error)
      } else {
        fetchEmployees()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
    })
    setEditingEmployee(null)
  }

  const handleAssignProduct = (employee: Employee) => {
    setSelectedEmployee(employee)
    setAssignmentModalOpen(true)
  }

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee || !assignmentData.product_id || assignmentData.quantity <= 0) return

    const supabase = createClient()
    const { error } = await supabase
      .from('product_assignments')
      .insert([{
        employee_id: selectedEmployee.id,
        product_id: assignmentData.product_id,
        quantity: assignmentData.quantity,
      }])

    if (error) {
      console.error('Error assigning product:', error)
    } else {
      fetchAssignments()
      setAssignmentModalOpen(false)
      setAssignmentData({ product_id: '', quantity: 1 })
      setSelectedEmployee(null)
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (confirm('¿Estás seguro de que quieres remover esta asignación?')) {
      const supabase = createClient()
      const { error } = await supabase
        .from('product_assignments')
        .delete()
        .eq('id', assignmentId)

      if (error) {
        console.error('Error removing assignment:', error)
      } else {
        fetchAssignments()
      }
    }
  }

  const getEmployeeAssignments = (employeeId: string) => {
    return assignments.filter(assignment => assignment.employee_id === employeeId)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Empleados</h1>
        <Button onClick={() => setModalOpen(true)}>
          Agregar Empleado
        </Button>
      </div>

      {/* Employees Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {employees.map((employee) => {
          const employeeAssignments = getEmployeeAssignments(employee.id)
          return (
            <div key={employee.id} style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                    {employee.name} {employee.surname}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    Productos asignados: {employeeAssignments.length}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAssignProduct(employee)}
                  >
                    Asignar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(employee)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              {employeeAssignments.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                    Productos Asignados:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {employeeAssignments.map((assignment) => (
                      <div key={assignment.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        background: 'rgba(218, 165, 32, 0.1)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(218, 165, 32, 0.2)'
                      }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                            {assignment.product?.name}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>
                              <strong>ID:</strong> {assignment.product_id}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                              <strong>SKU:</strong> {assignment.product?.sku}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                              <strong>Cantidad:</strong> {assignment.quantity}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {employees.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <svg style={{ height: '3rem', width: '3rem', color: '#9CA3AF', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>No hay empleados</h3>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Comienza agregando tu primer empleado.</p>
          <Button onClick={() => setModalOpen(true)}>
            Agregar Empleado
          </Button>
        </div>
      )}

      {/* Employee Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          resetForm()
        }}
        title={editingEmployee ? 'Editar Empleado' : 'Agregar Empleado'}
        size="md"
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
                Apellido *
              </label>
              <input
                type="text"
                required
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
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

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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
              {editingEmployee ? 'Actualizar' : 'Crear'} Empleado
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={assignmentModalOpen}
        onClose={() => {
          setAssignmentModalOpen(false)
          setAssignmentData({ product_id: '', quantity: 1 })
          setSelectedEmployee(null)
        }}
        title={`Asignar Producto a ${selectedEmployee?.name} ${selectedEmployee?.surname}`}
        size="md"
      >
        <form onSubmit={handleAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Producto *
            </label>
            <select
              required
              value={assignmentData.product_id}
              onChange={(e) => setAssignmentData({ ...assignmentData, product_id: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                background: 'white'
              }}
            >
              <option value="">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - Stock: {product.quantity}
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
              min="1"
              step="1"
              value={assignmentData.quantity}
              onChange={(e) => {
                const value = Math.floor(Number(e.target.value))
                setAssignmentData({ ...assignmentData, quantity: value >= 1 ? value : 1 })
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

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setAssignmentModalOpen(false)
                setAssignmentData({ product_id: '', quantity: 1 })
                setSelectedEmployee(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!assignmentData.product_id || assignmentData.quantity <= 0}
            >
              Asignar Producto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
} 