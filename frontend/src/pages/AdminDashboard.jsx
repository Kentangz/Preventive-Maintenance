import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import ProfileForm from '../components/auth/ProfileForm'
import ChecklistBuilder from '../components/maintenance/ChecklistBuilder'
import TemplateList from '../components/maintenance/TemplateList'
import MaintenanceRecordsList from '../components/maintenance/MaintenanceRecordsList'
import AcceptManagement from '../components/maintenance/AcceptManagement'
import CategoryManagement from '../components/maintenance/CategoryManagement'
import ScheduleManagement from '../components/maintenance/ScheduleManagement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Shield, Plus } from 'lucide-react'
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
            
            <ProfileForm />
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
                    <option value="pc_desktop">PC/Desktop</option>
                    <option value="access_point">Access Point</option>
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
      case 'pc_desktop':
      case 'access_point':
        return <CategoryManagement category={activeItem} />

      case 'schedule':
        return <ScheduleManagement />

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
