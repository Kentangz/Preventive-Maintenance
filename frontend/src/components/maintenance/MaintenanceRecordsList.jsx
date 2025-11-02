import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Search, Loader2, Download, FileText, User, Calendar, Eye } from 'lucide-react'
import api from '../../utils/api'

const MaintenanceRecordsList = ({ category }) => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewLoading, setPreviewLoading] = useState(null)

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
      setError('Gagal memuat maintenance records')
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
    
    console.log('Downloading PDF for record:', recordId)
    console.log('Token:', token ? 'Token exists' : 'No token')
    
    if (!token) {
      setError('Anda harus login terlebih dahulu')
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
      
      console.log('Response status:', response.status)
      
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
        const errorText = await response.text()
        console.error('Error response:', errorText)
        setError('Gagal mengunduh PDF')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      setError('Gagal mengunduh PDF: ' + error.message)
    }
  }

  const handlePreviewPDF = async (recordId) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL 
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      setError('Anda harus login terlebih dahulu')
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
        // Buka PDF di tab baru untuk preview
        window.open(url, '_blank')
        // Cleanup URL setelah beberapa detik
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 10000)
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        setError('Gagal membuka preview PDF')
      }
    } catch (error) {
      console.error('Error previewing PDF:', error)
      setError('Gagal membuka preview PDF: ' + error.message)
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
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Memuat records...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Belum ada maintenance record</p>
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
                        <strong>Location:</strong> {record.device_data?.location || '-'}
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
                      Download PDF
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
