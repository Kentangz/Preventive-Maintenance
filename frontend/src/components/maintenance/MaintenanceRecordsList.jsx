import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import AlertDialog from '../ui/AlertDialog'
import Alert from '../ui/Alert'
import { Skeleton } from '../ui/Skeleton'
import { Search, Download, FileText, User, Calendar, Eye, Trash2 } from 'lucide-react'
import api from '../../utils/api'

const MaintenanceRecordsList = ({ category }) => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewLoading, setPreviewLoading] = useState(null)
  const [deleteRecordLoading, setDeleteRecordLoading] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null,
    variant: 'default'
  })

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/maintenance-records', {
        params: { category }
      })
      
      if (response.data.success) {
        setRecords(response.data.data)
      }
    } catch {
      setError('Failed to load maintenance records')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleDownloadPDF = async (recordId) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL 
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      setError('Invalid Credentials')
      return
    }
    
    try {
      const response = await fetch(`${apiBaseUrl}/maintenance-records/${recordId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `maintenance_record_${recordId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        await response.text()
        setError('Failed to download PDF')
      }
    } catch (error) {
      setError('Failed to download PDF: ' + error.message)
    }
  }

  const handleDeleteRecord = async (recordId) => {
    const record = records.find(r => r.id === recordId)
    const deviceName = record?.device_data?.device || 'this record'
    
    setConfirmDialog({
      open: true,
      title: 'Delete Maintenance Record',
      description: `Are you sure you want to permanently delete the maintenance record for "${deviceName}"? This action cannot be undone. All data including PDF, photos, and records will be permanently deleted.`,  
      onConfirm: async () => {
        setDeleteRecordLoading(recordId)
        setError('')
        setMessage('')
        
        try {
          const response = await api.delete(`/admin/maintenance-records/${recordId}`)
          if (response.data.success) {
            setMessage(response.data.message || 'Record deleted successfully')
            fetchRecords()
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to delete record')
        } finally {
          setDeleteRecordLoading(null)
        }
      },
      variant: 'destructive'
    })
  }

  const handlePreviewPDF = async (recordId) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL 
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      setError('Invalid Credentials')
      return
    }
    
    setPreviewLoading(recordId)
    
    try {
      const response = await fetch(`${apiBaseUrl}/maintenance-records/${recordId}/preview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 10000)
      } else {
        await response.text()
        setError('Failed to open preview PDF')
      }
    } catch (error) {
      setError('Failed to open preview PDF: ' + error.message)
    } finally {
      setPreviewLoading(null)
    }
  }

  const filteredRecords = records.filter(record => {
    const employeeName = record.employee?.name?.toLowerCase() || ''
    const deviceName = record.device_data?.device?.toLowerCase() || ''
    const searchLower = searchQuery.toLowerCase()
    return employeeName.includes(searchLower) || deviceName.includes(searchLower)
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, idx) => (
            <Card key={idx}>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-28 rounded-md" />
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Ya"
        cancelText="Batal"
        onConfirm={confirmDialog.onConfirm || (() => {})}
        variant={confirmDialog.variant}
      />

      {message && (
        <Alert
          variant="success"
          message={message}
          onClose={() => setMessage('')}
        />
      )}

      {error && (
        <Alert
          variant="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama pegawai atau device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No maintenance record</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {record.device_data?.device || 'Unknown Device'}
                      </h3>
                      <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">
                        {record.category || record.template?.category || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{record.employee?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(record.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div>
                        <strong>Location:</strong> {record.device_data?.location || 'Unknown'}
                      </div>
                      <div>
                        <strong>Serial Number:</strong> {record.device_data?.serial_number || '-'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewPDF(record.id)}
                      disabled={previewLoading === record.id}
                    >
                      {previewLoading === record.id ? (
                        <div className="flex w-full items-center justify-center gap-2">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-14 rounded-md" />
                        </div>
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(record.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRecord(record.id)}
                      disabled={deleteRecordLoading === record.id}
                      title="Permanently delete this maintenance record including PDF and all related data"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteRecordLoading === record.id ? (
                        <div className="flex w-full items-center justify-center gap-2">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-20 rounded-md" />
                        </div>
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete Record
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default MaintenanceRecordsList
