import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Home from './pages/Home'
import AdminLogin from './components/auth/AdminLogin'
import EmployeeAuth from './components/auth/EmployeeAuth'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isAdmin, isEmployee, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/employee/dashboard" replace />
  }

  if (requiredRole === 'employee' && !isEmployee) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="preventive-maintenance-theme">
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/employee/auth" element={<EmployeeAuth />} />
              
              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Employee Routes */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute requiredRole="employee">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
