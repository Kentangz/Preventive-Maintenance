import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import ProfileForm from '../components/auth/ProfileForm'
import ChecklistTemplateSelector from '../components/maintenance/ChecklistTemplateSelector'
import ChecklistForm from '../components/maintenance/ChecklistForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { User, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Skeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'

const EmployeeDashboard = () => {
  const [activeItem, setActiveItem] = useState('dashboard')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const { employee } = useAuth()

  // Reset selectedTemplate when switching categories
  useEffect(() => {
    const categoryItems = ['printer', 'switch', 'vvip', 'pc_desktop', 'access_point']
    if (categoryItems.includes(activeItem)) {
      setSelectedTemplate(null)
    }
  }, [activeItem])

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Employee Dashboard</h1>
              {employee ? (
                <p className="text-muted-foreground mt-2">Selamat datang, {employee.name}! Dashboard pegawai Anda.</p>
              ) : (
                <div className="mt-3 w-full max-w-sm">
                  <Skeleton className="h-5 w-56" />
                </div>
              )}
            </div>
            
            <ProfileForm />
          </div>
        )
      
      case 'printer':
      case 'switch':
      case 'vvip':
      case 'pc_desktop':
      case 'access_point':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground capitalize">{activeItem.replace('_', ' ')}</h1>
              <p className="text-muted-foreground mt-2">
                Form checklist untuk {activeItem.replace('_', ' ')}
              </p>
            </div>
            
            {!selectedTemplate ? (
              <ChecklistTemplateSelector 
                category={activeItem} 
                onTemplateSelect={setSelectedTemplate}
              />
            ) : (
              <div className="space-y-4">
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  ← Kembali ke Pilih Template
                </Button>
                <ChecklistForm category={activeItem} template={selectedTemplate} />
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      <div className="lg:ml-64">
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default EmployeeDashboard
