import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import Alert from '../ui/Alert'
import { Skeleton } from '../ui/Skeleton'
import { User, Mail, Upload, X } from 'lucide-react'

const ProfileForm = () => {
  const { user, employee, updateAdminProfile, updateEmployeeProfile, isAdmin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [signaturePreview, setSignaturePreview] = useState(null)
  const signatureInputRef = useRef(null)
  const ALLOWED_SIGNATURE_TYPES = ['image/jpeg', 'image/png', 'image/jpg']
  
  const currentUser = user || employee
  const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL
  const employeePhotoUrl = employee?.identity_photo ? `${STORAGE_BASE_URL}/storage/${employee.identity_photo}` : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    const formData = new FormData(e.target)
    const profileData = {
      name: formData.get('name'),
      email: formData.get('email'),
      signature: formData.get('signature') || null,
    }

    let result
    if (isAdmin) {
      result = await updateAdminProfile(profileData)
    } else {
      result = await updateEmployeeProfile(profileData)
    }

    if (result.success) {
      setMessage('Profile berhasil diperbarui')
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  const handleSignatureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!ALLOWED_SIGNATURE_TYPES.includes(file.type.toLowerCase())) {
        setSignaturePreview(null)
        setMessage('')
        setError('Format tanda tangan harus JPG atau PNG')
        if (signatureInputRef.current) {
          signatureInputRef.current.value = ''
        }
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setSignaturePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeSignature = () => {
    setSignaturePreview(null)
    if (signatureInputRef.current) {
      signatureInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Kelola informasi profile dan tanda tangan Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={currentUser?.name || ''}
                className="pl-10"
                required
              />
            </div>
          </div>

          {!isAdmin && employeePhotoUrl && (
            <div className="space-y-2">
              <Label>Foto Bukti Diri</Label>
              <div className="flex items-center gap-3">
                <img
                  src={employeePhotoUrl}
                  alt="Employee Identity"
                  className="w-40 h-40 rounded-full object-cover border"
                />
                <p className="text-xs text-muted-foreground">
                  Foto bukti diri Anda yang tersimpan.
                </p>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email || ''}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tanda Tangan</Label>
            
            {currentUser?.signature && !signaturePreview && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tanda tangan saat ini:</p>
                <img
                  src={`${STORAGE_BASE_URL}/storage/${currentUser.signature}`}
                  alt="Current signature"
                  className="w-32 h-20 object-contain border rounded"
                />
              </div>
            )}
            
            {signaturePreview && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tanda tangan baru:</p>
                <div className="relative inline-block">
                  <img
                    src={signaturePreview}
                    alt="New signature preview"
                    className="w-32 h-20 object-contain border rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={removeSignature}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => signatureInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {currentUser?.signature ? 'Ganti' : 'Upload'} Tanda Tangan
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format file yang diperbolehkan: JPG, JPEG, PNG.
            </p>
            
            <input
              ref={signatureInputRef}
              type="file"
              name="signature"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleSignatureChange}
              className="hidden"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex w-full items-center justify-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProfileForm
