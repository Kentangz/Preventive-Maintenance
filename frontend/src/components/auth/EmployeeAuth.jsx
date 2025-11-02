import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { ThemeToggle } from '../ui/ThemeToggle'
import Alert from '../ui/Alert'
import { User, Camera, Loader2, X, RefreshCw } from 'lucide-react'

const EmployeeAuth = () => {
  const [formData, setFormData] = useState({
    name: '',
    identityPhoto: null,
  })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraMode, setCameraMode] = useState(false)
  const [stream, setStream] = useState(null)
  const [cameraFacing, setCameraFacing] = useState('user') // 'user' | 'environment'
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  
  const { employeeAuth, isAuthenticated, isAdmin, isEmployee, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && isAdmin) {
        navigate('/admin/dashboard', { replace: true })
      } else if (isAuthenticated && isEmployee) {
        navigate('/employee/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, isAdmin, isEmployee, authLoading, navigate])

    // Setup video element when camera mode is enabled
  useEffect(() => {
    if (cameraMode && stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.onloadedmetadata = () => {}
      videoRef.current.onplaying = () => {}
      videoRef.current.oncanplay = () => {}
      videoRef.current.onerror = () => {}
    }
  }, [cameraMode, stream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      // Clean up object URL
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [stream, preview])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.identityPhoto) {
      setError('Nama dan foto bukti diri harus diisi')
      return
    }

    setLoading(true)
    setError('')

    const result = await employeeAuth(formData.name, formData.identityPhoto)
    
    if (result.success) {
      window.location.href = '/employee/dashboard'
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  // Upload flow removed per requirements

  const startCamera = async (desiredFacing) => {
    try {
      const facing = desiredFacing || cameraFacing
      let mediaStream
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        })
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })
      }
      setStream(mediaStream)
      setCameraMode(true)
    } catch (error) {
      setError(`Tidak dapat mengakses kamera. Error: ${error.name || ''} ${error.message || ''}`)
    }
  }

  const switchCamera = async () => {
    const next = cameraFacing === 'user' ? 'environment' : 'user'
    // stop current
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCameraFacing(next)
    await startCamera(next)
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setCameraMode(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      if (!video.videoWidth || !video.videoHeight) {
        setError('Kamera belum siap. Pastikan kamera sudah aktif dan coba lagi.')
        return
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' })
          setFormData({ ...formData, identityPhoto: file })
          setPreview(URL.createObjectURL(blob))
          stopCamera()
        } else {
          setError('Gagal mengambil foto. Coba lagi.')
        }
      }, 'image/jpeg', 0.8)
    } else {
      setError('Video atau canvas tidak tersedia')
    }
  }

  const removePhoto = () => {
    // Clean up object URL to prevent memory leak
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }
    setFormData({ ...formData, identityPhoto: null })
    setPreview(null)
  }

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Employee Authentication</CardTitle>
          <CardDescription>
            Masukkan nama dan foto bukti diri untuk masuk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert
                variant="error"
                message={error}
                onClose={() => setError('')}
              />
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Foto Bukti Diri / Selfie</Label>
              <p className="text-xs text-muted-foreground">
                Ambil foto selfie untuk verifikasi identitas
              </p>
              
              {!preview && !cameraMode && (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Klik tombol kamera untuk mulai
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={startCamera}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Kamera
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {cameraMode && (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48 rounded-full overflow-hidden bg-muted">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-48 h-48 object-cover rounded-full"
                      />
                      <div className="absolute inset-0 rounded-full border-4 border-white/60 pointer-events-none"></div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Posisikan wajah Anda dalam frame, lalu klik "Ambil Foto"
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        type="button"
                        variant="default"
                        size="lg"
                        onClick={capturePhoto}
                        className="px-6"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Ambil Foto
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={switchCamera}
                        className="px-6"
                      >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Ganti Kamera
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={stopCamera}
                        className="px-6"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Batal
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Tunggu hingga kamera siap, lalu klik "Ambil Foto"
                    </p>
                  </div>
                </div>
              )}
              
              {preview && (
                <div className="space-y-3">
                  <p className="text-sm text-green-600 font-medium text-center">
                    Foto berhasil diambil
                  </p>
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48">
                      <img
                        src={preview}
                        alt="Preview foto selfie"
                        className="w-48 h-48 object-cover rounded-full border-4 border-green-200 shadow-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Foto siap untuk verifikasi. Klik tombol X jika ingin mengambil ulang.
                  </p>
                </div>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeeAuth
