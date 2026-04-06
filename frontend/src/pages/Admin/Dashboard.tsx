import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Tags,
  ShoppingBag,
  TrendingUp,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Package,
} from 'lucide-react'
import type { RootState } from '@/store'
import type { Role } from '@/types/auth'
import categoryApi from '@/api/categoryApi'
import productApi from '@/api/productApi'
import userApi from '@/api/userApi'
import roleApi from '@/api/roleApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'
const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${BASE_URL}${url}`
}

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: React.ElementType
  trend?: number
  loading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, trend, loading }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="size-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {loading ? (
        <>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-16" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <Badge variant={trend >= 0 ? "default" : "destructive"} className="text-xs">
                {trend >= 0 ? <ArrowUpRight className="size-3 mr-1" /> : null}
                {Math.abs(trend)}%
              </Badge>
              <span className="text-xs text-muted-foreground">from last month</span>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
)

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState({ users: 0, categories: 0, products: 0, roles: 0, inStock: 0, outOfStock: 0 })
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const roleName = typeof user?.role === 'object' ? (user.role as Role).name : 'ADMIN'
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [userRes, catRes, prodRes, roleRes]: any[] = await Promise.allSettled([
          userApi.getAll(),
          categoryApi.getAll(),
          productApi.getAll(),
          roleApi.getAll(),
        ])

        const users = userRes.status === 'fulfilled' ? userRes.value : []
        const cats = catRes.status === 'fulfilled' ? catRes.value : []
        const prods = prodRes.status === 'fulfilled' ? (prodRes.value.items || []) : []
        const roles = roleRes.status === 'fulfilled' ? roleRes.value : []

        setProducts(prods)
        setStats({
          users: users.length,
          categories: cats.length,
          products: prods.length,
          roles: roles.length,
          inStock: prods.filter((p: any) => p.status === 'in_stock').length,
          outOfStock: prods.filter((p: any) => p.status === 'out_of_stock').length,
        })
      } catch {
        // silently fail - show zeros
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stockPercentage = stats.products > 0 ? Math.round((stats.inStock / stats.products) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {user?.fullName?.split(' ').pop()}
          </h1>
          <p className="text-muted-foreground">
            Welcome back to your admin dashboard. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {roleName}
          </Badge>
          <Badge variant="secondary">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={Users}
          trend={12}
          loading={loading}
        />
        <StatCard
          title="Categories"
          value={stats.categories}
          icon={Tags}
          trend={5}
          loading={loading}
        />
        <StatCard
          title="Products"
          value={stats.products}
          icon={ShoppingBag}
          trend={8}
          loading={loading}
        />
        <StatCard
          title="In Stock"
          value={`${stats.inStock} / ${stats.products}`}
          icon={CheckCircle}
          loading={loading}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Overview of your product stock levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  In Stock
                </span>
                <span className="font-medium">{stats.inStock} products</span>
              </div>
              <Progress value={stockPercentage} className="h-2 [&>div]:bg-green-600" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <XCircle className="size-4 text-red-600" />
                  Out of Stock
                </span>
                <span className="font-medium">{stats.outOfStock} products</span>
              </div>
              <Progress value={100 - stockPercentage} className="h-2 [&>div]:bg-red-600" />
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => navigate('/admin/products')}>
                Manage Products
                <ArrowUpRight className="size-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>Latest added products to your store</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="size-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentProducts.length > 0 ? (
              <Table>
                <TableBody>
                  {recentProducts.map((item: any) => (
                    <TableRow key={item._id}>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg border bg-muted overflow-hidden">
                            {item.images?.[0] ? (
                              <img
                                src={getImageUrl(item.images[0])}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="size-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(item.price || 0).toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant={item.status === 'in_stock' ? 'default' : 'destructive'}>
                          {item.status === 'in_stock' ? 'In Stock' : 'Out'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="size-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No products yet</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/products')}>
                  Add Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/admin/products')}>
              <ShoppingBag className="size-6" />
              <span>Manage Products</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/admin/categories')}>
              <Tags className="size-6" />
              <span>Categories</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/admin/users')}>
              <Users className="size-6" />
              <span>Users</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => navigate('/')}>
              <TrendingUp className="size-6" />
              <span>View Store</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
