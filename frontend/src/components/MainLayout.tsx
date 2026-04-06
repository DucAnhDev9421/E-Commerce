import React, { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Bell,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/authSlice'
import { fetchCart, clearCart } from '@/store/cartSlice'
import { getAvatarUrl } from '@/utils/imageUtils'
import categoryApi from '@/api/categoryApi'

const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { totalQuantity } = useAppSelector((state) => state.cart)
  const [searchValue, setSearchValue] = useState('')
  const [categories, setCategories] = useState<any[]>([])

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearCart())
    navigate('/login')
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res: any = await categoryApi.getAll()
        setCategories(res)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [isAuthenticated, dispatch])

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue)}`)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="hidden sm:block bg-muted border-b">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center gap-6 text-muted-foreground">
              <a href="tel:19001234" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Phone className="size-3.5" />
                <span className="font-medium">HOTLINE: 1900 1234</span>
              </a>
              <a href="mailto:support@modern.com" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Mail className="size-3.5" />
                <span className="font-medium">SUPPORT@MODERN.COM</span>
              </a>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
              <Link to="/help" className="hover:text-foreground transition-colors">Help</Link>
              <Separator orientation="vertical" className="h-4" />
              <Link to="/news" className="hover:text-foreground transition-colors">News</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="size-8 rounded bg-primary flex items-center justify-center">
                      <ShoppingCart className="size-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold">Modern Shop</span>
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-80px)] mt-4">
                  <nav className="flex flex-col gap-1">
                    <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                      Home
                    </Link>
                    <Link to="/?view=all" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                      All Products
                    </Link>
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Categories</p>
                      {categories.map((cat) => (
                        <Link
                          key={cat._id}
                          to={`/?category=${cat._id}`}
                          className="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="size-10 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingCart className="size-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-xl font-semibold tracking-tight">MODERN</span>
                <span className="text-xs text-muted-foreground tracking-widest">SHOP</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                Home
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Categories
                    <ChevronDown className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat._id} asChild>
                      <Link to={`/?category=${cat._id}`}>{cat.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to="/?view=all" className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
                All Products
              </Link>
            </nav>

            {/* Search */}
            <div className="flex-1 max-w-md hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 pr-4"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search */}
              <Button variant="ghost" size="icon" className="sm:hidden shrink-0">
                <Search className="size-5" />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative shrink-0 hidden sm:flex">
                    <Bell className="size-5" />
                    <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs">Mark all read</Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      <Bell className="size-8 mx-auto mb-2 opacity-30" />
                      <p>No notifications yet</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button variant="ghost" className="w-full justify-center text-xs" onClick={() => navigate('/notifications')}>
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative shrink-0"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="size-5" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {totalQuantity > 9 ? '9+' : totalQuantity}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 px-2 shrink-0">
                      <Avatar className="size-8">
                        <AvatarImage src={getAvatarUrl(user?.avatarUrl) || undefined} />
                        <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline text-sm font-medium">{user?.fullName?.split(' ').pop()}</span>
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
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 size-4" />
                      Profile
                    </DropdownMenuItem>
                    {typeof user?.role === 'object' && user?.role.name === 'ADMIN' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <LayoutDashboard className="mr-2 size-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 size-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="shrink-0">
                  <Link to="/login">
                    <User className="size-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[600px]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t mt-20">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="size-10 rounded-lg bg-primary flex items-center justify-center">
                  <ShoppingCart className="size-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-lg font-semibold tracking-tight">MODERN</span>
                  <span className="text-xs text-muted-foreground tracking-widest">SHOP</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Experience the new era of shopping with elegant style and cutting-edge technology.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="size-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="size-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="size-5" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Services</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Shopping Guide</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Installment Policy</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Warranty Policy</Link></li>
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Delivery & Installation</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>123 Street Aura, Aura Building, Hanoi</li>
                <li>Hotline: 1900 1234</li>
                <li>Email: concierge@modern.com</li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to get special offers and news.
              </p>
              <div className="flex gap-2">
                <Input type="email" placeholder="Your email" className="flex-1" />
                <Button size="icon">
                  <Mail className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center text-sm text-muted-foreground">
            © 2026 MODERN SHOP • ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
