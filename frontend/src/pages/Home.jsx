import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { Skeleton } from '../components/ui/Skeleton'
import { Shield, User, ArrowRight } from 'lucide-react'

const Home = () => {
  const { isAuthenticated, isAdmin, isEmployee, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && isAdmin) {
        navigate('/admin/dashboard', { replace: true })
      } else if (isAuthenticated && isEmployee) {
        navigate('/employee/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, isAdmin, isEmployee, authLoading, navigate])

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8">
          <div className="flex justify-end">
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
          <div className="text-center space-y-4">
            <Skeleton className="mx-auto h-10 w-64" />
            <Skeleton className="mx-auto h-6 w-80" />
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {[...Array(2)].map((_, idx) => (
              <Card key={idx} className="transition-shadow">
                <CardHeader className="text-center space-y-4">
                  <Skeleton className="mx-auto h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="mx-auto h-6 w-40" />
                    <Skeleton className="mx-auto h-4 w-52" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-11 w-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="max-w-4xl w-full space-y-8">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Preventive Maintenance System
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Sistem manajemen pemeliharaan preventif yang efisien dan mudah digunakan
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>
                Akses dashboard administrator untuk mengelola sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
              >
                Login sebagai Admin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Employee Access</CardTitle>
              <CardDescription>
                Akses dashboard pegawai untuk melihat tugas dan update status
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link
                to="/employee/auth"
                className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                Masuk sebagai Pegawai
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home
