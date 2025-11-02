import { useState } from 'react'
import MaintenanceRecordsList from './MaintenanceRecordsList'
import AcceptManagement from './AcceptManagement'

const CategoryManagement = ({ category }) => {
  const [activeTab, setActiveTab] = useState('records') // 'records' or 'accept'

  const categoryLabel = category.replace('_', ' ')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground capitalize">{categoryLabel}</h1>
        <p className="text-muted-foreground mt-2">
          Kelola maintenance records untuk kategori {categoryLabel}
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
            Records
          </button>
          <button
            onClick={() => setActiveTab('accept')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'accept'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            Accept
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'records' ? (
        <MaintenanceRecordsList category={category} />
      ) : (
        <AcceptManagement category={category} />
      )}
    </div>
  )
}

export default CategoryManagement

