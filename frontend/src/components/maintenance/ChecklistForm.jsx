import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import Alert from '../ui/Alert'
import { Skeleton } from '../ui/Skeleton'
import { CheckCircle, XCircle, Camera, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../utils/api'

const DEFAULT_NOTES_TEMPLATE = 
`Host Name : \nIP address : \nMac Address : `;

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/jpg']

const ChecklistForm = ({ template, onSuccess }) => {
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
  const [photos, setPhotos] = useState([])
  const [previews, setPreviews] = useState([])
  const [stream, setStream] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [openSectionIndex, setOpenSectionIndex] = useState(0)

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
              return {
                isInkTonerRibbon: true,
                description: subItem.description || 'Ink/Toner/Ribbon Type', // Fallback if empty
                colors: subItem.colors.map(color => ({
                  name: color.name,
                  percentage: ''
                }))
              }
            } else {

              const hasMergeColumns = subItem.merge_columns === true || subItem.merge_columns === 'true' || subItem.merge_columns === 1
              
              if (hasMergeColumns) {
                return {
                  description: subItem.description,
                  merged_text: '',
                  merge_columns: true
                }
              } else {
                return {
                  description: subItem.description,
                  normal: false,
                  error: false,
                  information: '',
                  merge_columns: false
                }
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
      setNotes(DEFAULT_NOTES_TEMPLATE)
      setOpenSectionIndex(0)
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
    let processedValue = value;

    if (field === 'percentage') {
      let numericValue = value.replace(/[^0-9]/g, '');
      
      if (numericValue !== '') {
        let num = parseInt(numericValue, 10);
        if (num > 100) numericValue = '100';
        else if (num < 0) numericValue = '0';
        else numericValue = num.toString();
      }
      processedValue = numericValue;
    }

    setChecklistResponses(prev => {
      const newResponses = [...prev];
      newResponses[sectionIndex].items[itemIndex].colors[colorIndex][field] = processedValue;
      return newResponses;
    });
  }

  const handleStokTintaChange = (index, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setStokTintaResponses(prev => {
      const newResponses = [...prev]
      newResponses[index] = numericValue
      return newResponses
    })
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      setStream(mediaStream)
      setShowCamera(true)
      setError('')
    } catch {
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    const video = document.getElementById('camera-video')
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    
    canvas.toBlob((blob) => {
      if (blob && photos.length < 2) {
        const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        const previewUrl = URL.createObjectURL(file)
        setPhotos([...photos, file])
        setPreviews([...previews, previewUrl])
        stopCamera()
      }
    }, 'image/jpeg', 0.9)
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    const remainingSlots = 2 - photos.length
    
    if (remainingSlots === 0) {
      setError('Maksimal 2 foto')
      return
    }
    
    const filesToAdd = files.slice(0, remainingSlots)
    
    filesToAdd.forEach(file => {
      const fileType = file.type.toLowerCase()
      if (!ALLOWED_PHOTO_TYPES.includes(fileType)) {
        setMessage('')
        setError('Format foto perangkat harus JPG atau PNG')
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setPhotos(prev => [...prev, file])
      setPreviews(prev => [...prev, previewUrl])
    })
  }

  const removePhoto = (index) => {
    // Revoke URL to prevent memory leak
    URL.revokeObjectURL(previews[index])
    setPhotos(photos.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previews])

  // Helper function to scroll to errors
  const scrollToError = (elementId, message) => {
    setError(message);
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      setTimeout(() => {
        const input = element.querySelector('input, textarea');
        if (input) {
          input.focus({ preventScroll: true });
        }
      }, 100);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (photos.length === 0) {
      scrollToError('photo-section', 'Minimal 1 foto perangkat wajib diisi');
      return
    }
    if (photos.length > 2) {
      scrollToError('photo-section', 'Maksimal 2 foto perangkat');
      return
    }

    for (const [sectionIndex, section] of checklistResponses.entries()) {
      for (const [itemIndex, item] of section.items.entries()) {
        const elementId = `checklist-item-${sectionIndex}-${itemIndex}`;
        
        if (item.isInkTonerRibbon) {
          // Validasi Ink/Toner
          for (const color of item.colors) {
            if (!color.percentage || color.percentage.trim() === '') {
              setOpenSectionIndex(sectionIndex);
              scrollToError(elementId, `Persentase untuk "${color.name}" wajib diisi.`);
              return
            }
          }
        } else if (item.merged_text !== undefined) {
          // Validasi Merged columns
          if (!item.merged_text || item.merged_text.trim() === '') {
            setOpenSectionIndex(sectionIndex);
            scrollToError(elementId, `Field Condition & Information wajib diisi untuk item: "${item.description}"`);
            return
          }
        } else {
          // Validasi Normal columns
          if (!item.normal && !item.error) {
            setOpenSectionIndex(sectionIndex);
            scrollToError(elementId, `Pilih "Normal" atau "Error" untuk item: "${item.description}"`);
            return
          }
          if (item.error && (!item.information || item.information.trim() === '')) {
            setOpenSectionIndex(sectionIndex);
            scrollToError(elementId, `Field information wajib diisi untuk item "${item.description}" yang error`);
            return
          }
        }
      }
    }

    if (template.category === 'printer' && template.special_fields?.stok_tinta && template.special_fields.stok_tinta.length > 0) {
      for (let i = 0; i < template.special_fields.stok_tinta.length; i++) {
        if (!stokTintaResponses[i] || stokTintaResponses[i] === '') {
          const elementId = `stok-tinta-item-${i}`;
          scrollToError(elementId, 'Jumlah pcs stok tinta wajib diisi');
          return
        }
      }
    }

    if (!notes || notes.trim() === '') {
      scrollToError('notes-section', 'Catatan wajib diisi');
      return
    }


    setLoading(true)
    setMessage('')

    try {
      const responsesToSend = JSON.parse(JSON.stringify(checklistResponses));
      
      for (const section of responsesToSend) {
        for (const item of section.items) {
          if (item.isInkTonerRibbon) {
            for (const color of item.colors) {
              if (color.percentage) {
                color.percentage = `${color.percentage}%`;
              }
            }
          }
        }
      }

      const formData = new FormData()
      formData.append('checklist_template_id', template.id)
      formData.append('device_data', JSON.stringify(deviceData))
      formData.append('checklist_responses', JSON.stringify(responsesToSend)) 
      formData.append('stok_tinta_responses', JSON.stringify(stokTintaResponses))
      formData.append('notes', notes)
      
      // Append multiple photos
      photos.forEach((photo) => {
        formData.append(`device_photos[]`, photo)
      })

      const response = await api.post('/employee/maintenance-records', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        const successMsg = 'Maintenance record berhasil disimpan'
        setMessage(successMsg)
        
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
        setNotes(DEFAULT_NOTES_TEMPLATE)
        // Cleanup preview URLs
        previews.forEach(url => URL.revokeObjectURL(url))
        setPhotos([])
        setPreviews([])
        stopCamera()
        
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(successMsg)
          }
        }, 1000)
      }
    } catch (err) {
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
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {message && (
        <Alert
          variant="success"
          message={message}
          onClose={() => setMessage('')}
        />
      )}
      
      {error && (
        <Alert
          variant="error"
          message={error}
          onClose={() => setError('')}
        />
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
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>ID Tagging Asset</Label>
                  <Input
                    value={deviceData.id_tagging_asset}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>OpCo</Label>
                  <Input
                    value={deviceData.opco}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Merk/Type</Label>
                  <Input
                    value={deviceData.merk_type}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input
                    value={deviceData.serial_number}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={deviceData.location}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
        </CardContent>
      </Card>

      {/* Checklist Responses */}
      {template.items && template.items.map((item, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader 
            className="flex flex-row items-center justify-between cursor-pointer"
            onClick={() => setOpenSectionIndex(openSectionIndex === sectionIndex ? null : sectionIndex)}
          >
            <CardTitle>{item.title}</CardTitle>
            {openSectionIndex === sectionIndex ? (
              <ChevronUp className="h-5 w-5 flex-shrink-0" /> 
            ) : (
              <ChevronDown className="h-5 w-5 flex-shrink-0" />
            )}
          </CardHeader>

          {openSectionIndex === sectionIndex && (
            <CardContent>
              <div className="space-y-4">
                {item.items && item.items.map((subItem, itemIndex) => (
                  <div key={itemIndex} id={`checklist-item-${sectionIndex}-${itemIndex}`} className="space-y-2 p-3 border rounded">
                    {subItem.isInkTonerRibbon ? (
                      // Special UI for Ink/Toner/Ribbon type
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded dark:bg-primary/20">
                            Ink/Toner/Ribbon Type
                          </span>
                        </div>
                        <div className="space-y-2">
                          {(checklistResponses[sectionIndex]?.items[itemIndex]?.colors || []).map((color, colorIndex) => (
                            <div key={colorIndex} className="flex items-center gap-4 p-2 rounded border border-primary/30 bg-primary/10 dark:border-primary/25 dark:bg-primary/20">
                              <div className="flex-1">
                                <p className="font-medium">{color.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="tel" 
                                  inputMode="numeric"
                                  value={color.percentage || ''}
                                  onChange={(e) => handleInkTonerRibbonChange(sectionIndex, itemIndex, colorIndex, 'percentage', e.target.value)}
                                  className="w-10 text-right"
                                  maxLength="3"
                                />
                                <span className="text-sm font-medium">%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      (() => {
                        const responseItem = checklistResponses[sectionIndex]?.items[itemIndex]
                        
                        if (responseItem) {
                          if (responseItem.merge_columns === true) {
                            return true
                          }
                          if (responseItem.merged_text !== undefined) {
                            return true
                          }
                          if (responseItem.normal !== undefined || responseItem.error !== undefined || responseItem.information !== undefined) {
                            return false
                          }
                        }
                        
                        // Fallback: check from template item
                        const templateHasMergeColumns = subItem.merge_columns === true || subItem.merge_columns === 'true' || subItem.merge_columns === 1
                        return templateHasMergeColumns
                      })() ? (
                        // Merged columns: single text input
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium mb-2">{subItem.description}</p>
                            <Label>Condition & Information</Label>
                            <Input
                              placeholder="Masukkan informasi..."
                              value={checklistResponses[sectionIndex]?.items[itemIndex]?.merged_text || ''}
                              onChange={(e) => handleChecklistChange(sectionIndex, itemIndex, 'merged_text', e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>
                      ) : (
                        // Normal columns: separate checkboxes and input
                        <div className="space-y-2">
                          {/* Flex container for description and buttons */}
                          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                            {/* Description (takes up available space) */}
                            <div className="flex-1 mb-2 md:mb-0">
                              <p className="font-medium">{subItem.description}</p>
                            </div>
                            
                            {/* Checkboxes (fixed width, won't shrink) */}
                            <div className="flex flex-shrink-0 items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checklistResponses[sectionIndex]?.items[itemIndex]?.normal || false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleChecklistChange(sectionIndex, itemIndex, 'normal', true)
                                      handleChecklistChange(sectionIndex, itemIndex, 'error', false)
                                      // handleChecklistChange(sectionIndex, itemIndex, 'information', '') 
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
                          
                          {/* Information Input (always full width on its own line) */}
                          <div>
                            <Input
                              placeholder="Masukkan informasi (wajib jika error)..."
                              value={checklistResponses[sectionIndex]?.items[itemIndex]?.information || ''}
                              onChange={(e) => handleChecklistChange(sectionIndex, itemIndex, 'information', e.target.value)}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}

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
                <div key={index} id={`stok-tinta-item-${index}`} className="flex items-center gap-4 p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={stokTintaResponses[index] || ''}
                      onChange={(e) => handleStokTintaChange(index, e.target.value)}
                      className="w-10"
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
      <Card id="notes-section">
        <CardHeader>
          <CardTitle>Catatan</CardTitle>
          <CardDescription>Tambahkan catatan penting tentang maintenance ini</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Masukkan catatan..."
          />
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card id="photo-section">
        <CardHeader>
          <CardTitle>Foto Perangkat</CardTitle>
          <CardDescription>Ambil foto perangkat setelah maintenance (Maksimal 2 foto)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Camera Preview */}
            {showCamera && stream && (
              <div className="space-y-3 border-2 border-border rounded-lg p-4">
                <video
                  id="camera-video"
                  autoPlay
                  playsInline
                  ref={(video) => {
                    if (video && stream) {
                      video.srcObject = stream
                    }
                  }}
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
                <div className="flex gap-2 justify-center">
                  <Button type="button" variant="outline" onClick={capturePhoto}>
                    <Camera className="h-4 w-4 mr-2" />
                    Ambil Foto
                  </Button>
                  <Button type="button" variant="destructive" onClick={stopCamera}>
                    Tutup Kamera
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Options - Only show if camera is not active and less than 2 photos */}
            {!showCamera && photos.length < 2 && (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Ambil foto perangkat dengan kamera atau upload dari file (format JPG/PNG)
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
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handlePhotoChange}
                      className="hidden"
                      multiple
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {photos.length}/2 foto terupload
                </p>
              </div>
            )}

            {/* Photo Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="space-y-2">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full rounded-lg border"
                    />
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePhoto(index)}
                      >
                        Hapus Foto {index + 1}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? (
            <div className="flex w-full items-center justify-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          ) : (
            'Simpan Maintenance Record'
          )}
        </Button>
      </div>
    </form>
  )
}

export default ChecklistForm