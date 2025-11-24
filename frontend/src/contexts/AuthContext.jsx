import { useState, useEffect, useCallback, useRef } from 'react'
import api, { setSessionExpiredHandler } from '../utils/api'
import { useAuthActions } from '../hooks/useAuthActions'
import { authService } from '../services/authService'
import { AuthContext } from './AuthContextType'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('')
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
    const authType = localStorage.getItem('auth_type') // 'admin' | 'employee'
    
    if (!authType) {
      setLoading(false)
      return
    }

    if (authCheckedRef.current) return
    authCheckedRef.current = true

    const handleUnauthorized = () => {
      localStorage.removeItem('auth_type')
      setUser(null)
      setEmployee(null)
      setLoading(false)
      authCheckedRef.current = false
    }
    
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
        handleUnauthorized()
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
        handleUnauthorized()
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
      handleUnauthorized()
    }
  }, [])

  const handleSessionExpired = useCallback(() => {
    const authType = localStorage.getItem('auth_type')
    
    // Try to delete employee identity photo if session expired (snapshot already saved)
    if (authType === 'employee') {
      // Try to delete identity photo (may fail if session already expired, that's okay)
      authService.deleteEmployeeIdentityPhoto().catch(() => {
        // Ignore error - photo will remain if session already expired
        // This is fine because snapshot is already saved in MaintenancePhoto
      })
    }
    
    localStorage.removeItem('auth_type')
    setUser(null)
    setEmployee(null)
    authCheckedRef.current = false
    
    setSessionExpiredMessage('Sesi Anda telah berakhir. Silakan login kembali.')
    
    setTimeout(() => {
      setSessionExpiredMessage('')
    }, 5000)
  }, [])

  useEffect(() => {
    setSessionExpiredHandler(handleSessionExpired)
    
    checkAuth()
  }, [checkAuth, handleSessionExpired])

  const value = {
    user,
    employee,
    loading,
    sessionExpiredMessage,
    setSessionExpiredMessage,
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
