import React, { useState, useEffect } from "react"
import {
  User,
  Lock,
  MapPin,
  Camera,
  Pencil,
  Check,
  Trash2,
  Star,
} from "lucide-react"
import { updateUser } from "@/store/authSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import userApi from "@/api/userApi"
import addressApi from "@/api/addressApi"
import uploadApi from "@/api/uploadApi"
import type { User as UserType, Address } from "@/types/auth"
import { getAvatarUrl } from "@/utils/imageUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const Profile: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user: currentUser } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<UserType | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  // Form state
  const [personalForm, setPersonalForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [addressForm, setAddressForm] = useState({
    receiverName: "",
    phoneNumber: "",
    city: "",
    district: "",
    ward: "",
    street: "",
    isDefault: false,
  })
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])

  // Load provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const resp = await fetch("https://provinces.open-api.vn/api/p/")
        const data = await resp.json()
        setProvinces(data)
      } catch (error) {
        console.error("Lỗi tải tỉnh thành:", error)
      }
    }
    fetchProvinces()
  }, [])

  // Fetch user data
  const fetchUserData = async () => {
    const currentUserId = currentUser?._id || (currentUser as any)?.id
    if (!currentUserId) return
    setLoading(true)
    try {
      const resp: any = await userApi.getById(currentUserId)
      if (resp && !resp._id && resp.id) {
        resp._id = resp.id
      }
      setUserData({ ...resp })
      setPersonalForm({
        fullName: resp.fullName || "",
        email: resp.email || "",
        phone: resp.phone || "",
        username: resp.username || "",
      })
      dispatch(updateUser(resp))
    } catch (error) {
      console.error("Lỗi lấy thông tin cá nhân:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cid = currentUser?._id || (currentUser as any)?.id
    if (cid) {
      fetchUserData()
      fetchAddresses()
    }
  }, [currentUser?._id, (currentUser as any)?.id])

  const fetchAddresses = async () => {
    try {
      const data = await addressApi.getAll()
      setAddresses(data)
    } catch (error) {
      console.error("Lỗi lấy địa chỉ:", error)
    }
  }

  const handleProvinceChange = async (cityValue: string) => {
    const province = provinces.find(p => p.name === cityValue)
    if (!province) return
    setAddressForm(prev => ({ ...prev, city: cityValue, district: "", ward: "" }))
    setDistricts([])
    setWards([])
    try {
      const resp = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
      const data = await resp.json()
      setDistricts(data.districts || [])
    } catch (error) {
      console.error("Lỗi tải quận huyện:", error)
    }
  }

  const handleDistrictChange = async (districtValue: string) => {
    const district = districts.find(d => d.name === districtValue)
    if (!district) return
    setAddressForm(prev => ({ ...prev, district: districtValue, ward: "" }))
    setWards([])
    try {
      const resp = await fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
      const data = await resp.json()
      setWards(data.wards || [])
    } catch (error) {
      console.error("Lỗi tải phường xã:", error)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      await addressApi.delete(id)
      fetchAddresses()
    } catch (error) {
      console.error("Lỗi xóa địa chỉ:", error)
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await addressApi.setDefault(id)
      fetchAddresses()
    } catch (error) {
      console.error("Lỗi cập nhật địa chỉ mặc định:", error)
    }
  }

  const handleAddAddress = async () => {
    setLoading(true)
    try {
      await addressApi.create(addressForm)
      setIsAddressModalOpen(false)
      setAddressForm({
        receiverName: "",
        phoneNumber: "",
        city: "",
        district: "",
        ward: "",
        street: "",
        isDefault: false,
      })
      fetchAddresses()
    } catch (error) {
      console.error("Lỗi thêm địa chỉ:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateInfo = async () => {
    if (!userData?._id) return
    setLoading(true)
    try {
      const updatedUser = await userApi.update(userData._id, {
        fullName: personalForm.fullName,
        email: personalForm.email,
        phone: personalForm.phone,
      })
      setUserData(updatedUser)
      dispatch(updateUser(updatedUser))
      setIsEditing(false)
    } catch (error) {
      console.error("Lỗi cập nhật:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return
    }
    const userId = currentUser?._id || (currentUser as any)?.id || userData?._id || (userData as any)?.id
    if (!userId) return
    setLoading(true)
    try {
      await userApi.changePassword(userId, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
      setActiveTab("info")
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setLoading(true)
    try {
      const response: any = await uploadApi.uploadImage(file as File)
      if (response.avatarUrl && userData?._id) {
        const updatedUser = await userApi.update(userData._id, { avatarUrl: response.avatarUrl })
        setUserData(updatedUser)
        dispatch(updateUser(updatedUser))
      }
    } catch (error) {
      console.error("Lỗi upload avatar:", error)
    } finally {
      setLoading(false)
    }
  }

  const roleName = (typeof userData?.role === "object" && userData?.role !== null)
    ? userData.role.name
    : String(userData?.role || "USER")

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar Profile Card */}
          <Card className="sticky top-6 h-fit">
            <div className="h-32 bg-gradient-to-br from-primary to-primary/60 -mt-6 -mx-6 mb-16 rounded-t-lg relative">
              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <Avatar className="size-28 border-4 border-background shadow-xl">
                    <AvatarImage src={getAvatarUrl(userData?.avatarUrl) || undefined} />
                    <AvatarFallback>{userData?.fullName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 size-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90">
                    <Camera className="size-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>
            </div>

            <CardContent className="pt-14 text-center">
              {loading ? (
                <>
                  <Skeleton className="h-6 w-40 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{userData?.fullName}</h2>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {roleName}
                  </Badge>
                </>
              )}

              <Separator className="my-6" />

              <div className="flex flex-col gap-3 text-sm text-muted-foreground text-left px-2">
                <div className="flex items-center gap-3">
                  <User className="size-4 text-primary" />
                  <span>@{userData?.username || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-primary" />
                  <span>{addresses[0]?.city || "Chưa cập nhật"}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl py-4 text-center">
                  <div className="text-xl font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">Đơn hàng</div>
                </div>
                <div className="bg-muted/50 rounded-xl py-4 text-center">
                  <div className="text-xl font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">Voucher</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">
                  <User className="size-4 mr-2" />
                  Information
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Lock className="size-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="address">
                  <MapPin className="size-4 mr-2" />
                  Address
                </TabsTrigger>
              </TabsList>

              {/* Info Tab */}
              <TabsContent value="info" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="size-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setIsEditing(false)
                          if (userData) {
                            setPersonalForm({
                              fullName: userData.fullName || "",
                              email: userData.email || "",
                              phone: userData.phone || "",
                              username: userData.username || "",
                            })
                          }
                        }}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleUpdateInfo} disabled={loading}>
                          <Check className="size-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={personalForm.fullName}
                          onChange={(e) => setPersonalForm(prev => ({ ...prev, fullName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalForm.email}
                          onChange={(e) => setPersonalForm(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={personalForm.phone}
                          onChange={(e) => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={personalForm.username}
                          disabled
                          className="opacity-50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Current Password</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleUpdatePassword} disabled={loading} className="mt-2">
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Address Tab */}
              <TabsContent value="address" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Shipping Addresses</CardTitle>
                    <Button size="sm" onClick={() => setIsAddressModalOpen(true)}>
                      <MapPin className="size-4 mr-2" />
                      Add Address
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-32 w-full" />
                        ))}
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground mb-4">No addresses yet</p>
                        <Button onClick={() => setIsAddressModalOpen(true)}>
                          Add your first address
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {addresses.map((addr, idx) => (
                          <div
                            key={addr._id}
                            className="relative p-4 rounded-lg border bg-card text-card-foreground"
                          >
                            {addr.isDefault && (
                              <Badge className="absolute -top-2 -right-2" variant="default">
                                Default
                              </Badge>
                            )}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-medium">{addr.receiverName}</p>
                                <p className="text-sm text-muted-foreground">Address {idx + 1}</p>
                              </div>
                              <div className="flex gap-1">
                                {!addr.isDefault && (
                                  <Button variant="ghost" size="icon" onClick={() => handleSetDefaultAddress(addr._id!)} className="size-8">
                                    <Star className="size-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr._id!)} className="size-8 text-destructive hover:text-destructive">
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                            </p>
                            <p className="text-sm mt-2">{addr.phoneNumber}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>Fill in the address details below</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="receiverName">Receiver Name</Label>
              <Input
                id="receiverName"
                value={addressForm.receiverName}
                onChange={(e) => setAddressForm(prev => ({ ...prev, receiverName: e.target.value }))}
                placeholder="Full name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={addressForm.phoneNumber}
                onChange={(e) => setAddressForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Phone number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Province/City</Label>
                <select
                  id="city"
                  value={addressForm.city}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select province</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="district">District</Label>
                <select
                  id="district"
                  value={addressForm.district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={!districts.length}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select district</option>
                  {districts.map(d => (
                    <option key={d.code} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ward">Ward</Label>
              <select
                id="ward"
                value={addressForm.ward}
                onChange={(e) => setAddressForm(prev => ({ ...prev, ward: e.target.value }))}
                disabled={!wards.length}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select ward</option>
                {wards.map(w => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={addressForm.street}
                onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                placeholder="House number, street name..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddressModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAddress} disabled={loading}>Save Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile
