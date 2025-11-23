import { useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import AlertDialog from '../ui/AlertDialog'
import Alert from '../ui/Alert'
import { Skeleton } from '../ui/Skeleton'
import ButtonLoader from '../ui/ButtonLoader'
import { Search, Download, Eye, Check, X, FileText, User, Calendar, Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useMaintenanceApprovals } from '../../hooks/useMaintenanceApprovals'
import { maintenanceService } from '../../services/maintenanceService'
import { DeleteButton } from '../ui/DeleteButton'

const AcceptManagement = ({ category, onPendingCountChange }) => {
  const [activeTab, setActiveTab] = useState('pending') // 'pending' or 'rejected'
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewLoading, setPreviewLoading] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null,
    variant: 'default'
  })
  const { user } = useAuth()

  const {
    pendingRecords,
    rejectedRecords,
    loading,
    error: fetchError,
    setError: setFetchError,
    acceptRecord,
    rejectRecord,
    deleteRecord: deleteRecordService,
  } = useMaintenanceApprovals(category, onPendingCountChange)

  const handlePreviewPDF = async (recordId) => {
    setPreviewLoading(recordId)
    
    try {
      const response = await maintenanceService.previewRecordPdf(recordId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 10000)
    } catch (error) {
      setError('Failed to open preview PDF: ' + error.message)
    } finally {
      setPreviewLoading(null)
    }
  }

  const handleDownloadPDF = async (recordId) => {
    try {
      const response = await maintenanceService.downloadRecordPdf(recordId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `maintenance_record_${recordId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Failed to download PDF: ' + error.message)
    }
  }

  const ensureSignature = () => {
    if (!user?.signature) {
      setMessage('')
      setError('Silakan upload tanda tangan Admin terlebih dahulu melalui halaman profil sebelum menerima submission.')
      return false
    }
    return true
  }

  const handleAccept = async (recordId) => {
    if (!ensureSignature()) {
      return
    }

    setConfirmDialog({
      open: true,
      title: 'Terima Submission',
      description: 'Apakah Anda yakin ingin menerima pengajuan ini?',
      onConfirm: async () => {
        setActionLoading(recordId)
        setError('')
        setMessage('')
        
        try {
          const result = await acceptRecord(recordId)
          if (result.success) {
            setMessage('Record accepted successfully')
            setFetchError('')
            setError('')
          } else {
            setError(result.message || 'Failed to accept record')
          }
        } catch (err) {
          setError(err?.message || 'Failed to accept record')
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
      description: 'Apakah Anda yakin ingin menolak pengajuan ini?',
      onConfirm: async () => {
        setActionLoading(recordId)
        setError('')
        setMessage('')
        
        try {
          const result = await rejectRecord(recordId)
          if (result.success) {
            setMessage('Record rejected successfully')
            setFetchError('')
            setError('')
          } else {
            setError(result.message || 'Failed to reject record')
          }
        } catch (err) {
          setError(err?.message || 'Failed to reject record')
        } finally {
          setActionLoading(null)
        }
      },
      variant: 'destructive'
    })
  }

  const handleDeleteRecord = async (recordId) => {
    const record = activeTab === 'pending' 
      ? pendingRecords.find(r => r.id === recordId)
      : rejectedRecords.find(r => r.id === recordId)
    const deviceName = record?.device_data?.device || 'catatan ini'
    const statusText = activeTab === 'pending' ? 'tertunda' : 'ditolak'
    
    setConfirmDialog({
      open: true,
      title: 'Hapus Catatan Maintenance',
      description: `Apakah Anda yakin ingin menghapus permanen catatan maintenance berstatus ${statusText} untuk "${deviceName}"? Tindakan ini tidak dapat dibatalkan. Seluruh data termasuk foto dan catatan akan terhapus permanen.`,  
      onConfirm: async () => {
        setDeleteLoading(recordId)
        setError('')
        setMessage('')
        
        try {
          const result = await deleteRecordService(recordId)
          if (result.success) {
            setMessage('Record deleted successfully')
            setFetchError('')
            setError('')
          } else {
            setError(result.message || 'Failed to delete record')
          }
        } catch (err) {
          setError(err?.message || 'Failed to delete record')
        } finally {
          setDeleteLoading(null)
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
  const displayError = error || fetchError

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
      
      {displayError && (
        <Alert
          variant="error"
          message={displayError}
          onClose={() => {
            setError('')
            setFetchError('')
          }}
        />
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Pending ({pendingRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rejected'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
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
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, idx) => (
            <Card key={idx}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                      disabled={previewLoading === record.id || deleteLoading === record.id}
                    >
                      {previewLoading === record.id ? (
                        <ButtonLoader labelClassName="w-16" className="w-auto" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(record.id)}
                      disabled={deleteLoading === record.id}
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
                            <ButtonLoader labelClassName="w-16" className="w-auto" />
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
                            <ButtonLoader labelClassName="w-16" className="w-auto" />
                          ) : (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
                    {activeTab === 'rejected' && (
                      <DeleteButton
                        onClick={() => handleDeleteRecord(record.id)}
                        loading={deleteLoading === record.id}
                        disabled={deleteLoading === record.id}
                        title="Permanently delete this maintenance record"
                      />
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