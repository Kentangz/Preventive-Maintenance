import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const authCheckedRef = useRef(false)

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

  const adminLogin = async (email, password) => {
    try {
      const response = await api.post('/admin/login', { email, password })
      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('auth_type', 'admin')
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        setUser(response.data.user)
        setEmployee(null)
        return { success: true }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const employeeAuth = async (name, identityPhoto) => {
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('identity_photo', identityPhoto)

      const response = await api.post('/employee/auth', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('auth_type', 'employee')
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        setEmployee(response.data.employee)
        setUser(null)
        return { success: true }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Authentication failed' 
      }
    }
  }

  const adminLogout = async () => {
    try {
      await api.post('/admin/logout')
    } catch (error) {
      // swallow logout error
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_type')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setEmployee(null)
      authCheckedRef.current = false
    }
  }

  const employeeLogout = async () => {
    try {
      await api.post('/employee/logout')
    } catch (error) {
      // swallow logout error
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_type')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setEmployee(null)
      authCheckedRef.current = false
    }
  }

  const updateAdminProfile = async (profileData) => {
    try {
      const formData = new FormData()
      formData.append('name', profileData.name)
      formData.append('email', profileData.email)
      if (profileData.signature) {
        formData.append('signature', profileData.signature)
      }
      // Add method spoofing for PATCH request
      formData.append('_method', 'PATCH')

      const response = await api.post('/admin/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        setUser(response.data.user)
        return { success: true }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      }
    }
  }

  const updateEmployeeProfile = async (profileData) => {
    try {
      const formData = new FormData()
      formData.append('name', profileData.name)
      if (profileData.signature) {
        formData.append('signature', profileData.signature)
      }
      // Add method spoofing for PATCH request
      formData.append('_method', 'PATCH')

      const response = await api.post('/employee/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        setEmployee(response.data.employee)
        return { success: true }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      }
    }
  }

  const value = {
    user,
    employee,
    loading,
    adminLogin,
    employeeAuth,
    adminLogout,
    employeeLogout,
    updateAdminProfile,
    updateEmployeeProfile,
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
