import { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import AlertDialog from '../ui/AlertDialog'
import { Search, Loader2, Download, Eye, Check, X, FileText, User, Calendar } from 'lucide-react'
import api from '../../utils/api'

const AcceptManagement = ({ category }) => {
  const [activeTab, setActiveTab] = useState('pending') // 'pending' or 'rejected'
  const [pendingRecords, setPendingRecords] = useState([])
  const [rejectedRecords, setRejectedRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewLoading, setPreviewLoading] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null,
    variant: 'default'
  })

  useEffect(() => {
    fetchPendingRecords()
    fetchRejectedRecords()
  }, [category])

  const fetchPendingRecords = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/maintenance-records/pending/${category}`)
      if (response.data.success) {
        setPendingRecords(response.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat pending records')
    } finally {
      setLoading(false)
    }
  }

  const fetchRejectedRecords = async () => {
    try {
      const response = await api.get(`/admin/maintenance-records/rejected/${category}`)
      if (response.data.success) {
        setRejectedRecords(response.data.data)
      }
    } catch  {
      // Silent error for rejected records
    }
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
        setError('Failed to open preview PDF')
      }
    } catch (error) {
      setError('Failed to open preview PDF: ' + error.message)
    } finally {
      setPreviewLoading(null)
    }
  }

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
        setError('Failed to download PDF')
      }
    } catch (error) {
      setError('Failed to download PDF: ' + error.message)
    }
  }

  const handleAccept = async (recordId) => {
    setConfirmDialog({
      open: true,
      title: 'Terima Submission',
      description: 'Are you sure you want to accept this submission?',
      onConfirm: async () => {
        setActionLoading(recordId)
        setError('')
        setMessage('')
        
        try {
          const response = await api.post(`/admin/maintenance-records/${recordId}/accept`)
          if (response.data.success) {
            setMessage('Record accepted successfully')
            fetchPendingRecords()
            fetchRejectedRecords()
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to accept record')
        } finally {
          setActionLoading(null)
        }
      },
      variant: 'default'
    })
  }

  const handleReject = async (recordId) => {
    setConfirmDialog({
      open: true,
      title: 'Tolak Submission',
      description: 'Are you sure you want to reject this submission?',
      onConfirm: async () => {
        setActionLoading(recordId)
        setError('')
        setMessage('')
        
        try {
          const response = await api.post(`/admin/maintenance-records/${recordId}/reject`)
          if (response.data.success) {
            setMessage('Record rejected successfully')
            fetchPendingRecords()
            fetchRejectedRecords()
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to reject record')
        } finally {
          setActionLoading(null)
        }
      },
      variant: 'destructive'
    })
  }

  const filteredPendingRecords = pendingRecords.filter(record => {
    const employeeName = record.employee?.name?.toLowerCase() || ''
    const deviceName = record.device_data?.device?.toLowerCase() || ''
    const searchLower = searchQuery.toLowerCase()
    return employeeName.includes(searchLower) || deviceName.includes(searchLower)
  })

  const filteredRejectedRecords = rejectedRecords.filter(record => {
    const employeeName = record.employee?.name?.toLowerCase() || ''
    const deviceName = record.device_data?.device?.toLowerCase() || ''
    const searchLower = searchQuery.toLowerCase()
    return employeeName.includes(searchLower) || deviceName.includes(searchLower)
  })

  const recordsToShow = activeTab === 'pending' ? filteredPendingRecords : filteredRejectedRecords

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
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            Pending ({pendingRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rejected'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            Rejected ({rejectedRecords.length})
          </button>
        </nav>
      </div>

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
      {loading && recordsToShow.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading records...</p>
          </CardContent>
        </Card>
      ) : recordsToShow.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No {activeTab === 'pending' ? 'pending' : 'rejected'} records
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recordsToShow.map((record) => (
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
                      {activeTab === 'rejected' && record.approvals && record.approvals.length > 0 && (
                        <span className="px-2 py-1 text-xs rounded bg-destructive/10 text-destructive">
                          Ditolak oleh: {record.approvals[0]?.admin?.name || 'Admin'}
                        </span>
                      )}
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
                        <strong>Location:</strong> {record.device_data?.location || '-'}
                      </div>
                      <div>
                        <strong>Serial Number:</strong> {record.device_data?.serial_number || '-'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewPDF(record.id)}
                      disabled={previewLoading === record.id}
                    >
                      {previewLoading === record.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                      Download
                    </Button>
                    {activeTab === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAccept(record.id)}
                          disabled={actionLoading === record.id}
                        >
                          {actionLoading === record.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(record.id)}
                          disabled={actionLoading === record.id}
                        >
                          {actionLoading === record.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
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

export default AcceptManagement

