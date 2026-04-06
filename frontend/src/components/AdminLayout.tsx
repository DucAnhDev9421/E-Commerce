import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Tags,
  ShoppingBag,
  Shield,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Bell,
  Settings,
  User,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { logout } from '@/store/authSlice'
import { getAvatarUrl } from '@/utils/imageUtils'
import type { Role } from '@/types/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { key: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { key: '/admin/categories', label: 'Categories', icon: Tags },
  { key: '/admin/products', label: 'Products', icon: ShoppingBag },
  { key: '/admin/users', label: 'Users', icon: Users },
  { key: '/admin/roles', label: 'Roles', icon: Shield },
]

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/users': 'Users',
  '/admin/roles': 'Roles',
}

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)

  const roleName = typeof user?.role === 'object' ? (user.role as Role).name : 'ADMIN'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4 border-b", collapsed ? "justify-center" : "gap-3")}>
        <div className="flex items-center justify-center size-10 rounded-lg bg-primary">
          <ShoppingBag className="size-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Admin Panel</span>
            <span className="text-[10px] text-muted-foreground">E-Commerce</span>
          </div>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Avatar className="size-9">
              <AvatarImage src={getAvatarUrl(user?.avatarUrl) || undefined} />
              <AvatarFallback>{user?.fullName?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">{roleName}</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.key
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => {
                  navigate(item.key)
                  setMobileOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="size-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        {!collapsed && (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => navigate('/')}
          >
            <Home className="size-4 mr-3" />
            View Website
          </Button>
        )}
        <Button
          variant="ghost"
          className={cn("text-destructive hover:text-destructive hover:bg-destructive/10", collapsed ? "w-full justify-center px-0" : "w-full justify-start")}
          onClick={handleLogout}
        >
          <LogOut className="size-4 mr-3" />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-card border-r",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className={cn("flex-1 flex flex-col min-h-screen", collapsed ? "md:ml-16" : "md:ml-64")}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b px-4 md:px-6">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{pageTitles[location.pathname] || 'Admin'}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="size-5" />
                <span className="absolute top-1 right-1 size-2 bg-primary rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative size-9 rounded-full">
                    <Avatar className="size-9">
                      <AvatarImage src={getAvatarUrl(user?.avatarUrl) || undefined} />
                      <AvatarFallback>{user?.fullName?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.fullName}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                    <User className="mr-2 size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    <Settings className="mr-2 size-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
