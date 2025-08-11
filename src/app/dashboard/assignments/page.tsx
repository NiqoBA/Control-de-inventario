'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Employee {
  id: string
  name: string
  surname: string
}

interface Product {
  id: string
  name: string
  sku: string
  quantity: number
  category: string
}

interface Assignment {
  id: string
  employee_id: string
  product_id: string
  quantity: number
  assigned_at: string
  employee_name: string
  employee_surname: string
  product_name: string
  product_sku: string
  product_category: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener empleados
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name')
      
      if (employeesError) throw employeesError
      
      // Obtener productos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (productsError) throw productsError
      
      // Obtener asignaciones con detalles
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('product_assignments_with_details')
        .select('*')
        .order('assigned_at', { ascending: false })
      
      if (assignmentsError) throw assignmentsError

      setEmployees(employeesData || [])
      setProducts(productsData || [])
      setAssignments(assignmentsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async () => {
    if (!selectedEmployee || !productId || quantity <= 0) {
      setError('Por favor completa todos los campos')
      return
    }

    try {
      setError('')
      setSuccess('')

      // Verificar que el producto tenga stock suficiente
      const product = products.find(p => p.id === productId)
      if (!product || product.quantity < quantity) {
        setError('Stock insuficiente para esta asignación')
        return
      }

      // Crear la asignación
      const { error: assignmentError } = await supabase
        .from('product_assignments')
        .insert({
          employee_id: selectedEmployee,
          product_id: productId,
          quantity: quantity
        })

      if (assignmentError) throw assignmentError

      // Registrar la transacción de salida
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          product_id: productId,
          type: 'out',
          quantity: quantity,
          reason: 'Asignación a empleado',
          notes: `Asignado a empleado ID: ${selectedEmployee}`
        })

      if (transactionError) throw transactionError

      setSuccess('Producto asignado correctamente')
      setShowModal(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error creating assignment:', error)
      setError('Error al crear la asignación')
    }
  }

  const handleDeleteAssignment = async (assignmentId: string, productId: string, quantity: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) return

    try {
      // Eliminar la asignación
      const { error: deleteError } = await supabase
        .from('product_assignments')
        .delete()
        .eq('id', assignmentId)

      if (deleteError) throw deleteError

      // Registrar la transacción de entrada (devolución)
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          product_id: productId,
          type: 'in',
          quantity: quantity,
          reason: 'Devolución de asignación',
          notes: 'Producto desasignado de empleado'
        })

      if (transactionError) throw transactionError

      setSuccess('Asignación eliminada correctamente')
      fetchData()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      setError('Error al eliminar la asignación')
    }
  }

  const resetForm = () => {
    setSelectedEmployee('')
    setProductId('')
    setQuantity(1)
    setError('')
  }

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    return employee ? `${employee.name} ${employee.surname}` : 'Empleado no encontrado'
  }

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product ? product.name : 'Producto no encontrado'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Asignaciones de Productos</h1>
        <Button onClick={() => setShowModal(true)}>
          Nueva Asignación
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Productos Asignados</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID del Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No hay asignaciones registradas
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {assignment.employee_name} {assignment.employee_surname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {assignment.product_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {assignment.product_sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.product_category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(assignment.assigned_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => handleDeleteAssignment(assignment.id, assignment.product_id, assignment.quantity)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                      >
                        Desasignar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para nueva asignación */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Asignación de Producto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva Asignación de Producto</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empleado *
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona un empleado</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} {employee.surname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Producto *
              </label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Ingresa el ID exacto del producto"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                El ID debe coincidir exactamente con el ID del producto en el sistema
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {productId && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Producto:</h4>
                {(() => {
                  const product = products.find(p => p.id === productId)
                  if (!product) {
                    return <p className="text-red-600 text-sm">Producto no encontrado</p>
                  }
                  return (
                    <div className="text-sm text-gray-600">
                      <p><strong>Nombre:</strong> {product.name}</p>
                      <p><strong>SKU:</strong> {product.sku}</p>
                      <p><strong>Stock disponible:</strong> {product.quantity}</p>
                      <p><strong>Categoría:</strong> {product.category}</p>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setShowModal(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateAssignment}>
              Asignar Producto
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
