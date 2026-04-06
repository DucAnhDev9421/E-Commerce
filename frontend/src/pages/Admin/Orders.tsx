import React, { useEffect, useState } from 'react'
import {
  Search,
  RefreshCw,
  Eye,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  CheckCheck,
  Ban,
  TrendingUp,
} from 'lucide-react'
import orderApi from '@/api/orderApi'
import type { Order } from '@/api/orderApi'
import { BASE_URL } from '@/utils/imageUtils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-800', icon: Clock },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chưa thanh toán', color: 'bg-amber-100 text-amber-800' },
  COMPLETED: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Thanh toán thất bại', color: 'bg-red-100 text-red-800' },
}

const paymentMethodConfig: Record<string, { label: string; color: string }> = {
  COD: { label: 'COD', color: 'bg-gray-100 text-gray-800' },
  VNPAY: { label: 'VNPay', color: 'bg-blue-100 text-blue-800' },
}

interface OrderDetail {
  _id: string
  user: { fullName: string; email: string; username: string }
  totalAmount: number
  status: string
  paymentMethod: string
  paymentStatus: string
  note: string
  shippingAddress: {
    receiverName: string
    phoneNumber: string
    street: string
    city: string
    district: string
  }
  createdAt: string
  updatedAt: string
}

interface OrderItemDetail {
  _id: string
  product: { _id: string; name: string; images?: string[] }
  quantity: number
  price: number
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItemDetail[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  const [updateStatusOpen, setUpdateStatusOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0,
  })

