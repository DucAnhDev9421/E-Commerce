import React, { useEffect, useState, useCallback } from "react"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  Tags,
  CheckCircle,
  XCircle,
  X,
  Upload,
} from "lucide-react"
import categoryApi from "@/api/categoryApi"
import productApi from "@/api/productApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000"

const getImageUrl = (url: string) => {
  if (!url) return ""
  if (url.startsWith("http")) return url
  return `${BASE_URL}${url}`
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [viewCategory, setViewCategory] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [fileList, setFileList] = useState<any[]>([])

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
    image: "",
  })

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const response: any = await categoryApi.getAll()
      setCategories(response)
      setFiltered(response)
    } catch (error: any) {
      console.error("Error loading categories:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  useEffect(() => {
    if (!searchText.trim()) {
      setFiltered(categories)
    } else {
      const q = searchText.toLowerCase()
      setFiltered(categories.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      ))
    }
  }, [searchText, categories])

  const handleAdd = () => {
    setEditingCategory(null)
    setFileList([])
    setFormData({
      name: "",
      slug: "",
      description: "",
      status: "active",
      image: "",
    })
    setIsModalOpen(true)
  }

  const handleEdit = (record: any) => {
    setEditingCategory(record)
    setFormData({
      name: record.name || "",
      slug: record.slug || "",
      description: record.description || "",
      status: record.status || "active",
      image: record.image || "",
    })
    if (record.image) {
      setFileList([{
        uid: "1",
        name: "image.png",
        status: "done",
        url: getImageUrl(record.image),
        response: { avatarUrl: record.image }
      }])
    } else {
      setFileList([])
    }
    setIsModalOpen(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const formDataUpload = new FormData()
    formDataUpload.append("avatar", file)
    try {
      const res: any = await productApi.uploadImage(formDataUpload)
      const newFile = {
        uid: "1",
        name: file.name,
        status: "done",
        url: getImageUrl(res.avatarUrl),
        response: { avatarUrl: res.avatarUrl },
      }
      setFileList([newFile])
    } catch (err) {
      console.error("Upload error:", err)
    }
  }

  const removeImage = () => {
    setFileList([])
  }

  const handleView = (record: any) => {
    setViewCategory(record)
    setIsViewOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await categoryApi.delete(deleteId)
      setIsDeleteOpen(false)
      setDeleteId(null)
      fetchCategories()
    } catch (error: any) {
      console.error("Error deleting:", error)
    }
  }

  const handleModalOk = async () => {
    try {
      setSaving(true)
      const imageUrl = fileList.length > 0 && fileList[0].status === "done"
        ? fileList[0].response?.avatarUrl || fileList[0].url
        : ""
      const data = { ...formData, image: imageUrl }

      if (editingCategory) {
        await categoryApi.update(editingCategory._id, data)
      } else {
        await categoryApi.create(data)
      }
      setIsModalOpen(false)
      fetchCategories()
    } catch (error: any) {
      console.error("Error saving:", error)
    } finally {
      setSaving(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w ]+/g, "").replace(/ +/g, "-")
  }

  const activeCount = categories.filter(c => c.status === "active").length
  const inactiveCount = categories.filter(c => c.status !== "active").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage product categories and groupings</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Categories</CardTitle>
            <Tags className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle className="size-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
            <XCircle className="size-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveCount}</div>
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
                placeholder="Search categories..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchCategories} disabled={loading}>
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
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
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Tags className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No categories found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item: any, idx: number) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg border bg-muted overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tags className="size-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      /{item.slug}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {item.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[item.status]?.variant || "outline"}>
                        {statusConfig[item.status]?.label || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "-"}
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
            <SheetTitle>Category Details</SheetTitle>
            <SheetDescription>View category information</SheetDescription>
          </SheetHeader>
          {viewCategory && (
            <ScrollArea className="h-[calc(100%-120px)] mt-6 pr-4">
              <div className="space-y-6">
                <div className="aspect-video rounded-lg border bg-muted overflow-hidden">
                  {viewCategory.image ? (
                    <img src={getImageUrl(viewCategory.image)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tags className="size-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <h3 className="text-xl font-semibold">{viewCategory.name}</h3>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Slug</p>
                  <p className="font-mono text-sm">/{viewCategory.slug}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[viewCategory.status]?.variant || "outline"}>
                    {statusConfig[viewCategory.status]?.label || viewCategory.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{viewCategory.description || "No description"}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">
                      {viewCategory.createdAt ? new Date(viewCategory.createdAt).toLocaleString("vi-VN") : "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Updated</p>
                    <p className="text-sm font-medium">
                      {viewCategory.updatedAt ? new Date(viewCategory.updatedAt).toLocaleString("vi-VN") : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>Fill in the category details below</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))
                }}
                placeholder="Enter category name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="category-slug"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Category description..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <Separator />

            <div className="grid gap-3">
              <Label>Category Image</Label>
              <div className="flex items-center gap-4">
                {fileList.length > 0 ? (
                  <div className="relative size-24 rounded-lg border bg-muted overflow-hidden">
                    <img src={fileList[0].url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={removeImage}
                      className="absolute top-1 right-1 size-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="size-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/5 transition-colors">
                    <Upload className="size-6 text-muted-foreground/50 mb-1" />
                    <span className="text-xs text-muted-foreground/50">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleModalOk} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
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

export default Categories
