import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { CheckCircle, XCircle, Camera, Loader2, Upload } from 'lucide-react'
import api from '../../utils/api'

const ChecklistForm = ({ template }) => {
  const [deviceData, setDeviceData] = useState({
    device: '',
    id_tagging_asset: '',
    opco: '',
    merk_type: '',
    serial_number: '',
    location: ''
  })
  
  const [checklistResponses, setChecklistResponses] = useState([])
  const [stokTintaResponses, setStokTintaResponses] = useState([])
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (template) {
      // Initialize device data from template
      if (template.device_fields) {
        setDeviceData({
          device: template.device_fields.device || '',
          id_tagging_asset: template.device_fields.id_tagging_asset || '',
          opco: template.device_fields.opco || '',
          merk_type: template.device_fields.merk_type || '',
          serial_number: template.device_fields.serial_number || '',
          location: template.device_fields.location || ''
        })
      }

      // Initialize checklist responses
      if (template.items) {
        const responses = template.items.map((item, index) => ({
          sectionIndex: index,
          sectionTitle: item.title,
          items: item.items.map((subItem) => {
            if (subItem.isInkTonerRibbon) {
              // Special handling for Ink/Toner/Ribbon type
              console.log('Ink/Toner/Ribbon item from template:', subItem)
              return {
                isInkTonerRibbon: true,
                description: subItem.description || 'Ink/Toner/Ribbon Type', // Fallback if empty
                colors: subItem.colors.map(color => ({
                  name: color.name,
                  percentage: ''
                }))
              }
            } else {
              // Regular item
              return {
                description: subItem.description,
                normal: false,
                error: false,
                information: ''
              }
            }
          })
        }))
        setChecklistResponses(responses)
      }

      // Initialize stok tinta responses
      if (template.category === 'printer' && template.special_fields?.stok_tinta) {
        const stokTintaResponses = template.special_fields.stok_tinta.map(() => '')
        setStokTintaResponses(stokTintaResponses)
      }
    }
  }, [template])

  const handleChecklistChange = (sectionIndex, itemIndex, field, value) => {
    setChecklistResponses(prev => {
      const newResponses = [...prev]
      newResponses[sectionIndex].items[itemIndex][field] = value
      return newResponses
    })
  }

  const handleInkTonerRibbonChange = (sectionIndex, itemIndex, colorIndex, field, value) => {
    setChecklistResponses(prev => {
      const newResponses = [...prev]
      newResponses[sectionIndex].items[itemIndex].colors[colorIndex][field] = value
      return newResponses
    })
  }

  const handleStokTintaChange = (index, value) => {
    setStokTintaResponses(prev => {
      const newResponses = [...prev]
      newResponses[index] = value
      return newResponses
    })
  }

  const startCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      setError('')
    } catch {
      setError('Tidak dapat mengakses kamera')
    }
  }

  const _stopCamera = () => {
    // Camera functionality removed for now
  }

  const _capturePhoto = () => {
    // Camera functionality removed for now
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!photo) {
      setError('Foto perangkat wajib diisi')
      return
    }

    // Check if error items have information filled
    for (const section of checklistResponses) {
      for (const item of section.items) {
        if (item.error && !item.information) {
          setError('Field information wajib diisi untuk item yang error')
          return
        }
      }
    }

    // Check if stok tinta is filled
    if (template.category === 'printer' && template.special_fields?.stok_tinta && template.special_fields.stok_tinta.length > 0) {
      for (let i = 0; i < template.special_fields.stok_tinta.length; i++) {
        if (!stokTintaResponses[i] || stokTintaResponses[i] === '') {
          setError('Jumlah pcs stok tinta wajib diisi')
          return
        }
      }
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Stok tinta is handled separately in PDF template, no need to add to checklist_responses
      const formData = new FormData()
      formData.append('checklist_template_id', template.id)
      formData.append('device_data', JSON.stringify(deviceData))
      formData.append('checklist_responses', JSON.stringify(checklistResponses))
      formData.append('stok_tinta_responses', JSON.stringify(stokTintaResponses))
      formData.append('notes', notes)
      formData.append('device_photo', photo)

      const response = await api.post('/employee/maintenance-records', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        setMessage('Maintenance record berhasil disimpan')
        // Reset form
        setDeviceData({
          device: '',
          id_tagging_asset: '',
          opco: '',
          merk_type: '',
          serial_number: '',
          location: ''
        })
        setChecklistResponses([])
        setStokTintaResponses([])
        setNotes('')
        setPhoto(null)
        setPreview(null)
      }
    } catch (err) {
      console.error('Error:', err.response?.data)
      const errorMessage = err.response?.data?.message || 
                          (err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : 'Gagal menyimpan maintenance record')
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!template) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Pilih template checklist untuk mulai</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Device Data */}
      <Card>
        <CardHeader>
          <CardTitle>Data Perangkat</CardTitle>
          <CardDescription>Informasi perangkat yang akan di-maintenance</CardDescription>
        </CardHeader>
        <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Device</Label>
                  <Input
                    value={deviceData.device}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>ID Tagging Asset</Label>
                  <Input
                    value={deviceData.id_tagging_asset}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>OpCo</Label>
                  <Input
                    value={deviceData.opco}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>Merk/Type</Label>
                  <Input
                    value={deviceData.merk_type}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input
                    value={deviceData.serial_number}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={deviceData.location}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
        </CardContent>
      </Card>

      {/* Checklist Responses */}
      {template.items && template.items.map((item, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {item.items && item.items.map((subItem, itemIndex) => (
                <div key={itemIndex} className="space-y-2 p-3 border rounded">
                  {subItem.isInkTonerRibbon ? (
                    // Special UI for Ink/Toner/Ribbon type
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          Ink/Toner/Ribbon Type
                        </span>
                      </div>
                      <div className="space-y-2">
                        {(checklistResponses[sectionIndex]?.items[itemIndex]?.colors || []).map((color, colorIndex) => (
                          <div key={colorIndex} className="flex items-center gap-4 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="flex-1">
                              <p className="font-medium">{color.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Masukkan persentase (e.g., 85%)"
                                value={color.percentage || ''}
                                onChange={(e) => handleInkTonerRibbonChange(sectionIndex, itemIndex, colorIndex, 'percentage', e.target.value)}
                                className="w-32"
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Regular item UI
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{subItem.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checklistResponses[sectionIndex]?.items[itemIndex]?.normal || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleChecklistChange(sectionIndex, itemIndex, 'normal', true)
                                handleChecklistChange(sectionIndex, itemIndex, 'error', false)
                                handleChecklistChange(sectionIndex, itemIndex, 'information', '')
                              } else {
                                handleChecklistChange(sectionIndex, itemIndex, 'normal', false)
                              }
                            }}
                          />
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm">Normal</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checklistResponses[sectionIndex]?.items[itemIndex]?.error || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleChecklistChange(sectionIndex, itemIndex, 'error', true)
                                handleChecklistChange(sectionIndex, itemIndex, 'normal', false)
                              } else {
                                handleChecklistChange(sectionIndex, itemIndex, 'error', false)
                                handleChecklistChange(sectionIndex, itemIndex, 'information', '')
                              }
                            }}
                          />
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="text-sm">Error</span>
                        </label>
                      </div>
                    </div>
                  )}
                  {checklistResponses[sectionIndex]?.items[itemIndex]?.error && !subItem.isInkTonerRibbon && (
                    <div>
                      <Input
                        placeholder="Masukkan informasi error..."
                        value={checklistResponses[sectionIndex]?.items[itemIndex]?.information || ''}
                        onChange={(e) => handleChecklistChange(sectionIndex, itemIndex, 'information', e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Stok Tinta - Only for Printer category */}
      {template.category === 'printer' && template.special_fields?.stok_tinta && template.special_fields.stok_tinta.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stok Tinta</CardTitle>
            <CardDescription>Isi jumlah pcs stok tinta yang tersedia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {template.special_fields.stok_tinta.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Jumlah pcs"
                      value={stokTintaResponses[index] || ''}
                      onChange={(e) => handleStokTintaChange(index, e.target.value)}
                      className="w-24"
                      required
                    />
                    <span className="text-sm text-muted-foreground">pcs</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan</CardTitle>
          <CardDescription>Tambahkan catatan penting tentang maintenance ini</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 border rounded-md"
            placeholder="Masukkan catatan..."
            required
          />
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Perangkat</CardTitle>
          <CardDescription>Ambil foto perangkat setelah maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!preview && (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Ambil foto perangkat dengan kamera
                </p>
                <div className="flex gap-2 justify-center">
                  <Button type="button" variant="outline" onClick={startCamera}>
                    <Camera className="h-4 w-4 mr-2" />
                    Buka Kamera
                  </Button>
                  <label>
                    <div className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-sm font-medium cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {preview && (
              <div className="space-y-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPhoto(null)
                      setPreview(null)
                    }}
                  >
                    Hapus Foto
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan Maintenance Record'
          )}
        </Button>
      </div>
    </form>
  )
}

export default ChecklistForm
