import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import AlertDialog from '../ui/AlertDialog'
import Alert from '../ui/Alert'
import { Edit, Trash2, Search, Loader2, FileText, Copy, ArrowUpDown, ArrowUp, ArrowDown, PcCase, Hash, QrCode, MapPin } from 'lucide-react'
import api from '../../utils/api'

const TemplateList = ({ onEdit, onRefresh }) => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/checklist-templates')
      
      if (response.data.success) {
        setTemplates(response.data.data)
      }
    } catch {
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Template',
      description: 'Are you sure you want to delete this template? Records created with this template will still be saved.',
      onConfirm: async () => {
        try {
          setDeletingId(id)
          const response = await api.delete(`/admin/checklist-templates/${id}`)
          
          if (response.data.success) {
            setTemplates(templates.filter(t => t.id !== id))
            if (onRefresh) onRefresh()
            setError('')
          }
        } catch {
          setError('Failed to delete template')
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
      
      const response = await api.post(`/admin/checklist-templates/${template.id}/duplicate`)
      
      if (response.data.success) {
        await fetchTemplates()
        if (onRefresh) onRefresh()
        setError('')
      }
    } catch {
      setError('Failed to duplicate template')
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
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading templates...</p>
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

      {error && (
        <Alert
          variant="error"
          message={error}
          onClose={() => setError('')}
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
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Copy className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Duplicate</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          disabled={deletingId === template.id}
                          className="text-destructive hover:text-destructive"
                        >
                          {deletingId === template.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Delete</span>
                            </>
                          )}
                        </Button>
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