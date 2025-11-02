import { useState, useEffect, useCallback } from 'react'
import MaintenanceRecordsList from './MaintenanceRecordsList'
import AcceptManagement from './AcceptManagement'
import api from '../../utils/api'

const CategoryManagement = ({ category }) => {
  const [activeTab, setActiveTab] = useState('records') // 'records' or 'accept'
  const [pendingCount, setPendingCount] = useState(0)

  const categoryLabel = category.replace('_', ' ')

  const fetchPendingCount = useCallback(async () => {
    try {
      const response = await api.get(`/admin/maintenance-records/pending/${category}`)
      if (response.data.success) {
        setPendingCount(response.data.data?.length || 0)
      }
    } catch {
      setPendingCount(0)
    }
  }, [category])

  useEffect(() => {
    fetchPendingCount()
    // Refresh count every 30 seconds
    const interval = setInterval(() => {
      fetchPendingCount()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [category, fetchPendingCount])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground capitalize">{categoryLabel}</h1>
        <p className="text-muted-foreground mt-2">
          Manage maintenance records for category {categoryLabel}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('records')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'records'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            Maintenance Records
          </button>
          <button
            onClick={() => setActiveTab('accept')}
            className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
              activeTab === 'accept'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <span className="relative inline-block">
              Acceptance
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-background"></span>
              )}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'records' ? (
        <MaintenanceRecordsList category={category} />
      ) : (
        <AcceptManagement category={category} onPendingCountChange={setPendingCount} />
      )}
    </div>
  )
}

export default CategoryManagement

