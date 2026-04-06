import React, { useEffect, useState } from "react"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Shield,
  Lock,
  Unlock,
  Mail,
  Phone,
  Upload,
  UserCheck,
} from "lucide-react"
import userApi from "@/api/userApi"
import roleApi from "@/api/roleApi"
import uploadApi from "@/api/uploadApi"
import type { User as UserType, Role } from "@/types/auth"
import { getAvatarUrl, BASE_URL } from "@/utils/imageUtils"
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
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filterRole, setFilterRole] = useState<string>("")

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)

  // Upload states
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Form data
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phone: "",
    roleId: "",
    avatarUrl: "",
  })

  const [addFormData, setAddFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    roleId: "",
    avatarUrl: "",
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await userApi.getAll()
      setUsers(response as any)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await roleApi.getAll()
      setRoles(response as any)
    } catch (error) {
      console.error("Error loading roles:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase())

    const roleId = (user.role && typeof user.role === "object") ? user.role._id : user.role
    const matchesRole = filterRole ? roleId === filterRole : true

    return matchesSearch && matchesRole
  })

  const handleEdit = (user: UserType) => {
    setEditingUser(user)
    const roleId = (user.role && typeof user.role === "object") ? user.role._id : user.role
    setImageUrl(user.avatarUrl ? `${BASE_URL}${user.avatarUrl}` : null)
    setEditFormData({
      fullName: user.fullName,
      phone: user.phone || "",
      roleId: roleId || "",
      avatarUrl: user.avatarUrl || "",
    })
    setIsEditModalOpen(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isAdd: boolean) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const response: any = await uploadApi.uploadImage(files[0] as File)
      const photoPath = response.avatarUrl
      const fullUrl = `${BASE_URL}${photoPath}`
      setImageUrl(fullUrl)

      if (isAdd) {
        setAddFormData(prev => ({ ...prev, avatarUrl: photoPath }))
      } else {
        setEditFormData(prev => ({ ...prev, avatarUrl: photoPath }))
      }
    } catch (error) {
      console.error("Upload error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await userApi.delete(id)
      fetchUsers()
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const handleToggleLock = async (user: UserType) => {
    const isLocked = user.lockTime && new Date(user.lockTime).getTime() > Date.now()
    const newLockTime = isLocked ? null : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)

    try {
      await userApi.update(user._id, { lockTime: newLockTime })
      fetchUsers()
    } catch (error) {
      console.error("Error toggling lock:", error)
    }
  }

  const onFinishEdit = async () => {
    if (!editingUser) return
    try {
      await userApi.update(editingUser._id, {
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        role: editFormData.roleId,
        avatarUrl: editFormData.avatarUrl,
      })
      setIsEditModalOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error updating:", error)
    }
  }

  const onFinishAdd = async () => {
    try {
      await userApi.create({
        ...addFormData,
        role: addFormData.roleId,
      })
      setIsAddModalOpen(false)
      setAddFormData({
        fullName: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        roleId: "",
        avatarUrl: "",
      })
      setImageUrl(null)
      fetchUsers()
    } catch (error) {
      console.error("Error creating:", error)
    }
  }

  const lockedCount = users.filter(user => user.lockTime && new Date(user.lockTime).getTime() > Date.now()).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => {
          setImageUrl(null)
          setAddFormData({
            fullName: "",
            email: "",
            phone: "",
            username: "",
            password: "",
            roleId: "",
            avatarUrl: "",
          })
          setIsAddModalOpen(true)
        }}>
          <Plus className="size-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <UserCheck className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Roles</CardTitle>
            <Shield className="size-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Locked</CardTitle>
            <Lock className="size-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lockedCount}</div>
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
                placeholder="Search by name, email, username..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="flex h-10 w-full md:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
            <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading}>
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
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
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
                        <Skeleton className="size-12 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Shield className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any, idx: number) => {
                  const isLocked = user.lockTime && new Date(user.lockTime).getTime() > Date.now()
                  const roleName = (typeof user.role === "object" && user.role !== null) ? user.role.name : String(user.role)

                  return (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-12">
                            <AvatarImage src={getAvatarUrl(user.avatarUrl) || undefined} />
                            <AvatarFallback>{user.fullName?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">ID: {user._id?.slice(-6)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="size-3.5" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="size-3.5" />
                            <span>{user.phone || "-"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleName.toUpperCase() === "ADMIN" ? "default" : "secondary"}>
                          {roleName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isLocked ? "destructive" : "default"}>
                          {isLocked ? "Locked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleLock(user)}
                            className={isLocked ? "text-amber-600 hover:text-amber-700" : "text-red-600 hover:text-red-700"}
                          >
                            {isLocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(user._id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="size-4" />
                          </Button>
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <Avatar className="size-24">
                  <AvatarImage src={imageUrl || undefined} />
                  <AvatarFallback>{editFormData.fullName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 size-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90">
                  <Upload className="size-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, false)} />
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-fullName">Full Name</Label>
              <Input
                id="edit-fullName"
                value={editFormData.fullName}
                onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                value={editFormData.roleId}
                onChange={(e) => setEditFormData(prev => ({ ...prev, roleId: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select role</option>
                {roles.map(role => (
                  <option key={role._id} value={role._id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={onFinishEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <Avatar className="size-24">
                  <AvatarImage src={imageUrl || undefined} />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 size-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90">
                  <Upload className="size-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, true)} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-fullName">Full Name</Label>
                <Input
                  id="add-fullName"
                  value={addFormData.fullName}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Nguyen Van A"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="example@gmail.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="0123456789"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add-username">Username</Label>
                <Input
                  id="add-username"
                  value={addFormData.username}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="username123"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add-password">Password</Label>
                <Input
                  id="add-password"
                  type="password"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="********"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add-role">Role</Label>
                <select
                  id="add-role"
                  value={addFormData.roleId}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, roleId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select role</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={onFinishAdd}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Users
