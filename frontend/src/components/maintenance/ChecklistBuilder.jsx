import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Trash2, Plus, Save, Eye, Edit, Loader2 } from 'lucide-react'
import api from '../../utils/api'

const ChecklistBuilder = ({ category, template, onSave }) => {
  const [formData, setFormData] = useState({
    category: category || 'printer',
    name: '',
    device_fields: {
      device: '',
      id_tagging_asset: '',
      opco: '',
      merk_type: '',
      serial_number: '',
      location: ''
    },
    configuration_items: ['PC'],
    special_fields: {
      ink_toner_ribbon: [],
      stok_tinta: []
    },
    items: [],
    is_active: false
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (template) {
      setFormData({
        category: template.category,
        name: template.name,
        device_fields: template.device_fields,
        configuration_items: template.configuration_items,
        special_fields: template.special_fields || { ink_toner_ribbon: [], stok_tinta: [] },
        items: template.items || [],
        is_active: template.is_active
      })
    }
  }, [template])

  const handleInputChange = (section, field, value) => {
    if (section === 'device_fields') {
      setFormData(prev => ({
        ...prev,
        device_fields: {
          ...prev.device_fields,
          [field]: value
        }
      }))
    } else if (section === 'special_fields') {
      setFormData(prev => ({
        ...prev,
        special_fields: {
          ...prev.special_fields,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: value
      }))
    }
  }

  const addChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          title: '',
          columns: ['No', 'Description', 'Normal', 'Error', 'Information'],
          items: [],
          order: prev.items.length
        }
      ]
    }))
  }

  const removeChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const addItemToSection = (sectionIndex) => {
    const newItems = [...formData.items]
    newItems[sectionIndex].items.push({
      description: '',
      normal: false,
      error: false,
      information: ''
    })
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }

  const removeItemFromSection = (sectionIndex, itemIndex) => {
    const newItems = [...formData.items]
    newItems[sectionIndex].items = newItems[sectionIndex].items.filter((_, i) => i !== itemIndex)
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }

  const updateItemInSection = (sectionIndex, itemIndex, field, value) => {
    const newItems = [...formData.items]
    newItems[sectionIndex].items[itemIndex][field] = value
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      let response
      if (template && template.id) {
        // Update existing template
        response = await api.put(`/admin/checklist-templates/${template.id}`, formData)
        setMessage('Template updated successfully')
      } else {
        // Create new template
        response = await api.post('/admin/checklist-templates', formData)
        setMessage('Template created successfully')
      }
      
      if (response.data.success) {
        if (onSave) {
          onSave()
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{template ? 'Edit Checklist Template' : 'Create Checklist Template'}</CardTitle>
              <CardDescription>
                {template ? 'Update' : 'Create'} checklist template for {category}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <Edit className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md mb-4">
              {message}
            </div>
          )}
          
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', null, e.target.value)}
                  placeholder="Enter template name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="is_active">Status</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', null, e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="is_active" className="text-sm">
                    Active (visible to employees)
                  </label>
                </div>
              </div>
            </div>

            {/* Device Fields */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Device Fields</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Device</Label>
                  <Input
                    value={formData.device_fields.device}
                    onChange={(e) => handleInputChange('device_fields', 'device', e.target.value)}
                    placeholder="Device name"
                  />
                </div>
                <div>
                  <Label>ID Tagging Asset</Label>
                  <Input
                    value={formData.device_fields.id_tagging_asset}
                    onChange={(e) => handleInputChange('device_fields', 'id_tagging_asset', e.target.value)}
                    placeholder="ID Tagging"
                  />
                </div>
                <div>
                  <Label>OpCo</Label>
                  <Input
                    value={formData.device_fields.opco}
                    onChange={(e) => handleInputChange('device_fields', 'opco', e.target.value)}
                    placeholder="OpCo"
                  />
                </div>
                <div>
                  <Label>Merk/Type</Label>
                  <Input
                    value={formData.device_fields.merk_type}
                    onChange={(e) => handleInputChange('device_fields', 'merk_type', e.target.value)}
                    placeholder="Merk/Type"
                  />
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input
                    value={formData.device_fields.serial_number}
                    onChange={(e) => handleInputChange('device_fields', 'serial_number', e.target.value)}
                    placeholder="Serial Number"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.device_fields.location}
                    onChange={(e) => handleInputChange('device_fields', 'location', e.target.value)}
                    placeholder="Location"
                  />
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Checklist Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addChecklistItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {formData.items.map((item, sectionIndex) => (
                <Card key={sectionIndex}>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Input
                          placeholder="Section title"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...formData.items]
                            newItems[sectionIndex].title = e.target.value
                            setFormData(prev => ({ ...prev, items: newItems }))
                          }}
                          className="flex-1 mr-2"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeChecklistItem(sectionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addItemToSection(sectionIndex)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>

                        {item.items.map((subItem, itemIndex) => (
                          <div key={itemIndex} className="flex gap-2 p-2 border rounded">
                            <Input
                              placeholder="Description"
                              value={subItem.description}
                              onChange={(e) => updateItemInSection(sectionIndex, itemIndex, 'description', e.target.value)}
                              className="flex-1"
                            />
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={subItem.normal}
                                  onChange={(e) => updateItemInSection(sectionIndex, itemIndex, 'normal', e.target.checked)}
                                />
                                Normal
                              </label>
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={subItem.error}
                                  onChange={(e) => updateItemInSection(sectionIndex, itemIndex, 'error', e.target.checked)}
                                />
                                Error
                              </label>
                            </div>
                            <Input
                              placeholder="Information (optional)"
                              value={subItem.information}
                              onChange={(e) => updateItemInSection(sectionIndex, itemIndex, 'information', e.target.value)}
                              className="w-48"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeItemFromSection(sectionIndex, itemIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChecklistBuilder
