import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/api'
import { useAuthActions } from '../hooks/useAuthActions'
import { AuthContext } from './AuthContextBase'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const authCheckedRef = useRef(false)

  const {
    loginAdmin,
    authenticateEmployee,
    logoutAdmin,
    logoutEmployee,
    updateAdmin,
    updateEmployee,
  } = useAuthActions({ setUser, setEmployee, authCheckedRef })

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    const authType = localStorage.getItem('auth_type') // 'admin' | 'employee'
    if (!token) {
      setLoading(false)
      return
    }
    
    if (authCheckedRef.current) return
    authCheckedRef.current = true
    
    // If we know the auth type, only check that endpoint to avoid 401 noise
    if (authType === 'admin') {
      const ok = await api
        .get('/admin/me')
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.user)
            setEmployee(null)
            setLoading(false)
            return true
          }
          return false
        })
        .catch(() => false)
      if (!ok) {
        setUser(null)
        setEmployee(null)
        setLoading(false)
      }
      return
    }

    if (authType === 'employee') {
      const ok = await api
        .get('/employee/me')
        .then((res) => {
          if (res.data.success) {
            setEmployee(res.data.employee)
            setUser(null)
            setLoading(false)
            return true
          }
          return false
        })
        .catch(() => false)
      if (!ok) {
        setUser(null)
        setEmployee(null)
        setLoading(false)
      }
      return
    }

    // If unknown, probe admin then employee
    const adminOk = await api
      .get('/admin/me')
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user)
          setEmployee(null)
          localStorage.setItem('auth_type', 'admin')
          setLoading(false)
          return true
        }
        return false
      })
      .catch(() => false)

    if (adminOk) return

    const employeeOk = await api
      .get('/employee/me')
      .then((res) => {
        if (res.data.success) {
          setEmployee(res.data.employee)
          setUser(null)
          localStorage.setItem('auth_type', 'employee')
          setLoading(false)
          return true
        }
        return false
      })
      .catch(() => false)

    if (!employeeOk) {
      setUser(null)
      setEmployee(null)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Check for stored token on app start
    const token = localStorage.getItem('auth_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    checkAuth()
  }, [checkAuth])

  const value = {
    user,
    employee,
    loading,
    adminLogin: loginAdmin,
    employeeAuth: authenticateEmployee,
    adminLogout: logoutAdmin,
    employeeLogout: logoutEmployee,
    updateAdminProfile: updateAdmin,
    updateEmployeeProfile: updateEmployee,
    checkAuth,
    isAdmin: !!user,
    isEmployee: !!employee,
    isAuthenticated: !!user || !!employee,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
