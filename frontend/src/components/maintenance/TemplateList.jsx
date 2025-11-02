import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Edit, Trash2, Search, Loader2, FileText, Copy, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
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
      setError('Gagal memuat templates')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      return
    }

    try {
      setDeletingId(id)
      const response = await api.delete(`/admin/checklist-templates/${id}`)
      
      if (response.data.success) {
        setTemplates(templates.filter(t => t.id !== id))
        if (onRefresh) onRefresh()
      }
    } catch {
      setError('Gagal menghapus template')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDuplicate = async (template) => {
    try {
      setDuplicatingId(template.id)
      
      const response = await api.post(`/admin/checklist-templates/${template.id}/duplicate`)
      
      if (response.data.success) {
        // Refresh templates list
        await fetchTemplates()
        if (onRefresh) onRefresh()
        setError('')
      }
    } catch {
      setError('Gagal menduplikasi template')
    } finally {
      setDuplicatingId(null)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
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
        <p className="text-muted-foreground">Memuat templates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari template..."
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

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Belum ada template</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Sort Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Daftar Template ({filteredTemplates.length})</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Urutkan berdasarkan:</span>
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
            {filteredTemplates.map((template) => (
            <Card key={template.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        template.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary capitalize">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.items?.length || 0} section checklist
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Dibuat: {new Date(template.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(template)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
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
                          <Copy className="h-4 w-4 mr-2" />
                          Duplikat
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
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateList
