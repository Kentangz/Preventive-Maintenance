import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import AlertDialog from '../ui/AlertDialog'
import Alert from '../ui/Alert'
import { Skeleton } from '../ui/Skeleton'
import ButtonLoader from '../ui/ButtonLoader'
import { Plus, Trash2, Edit, Download, Files as FilesIcon, Search, User as UserIcon } from 'lucide-react' 
import { scheduleService } from '../../services/scheduleService'
import { useSchedules } from '../../hooks/useSchedules'
import { DeleteButton } from '../ui/DeleteButton'

const ScheduleManagement = () => {
  const {
    schedules,
    loading: fetching,
    error: fetchError,
    setError: setFetchError,
    saveSchedule,
    deleteSchedule,
  } = useSchedules()

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

  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('tanggal-desc') 
  const displayError = useMemo(() => error || fetchError, [error, fetchError])

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
      
      const result = await saveSchedule(submitData, editingSchedule?.id)

      if (result.success) {
        setMessage(
          result.message || (editingSchedule ? 'Schedule updated successfully' : 'Schedule created successfully')
        )
        setError('')
        setFetchError('')
        resetForm()
      } else {
        setError(result.message || 'Failed to save schedule')
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
          const result = await deleteSchedule(id)
          if (result.success) {
            setMessage(result.message || 'Dokumen berhasil dihapus')
            setError('')
            setFetchError('')
          } else {
            setError(result.message || 'Gagal menghapus dokumen')
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
      const response = await scheduleService.download(id)
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
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

  const filteredAndSortedSchedules = schedules
    .filter(schedule => 
      schedule.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case 'nama-asc':
          return a.title.localeCompare(b.title)
        case 'nama-desc':
          return b.title.localeCompare(a.title)
        case 'tanggal-asc':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'tanggal-desc':
        default:
          return new Date(b.created_at) - new Date(a.created_at)
      }
    })

  return (
    <div className="space-y-6">
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
                  className="flex w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <Label htmlFor="document">Dokumen (Format Bebas)</Label>
                <Input
                  id="document"
                  type="file"
                  onChange={handleFileChange}
                  accept="*/*"
                  required
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload dokumen dalam format apapun (PDF, Word, Excel, dll)
                </p>
                {editingSchedule && editingSchedule.document_name && (
                  <p className="text-sm text-primary mt-1">
                    Dokumen saat ini: {editingSchedule.document_name}
                    {editingSchedule.document_size && ` (${formatFileSize(editingSchedule.document_size)})`}
                  </p>
                )}
                {formData.document && (
                  <p className="text-sm text-emerald-500 dark:text-emerald-400 mt-1">
                    File dipilih: {formData.document.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <ButtonLoader labelClassName="w-24" />
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
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Label htmlFor="search" className="sr-only">Cari Dokumen</Label>
              <Input
                id="search"
                type="text"
                placeholder="Cari berdasarkan judul dokumen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
            </div>
            
            <div className="flex-none">
              <Label htmlFor="sort" className="sr-only">Urutkan</Label>
              <select
                id="sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full sm:w-auto h-10 px-3 py-2 border rounded-md text-sm bg-background text-foreground"
              >
                <option value="tanggal-desc">Tanggal (Terbaru)</option>
                <option value="tanggal-asc">Tanggal (Terlama)</option>
                <option value="nama-asc">Nama (A-Z)</option>
                <option value="nama-desc">Nama (Z-A)</option>
              </select>
            </div>
          </div>

          {fetching && schedules.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-24 w-full" />
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
          ) : filteredAndSortedSchedules.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <FilesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada dokumen yang cocok dengan pencarian Anda.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedSchedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{schedule.title}</h3>
                      {schedule.description && (
                        <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                        {schedule.user && (
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span>Di-upload oleh: {schedule.user.name}</span>
                          </div>
                        )}

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
                      <DeleteButton
                        onClick={() => handleDelete(schedule.id)}
                      />
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