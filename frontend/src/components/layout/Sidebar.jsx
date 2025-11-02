import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  LayoutDashboard, 
  User, 
  LogOut,
  Menu,
  X,
  FileText,
  Printer,
  Computer,
  Network,
  Router,
  Star,
  Files
} from 'lucide-react'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'

const Sidebar = ({ activeItem, onItemClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, employee, adminLogout, employeeLogout, isAdmin, isEmployee } = useAuth()

  const adminMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'manage-checklist',
      label: 'Kelola Form Checklist',
      icon: FileText,
    },
    {
      id: 'printer',
      label: 'Printer',
      icon: Printer,
    },
    {
      id: 'switch',
      label: 'Switch',
      icon: Router,
    },
    {
      id: 'vvip',
      label: 'VVIP',
      icon: Star,
    },
    {
      id: 'pc_desktop',
      label: 'PC/Desktop',
      icon: Computer,
    },
    {
      id: 'access_point',
      label: 'Access Point',
      icon: Network,
    },
    {
      id: 'schedule',
      label: 'Documents',
      icon: Files,
    },
  ]

  const employeeMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'printer',
      label: 'Printer',
      icon: Printer,
    },
    {
      id: 'switch',
      label: 'Switch',
      icon: Router,
    },
    {
      id: 'vvip',
      label: 'VVIP',
      icon: Star,
    },
    {
      id: 'pc_desktop',
      label: 'PC/Desktop',
      icon: Computer,
    },
    {
      id: 'access_point',
      label: 'Access Point',
      icon: Network,
    },
  ]

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems

  const handleLogout = async () => {
    if (isAdmin) {
      await adminLogout()
    } else if (isEmployee) {
      await employeeLogout()
    }
  }

  const currentUser = user || employee

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-foreground">
              Maintenance System
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin ? 'Admin Panel' : 'Employee Panel'}
            </p>
          </div>

          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{currentUser?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? user?.email : 'Employee'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onItemClick(item.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className={cn(
                        'w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors',
                        activeItem === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Theme Toggle & Logout */}
          <div className="p-6 border-t space-y-3">
            <ThemeToggle />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
