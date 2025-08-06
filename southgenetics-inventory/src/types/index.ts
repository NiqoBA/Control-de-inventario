export interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'user'
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  category: string
  quantity: number
  min_quantity: number
  unit_price: number
  unit_currency?: string
  supplier?: string
  location?: string
  created_at: string
  updated_at: string
  created_by: string
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface Transaction {
  id: string
  product_id: string
  type: 'in' | 'out'
  quantity: number
  reason: string
  notes?: string
  created_at: string
  created_by: string
  product?: Product
}

export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  created_at: string
}

export interface Employee {
  id: string
  name: string
  surname: string
  created_at: string
}

export interface ProductAssignment {
  id: string
  product_id: string
  employee_id: string
  quantity: number
  assigned_at: string
  product?: Product
  employee?: Employee
}

export interface StockRequest {
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
  updated_at: string
  employee?: Employee
  product?: Product
} 