import { useState } from 'react'
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
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Tugas hari ini
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Tugas selesai
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Tugas pending
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>
                  Tugas terbaru yang diberikan kepada Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada tugas</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Removed identity photo section as requested */}
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

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground mt-2">
                Kelola informasi profile dan preferensi Anda
              </p>
            </div>
            <ProfileForm />
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
