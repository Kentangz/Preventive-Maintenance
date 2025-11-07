import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import Alert from '../ui/Alert'
import { Trash2, Plus, Save, Eye, Edit, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { AlertDialog } from '../ui/AlertDialog' 
import api from '../../utils/api'

const ChecklistBuilder = ({ category, template, onSave }) => {
  const [formData, setFormData] = useState({
    category: category || 'printer',
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
      stok_tinta: []
    },
    items: [],
    is_active: true
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [openSectionIndex, setOpenSectionIndex] = useState(0)

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    index: null,
    itemCount: 0
  })

  useEffect(() => {
    if (template) {
      setFormData({
        category: template.category,
        device_fields: template.device_fields,
        configuration_items: template.configuration_items,
        special_fields: template.special_fields || { stok_tinta: [] },
        items: template.items ? template.items.map(item => ({
          ...item,
          items: item.items ? item.items.map(subItem => ({
            ...subItem,
            merge_columns: subItem.merge_columns || false
          })) : []
        })) : [],
        is_active: template.is_active
      })
      setOpenSectionIndex(0)
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
    const newSectionIndex = formData.items.length 
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
    setOpenSectionIndex(newSectionIndex)
  }

  const performDeleteSection = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
    if (openSectionIndex === index) {
      setOpenSectionIndex(null) 
    }
  }

  const handleDeleteSectionClick = (index) => {
    const section = formData.items[index]
    if (section.items.length > 0) {
      setDeleteModalState({
        isOpen: true,
        index: index,
        itemCount: section.items.length
      })
    } else {
      performDeleteSection(index)
    }
  }

  const handleConfirmDelete = () => {
    if (deleteModalState.index !== null) {
      performDeleteSection(deleteModalState.index)
    }
    setDeleteModalState({ isOpen: false, index: null, itemCount: 0 })
  }

  const handleCancelDelete = () => {
    setDeleteModalState({ isOpen: false, index: null, itemCount: 0 })
  }

  const addItemToSection = (sectionIndex) => {
    const newItems = [...formData.items]
    newItems[sectionIndex].items.push({
      description: '',
      merge_columns: false
    })
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }

  // Special functions for Ink/Toner/Ribbon type
  const addInkTonerRibbonItem = (sectionIndex) => {
    const newItems = [...formData.items]
    newItems[sectionIndex].items.push({
      description: '',
      isInkTonerRibbon: true,
      colors: [],
      merge_columns: false
    })
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }
  const addColorToInkTonerRibbon = (sectionIndex, itemIndex) => {
    const newItems = [...formData.items]
    if (!newItems[sectionIndex].items[itemIndex].colors) {
      newItems[sectionIndex].items[itemIndex].colors = []
    }
    newItems[sectionIndex].items[itemIndex].colors.push({
      name: ''
    })
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }
  const updateColorInInkTonerRibbon = (sectionIndex, itemIndex, colorIndex, field, value) => {
    const newItems = [...formData.items]
    newItems[sectionIndex].items[itemIndex].colors[colorIndex][field] = value
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }
  const removeColorFromInkTonerRibbon = (sectionIndex, itemIndex, colorIndex) => {
    const newItems = [...formData.items]
    newItems[sectionIndex].items[itemIndex].colors.splice(colorIndex, 1)
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }
  const hasInkTonerRibbonInAnySection = () => {
    return formData.items.some(section => 
      section.items.some(item => item.isInkTonerRibbon)
    )
  }
  const addStokTintaItem = () => {
    setFormData(prev => ({
      ...prev,
      special_fields: {
        ...prev.special_fields,
        stok_tinta: [
          ...(prev.special_fields?.stok_tinta || []),
          { description: '' }
        ]
      }
    }))
  }
  const removeStokTintaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      special_fields: {
        ...prev.special_fields,
        stok_tinta: prev.special_fields?.stok_tinta?.filter((_, i) => i !== index) || []
      }
    }))
  }
  const updateStokTintaItem = (index, value) => {
    const items = [...(formData.special_fields?.stok_tinta || [])]
    items[index].description = value
    setFormData(prev => ({
      ...prev,
      special_fields: {
        ...prev.special_fields,
        stok_tinta: items
      }
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

  const validateForm = () => {
    for (const [key, value] of Object.entries(formData.device_fields)) {
      if (value.trim() === '') {
        const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return { valid: false, message: `Device field "${fieldName}" harus diisi.` };
      }
    }

    if (formData.items.length === 0) {
      return { valid: false, message: 'Minimal harus ada satu "Checklist Item" section.' };
    }

    for (let i = 0; i < formData.items.length; i++) {
      const section = formData.items[i];
      if (section.title.trim() === '') {
        return { valid: false, message: `Judul untuk "Checklist Item" section #${i + 1} harus diisi.`, sectionIndex: i };
      }

      if (section.items.length === 0) {
        return { valid: false, message: `Minimal harus ada satu item di dalam section "${section.title || `Section #${i+1}`}".`, sectionIndex: i };
      }

      for (let j = 0; j < section.items.length; j++) {
        const subItem = section.items[j];
        if (subItem.isInkTonerRibbon) {
          if (subItem.colors.length === 0) {
            return { valid: false, message: `Minimal harus ada satu warna untuk "Ink/Toner/Ribbon Type" di section "${section.title || `Section #${i+1}`}".`, sectionIndex: i };
          }
          for (let k = 0; k < subItem.colors.length; k++) {
            if (subItem.colors[k].name.trim() === '') {
              return { valid: false, message: `Nama warna #${k + 1} di "Ink/Toner/Ribbon Type" (section "${section.title || `Section #${i+1}`}") harus diisi.`, sectionIndex: i };
            }
          }
        } else {
          if (subItem.description.trim() === '') {
            return { valid: false, message: `Deskripsi untuk item #${j + 1} di section "${section.title || `Section #${i+1}`}" harus diisi.`, sectionIndex: i };
          }
        }
      }
    }

    if (formData.category === 'printer' && formData.special_fields.stok_tinta) {
      for (let i = 0; i < formData.special_fields.stok_tinta.length; i++) {
        if (formData.special_fields.stok_tinta[i].description.trim() === '') {
          return { valid: false, message: `Deskripsi untuk "Stok Tinta" item #${i + 1} harus diisi.` };
        }
      }
    }
    
    return { valid: true };
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    const validationResult = validateForm();
    if (!validationResult.valid) {
      setError(validationResult.message);
      
      if (validationResult.sectionIndex !== undefined) {
        setOpenSectionIndex(validationResult.sectionIndex);
        setTimeout(() => {
          const errorSectionId = `section-card-${validationResult.sectionIndex}`;
          const element = document.getElementById(errorSectionId);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
            element.querySelector('input')?.focus();
          }
        }, 100); 
      }
      return; 
    }

    setLoading(true)

    try {
      let response
      if (template && template.id) {
        response = await api.put(`/admin/checklist-templates/${template.id}`, formData)
        setMessage('Template updated successfully')
      } else {
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
            <Alert
              variant="success"
              message={message}
              onClose={() => setMessage('')}
              className="mb-4"
            />
          )}
          
          {error && (
            <Alert
              variant="error"
              message={error}
              onClose={() => setError('')}
              className="mb-4"
            />
          )}

          {previewMode ? (
            <div className="space-y-6 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Preview Template</h3>
                                 {template && template.id && (
                   <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                     Preview PDF hanya tersedia setelah maintenance record dibuat
                   </div>
                 )}
              </div>
              <div className="space-y-4">
                <div>
                  <strong>Category:</strong> {formData.category}
                </div>
                <div>
                  <strong>Name:</strong> {formData.name || '(No name)'}
                </div>
                <div>
                  <strong>Status:</strong> {formData.is_active ? 'Active' : 'Inactive'}
                </div>
                <div>
                  <strong>Device Fields:</strong>
                  <div className="ml-4 mt-2 space-y-1">
                    <div>Device: {formData.device_fields.device || '-'}</div>
                    <div>ID Tagging Asset: {formData.device_fields.id_tagging_asset || '-'}</div>
                    <div>OpCo: {formData.device_fields.opco || '-'}</div>
                    <div>Merk/Type: {formData.device_fields.merk_type || '-'}</div>
                    <div>Serial Number: {formData.device_fields.serial_number || '-'}</div>
                    <div>Location: {formData.device_fields.location || '-'}</div>
                  </div>
                </div>
                <div>
                  <strong>Checklist Items ({formData.items.length} sections):</strong>
                  {formData.items.length === 0 ? (
                    <div className="ml-4 mt-2 text-gray-500">No items yet</div>
                  ) : (
                    <div className="ml-4 mt-2 space-y-2">
                      {formData.items.map((item, idx) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-3">
                          <div className="font-semibold">{item.title || 'Untitled Section'}</div>
                          <div className="text-sm text-gray-600">
                            {item.items.length} items
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Info */}
            <div className="space-y-4">
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
                    required 
                  />
                </div>
                <div>
                  <Label>ID Tagging Asset</Label>
                  <Input
                    value={formData.device_fields.id_tagging_asset}
                    onChange={(e) => handleInputChange('device_fields', 'id_tagging_asset', e.target.value)}
                    placeholder="ID Tagging"
                    required
                  />
                </div>
                <div>
                  <Label>OpCo</Label>
                  <Input
                    value={formData.device_fields.opco}
                    onChange={(e) => handleInputChange('device_fields', 'opco', e.target.value)}
                    placeholder="OpCo"
                    required
                  />
                </div>
                <div>
                  <Label>Merk/Type</Label>
                  <Input
                    value={formData.device_fields.merk_type}
                    onChange={(e) => handleInputChange('device_fields', 'merk_type', e.target.value)}
                    placeholder="Merk/Type"
                    required
                  />
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input
                    value={formData.device_fields.serial_number}
                    onChange={(e) => handleInputChange('device_fields', 'serial_number', e.target.value)}
                    placeholder="Serial Number"
                    required
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.device_fields.location}
                    onChange={(e) => handleInputChange('device_fields', 'location', e.target.value)}
                    placeholder="Location"
                    required
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
                <Card key={sectionIndex} id={`section-card-${sectionIndex}`}>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      
                      <div className="flex items-center justify-between gap-3">
                        {/* Input Judul (Mengisi sisa ruang) */}
                        <Input
                          placeholder="Section title"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...formData.items]
                            newItems[sectionIndex].title = e.target.value
                            setFormData(prev => ({ ...prev, items: newItems }))
                          }}
                          className="flex-1"
                          required
                        />

                        <div className="flex items-center gap-2 flex-shrink-0">
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpenSectionIndex(openSectionIndex === sectionIndex ? null : sectionIndex)}
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <span className="text-sm font-medium text-nowrap">
                              {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                            </span>
                            {openSectionIndex === sectionIndex ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSectionClick(sectionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {openSectionIndex === sectionIndex && (
                        <div className="space-y-2 pt-4 border-t mt-4">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addItemToSection(sectionIndex)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Item
                            </Button>
                            {formData.category === 'printer' && !hasInkTonerRibbonInAnySection() && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addInkTonerRibbonItem(sectionIndex)}
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Ink/Toner/Ribbon Type
                              </Button>
                            )}
                          </div>

                          {item.items.map((subItem, itemIndex) => (
                            <div key={itemIndex} className="p-3 border rounded">
                              {subItem.isInkTonerRibbon ? (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                        Ink/Toner/Ribbon Type
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeItemFromSection(sectionIndex, itemIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addColorToInkTonerRibbon(sectionIndex, itemIndex)}
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Color
                                      </Button>
                                    </div>
                                    {(subItem.colors || []).map((color, colorIndex) => (
                                      <div key={colorIndex} className="flex gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                                        <Input
                                          placeholder="Color name (e.g., Black, Cyan)"
                                          value={color.name || ''}
                                          onChange={(e) => updateColorInInkTonerRibbon(sectionIndex, itemIndex, colorIndex, 'name', e.target.value)}
                                          className="flex-1"
                                          required
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => removeColorFromInkTonerRibbon(sectionIndex, itemIndex, colorIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Description"
                                    value={subItem.description || ''}
                                    onChange={(e) => updateItemInSection(sectionIndex, itemIndex, 'description', e.target.value)}
                                    className="flex-1"
                                    required
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
                                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                    <input
                                      type="checkbox"
                                      id={`merge_columns_${sectionIndex}_${itemIndex}`}
                                      checked={subItem.merge_columns || false}
                                      onChange={(e) => updateItemInSection(sectionIndex, itemIndex, 'merge_columns', e.target.checked)}
                                      className="h-4 w-4"
                                    />
                                    <label htmlFor={`merge_columns_${sectionIndex}_${itemIndex}`} className="text-xs italic text-gray-500">
                                      Gabungkan kolom (Normal, Error, Information) untuk item ini
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Stok Tinta - Only for Printer category */}
            {formData.category === 'printer' && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Stok Tinta</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addStokTintaItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                {(formData.special_fields?.stok_tinta || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2 p-2 border rounded">
                    <Input
                      placeholder="Description (e.g., Merah, Biru)"
                      value={item.description || ''}
                      onChange={(e) => updateStokTintaItem(idx, e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeStokTintaItem(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
          )}

          <AlertDialog 
            open={deleteModalState.isOpen} 
            onOpenChange={(isOpen) => !isOpen && handleCancelDelete()}
            title="Hapus Section?"
            description={
              <>
                Section ini berisi <strong>{deleteModalState.itemCount} item</strong>. Menghapus section juga akan menghapus semua item di dalamnya.
                <br />
                Tindakan ini tidak dapat dibatalkan.
              </>
            }
            confirmText="Ya, Hapus"
            cancelText="Batal"
            onConfirm={handleConfirmDelete}
            variant="destructive"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ChecklistBuilder