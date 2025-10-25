import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import ProfileForm from '../components/auth/ProfileForm'
import ChecklistBuilder from '../components/maintenance/ChecklistBuilder'
import TemplateList from '../components/maintenance/TemplateList'
import MaintenanceRecordsList from '../components/maintenance/MaintenanceRecordsList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Shield, Users, Settings, Activity, Plus } from 'lucide-react'
import { Skeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'

const AdminDashboard = () => {
  const [activeItem, setActiveItem] = useState('dashboard')
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('printer')
  const { user } = useAuth()

  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              {user ? (
                <p className="text-muted-foreground mt-2">Selamat datang, {user.name}! Kelola sistem maintenance dari sini.</p>
              ) : (
                <div className="mt-3 w-full max-w-sm">
                  <Skeleton className="h-5 w-56" />
                </div>
              )}
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">
                    Admin aktif
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Pegawai terdaftar
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Jadwal maintenance
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activity</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Aktivitas hari ini
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Aktivitas terbaru dalam sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada aktivitas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      case 'manage-checklist':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Kelola Form Checklist</h1>
                <p className="text-muted-foreground mt-2">
                  Kelola template checklist untuk maintenance
                </p>
              </div>
              {!editingTemplate && !showBuilder && (
                <div className="flex gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border rounded-md bg-background"
                  >
                    <option value="printer">Printer</option>
                    <option value="switch">Switch</option>
                    <option value="vvip">VVIP</option>
                  </select>
                  <Button onClick={() => setShowBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Template Baru
                  </Button>
                </div>
              )}
            </div>
            
            {showBuilder || editingTemplate ? (
              <div className="space-y-4">
                <Button variant="outline" onClick={() => {
                  setShowBuilder(false)
                  setEditingTemplate(null)
                }}>
                  ← Kembali ke Daftar Template
                </Button>
                <ChecklistBuilder 
                  category={selectedCategory}
                  template={editingTemplate}
                  onSave={() => {
                    setShowBuilder(false)
                    setEditingTemplate(null)
                  }}
                />
              </div>
            ) : (
              <TemplateList 
                onEdit={(template) => setEditingTemplate(template)}
                onRefresh={() => {}}
              />
            )}
          </div>
        )

      case 'printer':
      case 'switch':
      case 'vvip':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground capitalize">{activeItem}</h1>
              <p className="text-muted-foreground mt-2">
                Daftar maintenance record untuk kategori {activeItem}
              </p>
            </div>
            <MaintenanceRecordsList category={activeItem} />
          </div>
        )

      case 'schedule':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Jadwal</h1>
              <p className="text-muted-foreground mt-2">
                Menu jadwal
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Menu jadwal
                </p>
              </CardContent>
            </Card>
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

export default AdminDashboard
