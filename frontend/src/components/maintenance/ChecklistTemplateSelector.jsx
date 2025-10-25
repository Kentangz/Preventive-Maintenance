import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { FileText, Loader2 } from 'lucide-react'
import api from '../../utils/api'

const ChecklistTemplateSelector = ({ category, onTemplateSelect }) => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(() => {
    fetchTemplates()
  }, [category])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/employee/checklist-templates/${category}`)
      
      if (response.data.success) {
        setTemplates(response.data.data)
        // Auto-select first template if only one exists
        if (response.data.data.length === 1) {
          handleTemplateSelect(response.data.data[0])
        }
      }
    } catch (err) {
      setError('Gagal memuat templates')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    onTemplateSelect(template)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Memuat templates...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Belum ada template untuk kategori ini</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`cursor-pointer transition-all ${
            selectedTemplate?.id === template.id
              ? 'border-primary bg-primary/5'
              : 'hover:border-primary/50'
          }`}
          onClick={() => handleTemplateSelect(template)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>Kategori: {category}</CardDescription>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {template.items?.length || 0} section checklist
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  template.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ChecklistTemplateSelector