  const fetchOrders = async (resetPage = false) => {
    setLoading(true)
    try {
      const params: any = { page: resetPage ? 1 : page, limit: 10 }
      if (filterStatus) params.status = filterStatus

      const data: any = await orderApi.getAllOrders(params)

      const orderList = data.orders || data || []
      setOrders(orderList)
      setTotalPages(data.totalPages || 1)

      // Calculate stats from fetched orders
      const allOrders = orderList
      setStats(prev => ({
        ...prev,
        total: data.total || orderList.length,
        pending: allOrders.filter((o: Order) => o.status === 'PENDING').length,
        processing: allOrders.filter((o: Order) => o.status === 'PROCESSING').length,
        shipped: allOrders.filter((o: Order) => o.status === 'SHIPPED').length,
        delivered: allOrders.filter((o: Order) => o.status === 'DELIVERED').length,
        cancelled: allOrders.filter((o: Order) => o.status === 'CANCELLED').length,
      }))
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all orders for stats (without pagination)
  const fetchStats = async () => {
    try {
      const data: any = await orderApi.getAllOrders({ limit: 1000 })
      const allOrders: Order[] = data.orders || data || []
      const revenue = allOrders
        .filter(o => o.paymentStatus === 'COMPLETED')
        .reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0)

      setStats(prev => ({
        ...prev,
        total: data.total || allOrders.length,
        pending: allOrders.filter(o => o.status === 'PENDING').length,
        processing: allOrders.filter(o => o.status === 'PROCESSING').length,
        shipped: allOrders.filter(o => o.status === 'SHIPPED').length,
        delivered: allOrders.filter(o => o.status === 'DELIVERED').length,
        cancelled: allOrders.filter(o => o.status === 'CANCELLED').length,
        revenue,
      }))
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchOrders()
  }, [page, filterStatus])

  const handleViewDetail = async (orderId: string) => {
    setDetailModalOpen(true)
    setLoadingItems(true)
    setSelectedOrder(null)
    setOrderItems([])

    try {
      const data: any = await orderApi.getOrderById(orderId)
      setSelectedOrder(data.order)
      setOrderItems(data.items || [])
    } catch (error) {
      console.error('Error loading order detail:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order as any)
    setSelectedStatus(order.status)
    setUpdateStatusOpen(true)
  }

  const handleConfirmStatusUpdate = async () => {
    if (!selectedOrder || !selectedStatus) return
    setUpdating(true)
    try {
      await orderApi.updateOrderStatus((selectedOrder as any)._id, selectedStatus)
      setUpdateStatusOpen(false)
      fetchOrders()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (!searchText) return true
    const search = searchText.toLowerCase()
    const userInfo = order.userInfo || (order as any).user || {}
    const userName = typeof userInfo === 'object' ? userInfo.fullName || '' : ''
    const userEmail = typeof userInfo === 'object' ? userInfo.email || '' : ''
    return (
      order._id?.toLowerCase().includes(search) ||
      userName.toLowerCase().includes(search) ||
      userEmail.toLowerCase().includes(search)
    )
  })

  const getProductImage = (product: any) => {
    if (!product) return null
    const images = product.images
    if (Array.isArray(images) && images.length > 0) {
      const img = images[0]
      if (img.startsWith('http')) return img
      return `${BASE_URL}${img.startsWith('/') ? img : `/${img}`}`
    }
    return null
  }

  const getStatusConfig = (status: string) => statusConfig[status] || statusConfig.PENDING

  const getPaymentStatusConfig = (status: string) =>
    paymentStatusConfig[status] || paymentStatusConfig.PENDING

  const getPaymentMethodConfig = (method: string) =>
    paymentMethodConfig[method] || paymentMethodConfig.COD

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Xem và quản lý tất cả đơn hàng</p>
        </div>
        <Button variant="outline" onClick={() => fetchOrders(true)} disabled={loading}>
          <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setFilterStatus('')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng đơn</CardTitle>
            <Package className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${filterStatus === 'PENDING' ? 'ring-2 ring-amber-500 bg-amber-50' : 'hover:bg-muted/50'}`}
          onClick={() => setFilterStatus(filterStatus === 'PENDING' ? '' : 'PENDING')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chờ xử lý</CardTitle>
            <Clock className="size-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${filterStatus === 'PROCESSING' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-muted/50'}`}
          onClick={() => setFilterStatus(filterStatus === 'PROCESSING' ? '' : 'PROCESSING')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đang xử lý</CardTitle>
            <Package className="size-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${filterStatus === 'SHIPPED' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-muted/50'}`}
          onClick={() => setFilterStatus(filterStatus === 'SHIPPED' ? '' : 'SHIPPED')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đang giao</CardTitle>
            <Truck className="size-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${filterStatus === 'DELIVERED' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-muted/50'}`}
          onClick={() => setFilterStatus(filterStatus === 'DELIVERED' ? '' : 'DELIVERED')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đã giao</CardTitle>
            <CheckCircle className="size-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${filterStatus === 'CANCELLED' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-muted/50'}`}
          onClick={() => setFilterStatus(filterStatus === 'CANCELLED' ? '' : 'CANCELLED')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đã hủy</CardTitle>
            <Ban className="size-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doanh thu</CardTitle>
            <TrendingUp className="size-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(stats.revenue || 0).toLocaleString('vi-VN')}đ
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, tên khách hàng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val === 'all' ? '' : val); setPage(1) }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                <SelectItem value="SHIPPED">Đang giao</SelectItem>
                <SelectItem value="DELIVERED">Đã giao</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Package className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Không có đơn hàng nào</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order: any, idx: number) => {
                  const statusCfg = getStatusConfig(order.status)
                  const payStatusCfg = getPaymentStatusConfig(order.paymentStatus)
                  const payMethodCfg = getPaymentMethodConfig(order.paymentMethod)
                  const userInfo = order.userInfo || order.user || {}
                  const userName = typeof userInfo === 'object' ? userInfo.fullName : userInfo
                  const userEmail = typeof userInfo === 'object' ? userInfo.email : ''

                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {(page - 1) * 10 + idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">
                          {order._id?.slice(-8).toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{userName || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{userEmail || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          {(order.totalAmount || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusCfg.color} border-0`}>
                          <statusCfg.icon className="size-3 mr-1" />
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={`${payStatusCfg.color} border-0 text-xs w-fit`}>
                            {payStatusCfg.label}
                          </Badge>
                          <Badge className={`${payMethodCfg.color} border-0 text-xs w-fit`}>
                            {payMethodCfg.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xem chi tiết"
                            onClick={() => handleViewDetail(order._id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Cập nhật trạng thái"
                              onClick={() => handleUpdateStatus(order)}
                            >
                              <CheckCheck className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Order Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span className="font-mono">
                  Mã đơn: {selectedOrder._id?.slice(-8).toUpperCase()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingItems ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6 py-4">
              {/* Customer & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                  <p className="font-medium">
                    {(selectedOrder as any).user?.fullName || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedOrder as any).user?.email || ''}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge className={`${getStatusConfig(selectedOrder.status).color} border-0`}>
                    {getStatusConfig(selectedOrder.status).label}
                  </Badge>
                  <div className="flex gap-1 mt-1">
                    <Badge className={`${getPaymentStatusConfig(selectedOrder.paymentStatus).color} border-0 text-xs`}>
                      {getPaymentStatusConfig(selectedOrder.paymentStatus).label}
                    </Badge>
                    <Badge className={`${getPaymentMethodConfig(selectedOrder.paymentMethod).color} border-0 text-xs`}>
                      {getPaymentMethodConfig(selectedOrder.paymentMethod).label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Địa chỉ giao hàng</p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium">{selectedOrder.shippingAddress?.receiverName}</p>
                  <p className="text-sm">{selectedOrder.shippingAddress?.phoneNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.district},{' '}
                    {selectedOrder.shippingAddress?.city}
                  </p>
                </div>
              </div>

              {/* Note */}
              {selectedOrder.note && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ghi chú</p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{selectedOrder.note}</p>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Sản phẩm</p>
                {orderItems.length > 0 ? (
                  <div className="border rounded-lg divide-y">
                    {orderItems.map((item: any) => (
                      <div key={item._id} className="flex items-center gap-4 p-3">
                        <div className="size-12 rounded border bg-muted overflow-hidden shrink-0">
                          {item.product?.images?.[0] ? (
                            <img
                              src={getProductImage(item.product)}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="size-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product?.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {(item.price || 0).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <p className="font-medium text-green-600 shrink-0">
                          {((item.quantity || 0) * (item.price || 0)).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có sản phẩm</p>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-lg font-semibold">Tổng cộng</p>
                <p className="text-lg font-bold text-green-600">
                  {(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')}đ
                </p>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground border-t pt-4">
                <div>
                  <p>Ngày tạo: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : 'N/A'}</p>
                </div>
                <div>
                  <p>Cập nhật: {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString('vi-VN') : 'N/A'}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={updateStatusOpen} onOpenChange={setUpdateStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              {(selectedOrder as any)?._id && (
                <span className="font-mono">
                  Mã đơn: {(selectedOrder as any)._id?.slice(-8).toUpperCase()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái mới</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                  <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                  <SelectItem value="SHIPPED">Đang giao hàng</SelectItem>
                  <SelectItem value="DELIVERED">Đã giao hàng</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateStatusOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmStatusUpdate} disabled={updating || !selectedStatus}>
              {updating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Orders