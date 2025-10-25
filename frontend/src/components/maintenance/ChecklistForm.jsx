import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { CheckCircle, XCircle, Camera, Loader2, Upload } from 'lucide-react'
import api from '../../utils/api'

const ChecklistForm = ({ category, template }) => {
  const [deviceData, setDeviceData] = useState({
    device: '',
    id_tagging_asset: '',
    opco: '',
    merk_type: '',
    serial_number: '',
    location: ''
  })
  
  const [checklistResponses, setChecklistResponses] = useState([])
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [cameraMode, setCameraMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (template && template.items) {
      // Initialize checklist responses
      const responses = template.items.map((item, index) => ({
        sectionIndex: index,
        sectionTitle: item.title,
        items: item.items.map((subItem) => ({
          description: subItem.description,
          normal: false,
          error: false,
          information: ''
        }))
      }))
      setChecklistResponses(responses)
    }
  }, [template])

  const handleDeviceChange = (field, value) => {
    setDeviceData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChecklistChange = (sectionIndex, itemIndex, field, value) => {
    setChecklistResponses(prev => {
      const newResponses = [...prev]
      newResponses[sectionIndex].items[itemIndex][field] = value
      return newResponses
    })
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraMode(true)
      setError('')
    } catch (err) {
      setError('Tidak dapat mengakses kamera')
    }
  }

  const stopCamera = () => {
    setCameraMode(false)
  }

  const capturePhoto = (videoRef, canvasRef) => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' })
          setPhoto(file)
          setPreview(URL.createObjectURL(blob))
          stopCamera()
        }
      }, 'image/jpeg', 0.8)
    }
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

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('checklist_template_id', template.id)
      formData.append('device_data', JSON.stringify(deviceData))
      formData.append('checklist_responses', JSON.stringify(checklistResponses))
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
        setNotes('')
        setPhoto(null)
        setPreview(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan maintenance record')
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
                onChange={(e) => handleDeviceChange('device', e.target.value)}
                placeholder="Device name"
                required
              />
            </div>
            <div>
              <Label>ID Tagging Asset</Label>
              <Input
                value={deviceData.id_tagging_asset}
                onChange={(e) => handleDeviceChange('id_tagging_asset', e.target.value)}
                placeholder="ID Tagging"
                required
              />
            </div>
            <div>
              <Label>OpCo</Label>
              <Input
                value={deviceData.opco}
                onChange={(e) => handleDeviceChange('opco', e.target.value)}
                placeholder="OpCo"
                required
              />
            </div>
            <div>
              <Label>Merk/Type</Label>
              <Input
                value={deviceData.merk_type}
                onChange={(e) => handleDeviceChange('merk_type', e.target.value)}
                placeholder="Merk/Type"
                required
              />
            </div>
            <div>
              <Label>Serial Number</Label>
              <Input
                value={deviceData.serial_number}
                onChange={(e) => handleDeviceChange('serial_number', e.target.value)}
                placeholder="Serial Number"
                required
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={deviceData.location}
                onChange={(e) => handleDeviceChange('location', e.target.value)}
                placeholder="Location"
                required
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
                <div key={itemIndex} className="flex items-center gap-4 p-3 border rounded">
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
                          }
                        }}
                      />
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm">Error</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

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
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </span>
                    </Button>
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
