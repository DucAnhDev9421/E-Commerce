import React, { useEffect, useState, useCallback } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  Package,
  Image as ImageIcon,
  X,
  Upload,
} from 'lucide-react'
import productApi from '@/api/productApi'
import categoryApi from '@/api/categoryApi'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'

const formatVND = (value: number) =>
  value.toLocaleString('vi-VN')

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${BASE_URL}${url}`
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  in_stock: { label: 'In Stock', variant: 'default' },
  out_of_stock: { label: 'Out of Stock', variant: 'destructive' },
  discontinued: { label: 'Discontinued', variant: 'secondary' },
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [viewProduct, setViewProduct] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [fileList, setFileList] = useState<any[]>([])
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [priceInput, setPriceInput] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 0,
    stock: 0,
    categoryId: '',
    description: '',
    status: 'in_stock',
    images: [] as string[],
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [productRes, categoryRes]: any = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
      ])
      const productList = productRes.items || []
      setProducts(productList)
      setFiltered(productList)
      setCategories(categoryRes)
    } catch (error: any) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    let result = [...products]
    if (searchText.trim()) {
      const q = searchText.toLowerCase()
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
    if (filterCategory) {
      result = result.filter(p => p.categoryId?._id === filterCategory)
    }
    setFiltered(result)
  }, [searchText, filterCategory, products])

  const handleAdd = () => {
    setEditingProduct(null)
    setFileList([])
    setPriceInput('0')
    setFormData({
      name: '',
      slug: '',
      price: 0,
      stock: 0,
      categoryId: '',
      description: '',
      status: 'in_stock',
      images: [],
    })
    setIsModalOpen(true)
  }

  const handleEdit = (record: any) => {
    setEditingProduct(record)
    const priceVal = record.price || 0
    setPriceInput(formatVND(priceVal))
    setFormData({
      name: record.name || '',
      slug: record.slug || '',
      price: priceVal,
      stock: record.stock || 0,
      categoryId: record.categoryId?._id || '',
      description: record.description || '',
      status: record.status || 'in_stock',
      images: record.images || [],
    })
    const imgs = (record.images || []).map((url: string, i: number) => ({
      uid: String(i),
      name: `image-${i}`,
      status: 'done',
      url: getImageUrl(url),
      response: { avatarUrl: url },
    }))
    setFileList(imgs)
    setIsModalOpen(true)
  }

  const handleView = (record: any) => {
    setViewProduct(record)
    setIsViewOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await productApi.delete(deleteId)
      setIsDeleteOpen(false)
      setDeleteId(null)
      fetchData()
    } catch (error: any) {
      console.error('Error deleting:', error)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('image', file)
      try {
        const res: any = await productApi.uploadImage(formData)
        const newFile = {
          uid: String(Date.now() + i),
          name: file.name,
          status: 'done',
          url: getImageUrl(res.avatarUrl),
          response: { avatarUrl: res.avatarUrl },
        }
        setFileList(prev => [...prev, newFile])
      } catch (err) {
        console.error('Upload error:', err)
      }
    }
  }

  const removeImage = (uid: string) => {
    setFileList(prev => prev.filter(f => f.uid !== uid))
  }

  const handleModalOk = async () => {
    try {
      setSaving(true)
      const imageUrls = fileList
        .filter(f => f.status === 'done')
        .map(f => f.response?.avatarUrl || f.url)
      const data = { ...formData, images: imageUrls }

      if (editingProduct) {
        await productApi.update(editingProduct._id, data)
      } else {
        await productApi.create(data)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error: any) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w ]+/g, '').replace(/ +/g, '-')
  }

  const outStockCount = products.filter(p => p.status === 'out_of_stock').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory and catalog</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
            <Badge variant="destructive">
              {outStockCount}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
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
                placeholder="Search products..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory || 'all'} onValueChange={v => setFilterCategory(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectLabel>Categories</SelectLabel>
                  {categories.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-12 rounded-lg" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Package className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No products found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item: any, idx: number) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg border bg-muted overflow-hidden shrink-0">
                          {item.images?.[0] ? (
                            <img src={getImageUrl(item.images[0])} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="size-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.categoryId?.name || 'No category'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {(item.price || 0).toLocaleString('vi-VN')}₫
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.stock > 10 ? 'default' : item.stock > 0 ? 'secondary' : 'destructive'}>
                        {item.stock || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[item.status]?.variant || 'outline'}>
                        {statusConfig[item.status]?.label || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(item)}>
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item._id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Sheet */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Product Details</SheetTitle>
            <SheetDescription>View product information</SheetDescription>
          </SheetHeader>
          {viewProduct && (
            <ScrollArea className="h-[calc(100%-120px)] mt-6 pr-4">
              <div className="space-y-6">
                {/* Images */}
                <div className="grid grid-cols-3 gap-3">
                  {viewProduct.images?.length > 0 ? (
                    viewProduct.images.map((url: string, i: number) => (
                      <div key={i} className="aspect-square rounded-lg border bg-muted overflow-hidden">
                        <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 aspect-video flex flex-col items-center justify-center bg-muted rounded-lg">
                      <ImageIcon className="size-10 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No images</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Product ID</p>
                  <p className="font-mono text-sm">{viewProduct._id?.slice(-8).toUpperCase()}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <h3 className="text-xl font-semibold">{viewProduct.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-xl font-bold text-primary">
                      {(viewProduct.price || 0).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="text-xl font-bold">{viewProduct.stock || 0}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="secondary">{viewProduct.categoryId?.name || 'N/A'}</Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[viewProduct.status]?.variant || 'outline'}>
                    {statusConfig[viewProduct.status]?.label || viewProduct.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{viewProduct.description || 'No description'}</p>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>Fill in the product details below</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => {
                  setFormData(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))
                }}
                placeholder="Enter product name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="product-slug"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (VND)</Label>
                <Input
                  id="price"
                  value={priceInput}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^\d]/g, '')
                    const num = Number(raw) || 0
                    setPriceInput(formatVND(num))
                    setFormData(prev => ({ ...prev, price: num }))
                  }}
                  onBlur={() => {
                    setPriceInput(formatVND(formData.price))
                  }}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={e => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.categoryId || 'none'} onValueChange={v => setFormData(prev => ({ ...prev, categoryId: v === 'none' ? '' : v }))}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Product description..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v }))}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="grid gap-3">
              <Label>Product Images (max 8)</Label>
              <div className="grid grid-cols-4 gap-3">
                {fileList.map(file => (
                  <div key={file.uid} className="relative aspect-square rounded-lg border bg-muted overflow-hidden group">
                    <img src={file.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(file.uid)}
                      className="absolute top-1 right-1 size-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
                {fileList.length < 8 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/5 transition-colors">
                    <Upload className="size-6 text-muted-foreground/50 mb-1" />
                    <span className="text-xs text-muted-foreground/50">Upload</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleModalOk} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export default Products
