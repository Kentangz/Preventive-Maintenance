import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import AlertDialog from '../ui/AlertDialog'
import { Plus, Trash2, Edit, Download, Loader2, Files as FilesIcon } from 'lucide-react'
import api from '../../utils/api'

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document: null
  })
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null,
    variant: 'default'
  })

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/schedules')
      if (response.data.success) {
        setSchedules(response.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch schedules')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        document: file
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description || '')
      
      if (formData.document) {
        submitData.append('document', formData.document)
      }

      let response
      if (editingSchedule) {
        // Update
        response = await api.put(`/admin/schedules/${editingSchedule.id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        setMessage('Schedule updated successfully')
      } else {
        // Create
        response = await api.post('/admin/schedules', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        setMessage('Schedule created successfully')
      }

      if (response.data.success) {
        fetchSchedules()
        resetForm()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      document: null
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    setConfirmDialog({
      open: true,
      title: 'Hapus Dokumen',
      description: 'Apakah Anda yakin ingin menghapus dokumen ini?',
      onConfirm: async () => {
        setLoading(true)
        try {
          const response = await api.delete(`/admin/schedules/${id}`)
          if (response.data.success) {
            setMessage('Dokumen berhasil dihapus')
            fetchSchedules()
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Gagal menghapus dokumen')
        } finally {
          setLoading(false)
        }
      },
      variant: 'destructive'
    })
  }

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/admin/schedules/${id}/download`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from Content-Disposition header or use schedule name
      const contentDisposition = response.headers['content-disposition']
      let filename = 'document'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Failed to download document')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      document: null
    })
    setEditingSchedule(null)
    setShowForm(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
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
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kelola Dokumen</h1>
          <p className="text-muted-foreground mt-2">
            Kelola dokumen dan upload dokumen terkait
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Dokumen
          </Button>
        )}
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingSchedule ? 'Edit Dokumen' : 'Tambah Dokumen Baru'}</CardTitle>
            <CardDescription>
              {editingSchedule ? 'Update' : 'Buat'} dokumen baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Judul Dokumen *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Masukkan judul dokumen"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Masukkan deskripsi dokumen"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <Label htmlFor="document">Dokumen (Format Bebas)</Label>
                <Input
                  id="document"
                  type="file"
                  onChange={handleFileChange}
                  accept="*/*"
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload dokumen dalam format apapun (PDF, Word, Excel, dll). Maksimal 10MB.
                </p>
                {editingSchedule && editingSchedule.document_name && (
                  <p className="text-xs text-blue-600 mt-1">
                    Dokumen saat ini: {editingSchedule.document_name}
                    {editingSchedule.document_size && ` (${formatFileSize(editingSchedule.document_size)})`}
                  </p>
                )}
                {formData.document && (
                  <p className="text-xs text-green-600 mt-1">
                    File dipilih: {formData.document.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    editingSchedule ? 'Update Dokumen' : 'Simpan Dokumen'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {loading && schedules.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
                  <p>Memuat dokumen...</p>
                </div>
              </CardContent>
            </Card>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <FilesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada dokumen</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{schedule.title}</h3>
                      {schedule.description && (
                        <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <FilesIcon className="h-4 w-4" />
                          <span>Dibuat: {formatDate(schedule.created_at)}</span>
                        </div>
                        {schedule.document_name && (
                          <div className="flex items-center gap-2">
                            <span>Dokumen: {schedule.document_name}</span>
                            {schedule.document_size && (
                              <span className="text-xs">({formatFileSize(schedule.document_size)})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {schedule.document_path && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(schedule.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ScheduleManagement