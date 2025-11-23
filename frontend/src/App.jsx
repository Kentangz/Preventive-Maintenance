import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'
import { APP_CONFIG } from './config/app'
import { Card, CardContent } from './components/ui/Card'
import { Skeleton } from './components/ui/Skeleton'
import Alert from './components/ui/Alert'
import Home from './pages/Home'
import AdminLogin from './components/auth/AdminLogin'
import EmployeeAuth from './components/auth/EmployeeAuth'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isAdmin, isEmployee, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, idx) => (
              <Card key={idx}>
                <CardContent className="space-y-4 p-6">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
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

const AppContent = () => {
  const { sessionExpiredMessage, setSessionExpiredMessage } = useAuth()

  return (
    <>
      {sessionExpiredMessage && (
        <Alert
          variant="warning"
          title="Sesi Berakhir"
          message={sessionExpiredMessage}
          onClose={() => setSessionExpiredMessage('')}
          duration={5000}
        />
      )}
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
    </>
  )
}

function App() {
  return (
    <ThemeProvider 
      defaultTheme={APP_CONFIG.theme.defaultTheme} 
      storageKey={APP_CONFIG.theme.storageKey}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
