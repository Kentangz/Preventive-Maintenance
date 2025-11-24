import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import AlertDialog from '../ui/AlertDialog'
import Alert from '../ui/Alert'
import { Skeleton } from '../ui/Skeleton'
import ButtonLoader from '../ui/ButtonLoader'
import { Edit, Trash2, Search, FileText, Copy, ArrowUpDown, ArrowUp, ArrowDown, PcCase, Hash, QrCode, MapPin } from 'lucide-react'
import { useAdminTemplates } from '../../hooks/useAdminTemplates'
import { DeleteButton } from '../ui/DeleteButton'

const TemplateList = ({ onEdit, onRefresh, externalSuccess = '', onClearExternalSuccess }) => {
  const {
    templates,
    loading,
    error: fetchError,
    setError: setFetchError,
    deleteTemplate,
    duplicateTemplate,
  } = useAdminTemplates()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [deletingId, setDeletingId] = useState(null)
  const [duplicatingId, setDuplicatingId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null,
    variant: 'default'
  })

  const displayError = error || fetchError

  useEffect(() => {
    if (externalSuccess) {
      setSuccess(externalSuccess)
      onClearExternalSuccess?.()
    }
  }, [externalSuccess, onClearExternalSuccess])

  const handleDelete = async (id) => {
    setSuccess('')
    setError('')
    setConfirmDialog({
      open: true,
      title: 'Hapus Template',
      description: 'Apakah Anda yakin ingin menghapus template ini? Catatan yang sudah dibuat dengan template ini akan tetap tersimpan.',
      onConfirm: async () => {
        try {
          setDeletingId(id)
          const result = await deleteTemplate(id)

          if (result.success) {
            onRefresh?.()
            setFetchError('')
            setError('')
            setSuccess('Template berhasil dihapus')
          } else {
            setError(result.message || 'Failed to delete template')
            setSuccess('')
          }
        } catch (err) {
          setError(err?.message || 'Failed to delete template')
          setSuccess('')
        } finally {
          setDeletingId(null)
        }
      },
      variant: 'destructive'
    })
  }

  const handleDuplicate = async (template) => {
    try {
      setDuplicatingId(template.id)
      setSuccess('')
      const result = await duplicateTemplate(template.id)

      if (result.success) {
        onRefresh?.()
        setFetchError('')
        setError('')
        setSuccess('Template berhasil diduplikasi')
      } else {
        setError(result.message || 'Failed to duplicate template')
        setSuccess('')
      }
    } catch (err) {
      setError(err?.message || 'Failed to duplicate template')
      setSuccess('')
    } finally {
      setDuplicatingId(null)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const searchLower = searchQuery.toLowerCase()
    const deviceName = template.device_fields?.device?.toLowerCase() || ''
    const templateName = template.name.toLowerCase()
    const assetId = template.device_fields?.id_tagging_asset?.toLowerCase() || ''
    const serialNumber = template.device_fields?.serial_number?.toLowerCase() || ''

    const matchesSearch = templateName.includes(searchLower) || 
                          deviceName.includes(searchLower) ||
                          assetId.includes(searchLower) ||
                          serialNumber.includes(searchLower)
    
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'name':
        aValue = (a.device_fields?.device || a.name).toLowerCase()
        bValue = (b.device_fields?.device || b.name).toLowerCase()
        break
      case 'category':
        aValue = a.category.toLowerCase()
        bValue = b.category.toLowerCase()
        break
      case 'is_active':
        aValue = a.is_active ? 1 : 0
        bValue = b.is_active ? 1 : 0
        break
      case 'created_at':
      default:
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
        break
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <Skeleton className="h-10 w-full md:flex-1 rounded-md" />
              <Skeleton className="h-10 w-48 rounded-md" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, idx) => (
                <Skeleton key={idx} className="h-9 w-24 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, idx) => (
            <Card key={idx}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="grid gap-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-32">
                    <Skeleton className="h-9 w-full rounded-md" />
                    <Skeleton className="h-9 w-full rounded-md" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>
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

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari (Nama Device, Asset ID, Serial...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Semua Kategori</option>
                <option value="printer">Printer</option>
                <option value="switch">Switch</option>
                <option value="vvip">VVIP</option>
                <option value="pc_desktop">PC/Desktop</option>
                <option value="access_point">Access Point</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {success && (
        <Alert
          variant="success"
          message={success}
          onClose={() => setSuccess('')}
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

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No template</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Template List ({filteredTemplates.length})</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={sortBy === 'name' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1"
                    >
                      Nama {getSortIcon('name')}
                    </Button>
                    <Button
                      variant={sortBy === 'category' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-1"
                    >
                      Kategori {getSortIcon('category')}
                    </Button>
                    <Button
                      variant={sortBy === 'is_active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSort('is_active')}
                      className="flex items-center gap-1"
                    >
                      Status {getSortIcon('is_active')}
                    </Button>
                    <Button
                      variant={sortBy === 'created_at' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1"
                    >
                      Tanggal {getSortIcon('created_at')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4">
            {filteredTemplates.map((template) => {
              
              const deviceFields = template.device_fields || {}
              const title = deviceFields.device || template.name

              const descriptionFields = [
                { icon: QrCode, label: 'Asset ID', value: deviceFields.id_tagging_asset },
                { icon: PcCase, label: 'Merk/Type', value: deviceFields.merk_type },
                { icon: Hash, label: 'Serial', value: deviceFields.serial_number },
                { icon: MapPin, label: 'Lokasi', value: deviceFields.location },
              ].filter(field => field.value)

              return (
                <Card key={template.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0"> 
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold truncate" title={title}>
                            {title}
                          </h3>

                          <span className={`px-2 py-1 text-xs rounded ${
                            template.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {template.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                          <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary capitalize">
                            {template.category}
                          </span>
                        </div>
                        
                        {/* Tampilkan detail device fields */}
                        {descriptionFields.length > 0 ? (
                          <div className="text-sm text-muted-foreground mb-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                            {descriptionFields.map(field => (
                              <div key={field.label} className="flex items-center gap-2 truncate" title={field.value}>
                                <field.icon className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  <strong>{field.label}:</strong> {field.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mb-3 italic">
                            (No device details)
                          </p>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Dibuat: {new Date(template.created_at).toLocaleDateString('id-ID')} | {template.items?.length || 0} section checklist
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(template)}
                        >
                          <Edit className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(template)}
                          disabled={duplicatingId === template.id}
                        >
                          {duplicatingId === template.id ? (
                            <ButtonLoader labelClassName="w-16" className="w-auto" />
                          ) : (
                            <>
                              <Copy className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Duplicate</span>
                            </>
                          )}
                        </Button>
                        <DeleteButton
                          onClick={() => handleDelete(template.id)}
                          loading={deletingId === template.id}
                          disabled={deletingId === template.id}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateList