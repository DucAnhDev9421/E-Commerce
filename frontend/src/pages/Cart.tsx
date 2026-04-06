import React from "react"
import {
  ArrowLeft,
  Trash2,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { removeFromCart, updateQuantityThunk } from "@/store/cartSlice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000"

const Cart: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items: cartItems, totalAmount: subtotal } = useAppSelector((state) => state.cart)

  const shipping = subtotal > 1000000 ? 0 : 50000
  const total = subtotal + shipping

  const handleUpdateQuantity = async (id: string, val: number) => {
    if (val < 1) return
    try {
      await dispatch(updateQuantityThunk({ productId: id, quantity: val })).unwrap()
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  const handleRemoveItem = async (id: string) => {
    try {
      await dispatch(removeFromCart(id)).unwrap()
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const getImageUrl = (url: string) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    return `${BASE_URL}${url}`
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">
              {cartItems.length > 0 ? `${cartItems.length} items in your cart` : "Your cart is empty"}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="size-4" />
            Continue Shopping
          </Button>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Cart Items */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Price</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item: any) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="size-20 rounded-lg border bg-muted overflow-hidden shrink-0">
                                {item.image ? (
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingCart className="size-6 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <p className="font-medium leading-tight">{item.name}</p>
                                <Badge variant="secondary" className="w-fit text-xs">
                                  {item.category || "General"}
                                </Badge>
                                {item.discount > 0 && (
                                  <Badge variant="destructive" className="w-fit text-xs">
                                    -{item.discount}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium">
                              {item.price.toLocaleString("vi-VN")}₫
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="size-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value)
                                  if (!isNaN(val)) handleUpdateQuantity(item._id, val)
                                }}
                                className="size-10 text-center w-16"
                                min={1}
                                max={100}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                disabled={item.quantity >= 100}
                              >
                                <Plus className="size-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-bold text-primary">
                              {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Free Shipping Banner */}
              <Card className={subtotal >= 1000000 ? "bg-green-50 border-green-200" : "bg-muted"}>
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Truck className="size-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    {subtotal >= 1000000 ? (
                      <p className="font-semibold text-green-700">
                        Congratulations! You get free shipping!
                      </p>
                    ) : (
                      <>
                        <p className="font-semibold">
                          Free shipping for orders over 1,000,000₫
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Add {(1000000 - subtotal).toLocaleString("vi-VN")}₫ more to unlock free shipping
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{subtotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? "text-green-600" : ""}`}>
                      {shipping === 0 ? "FREE" : `${shipping.toLocaleString("vi-VN")}₫`}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {total.toLocaleString("vi-VN")}₫
                    </span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full mt-4"
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>

                  <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
                    <ShieldCheck className="size-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">100% Secure Payment</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your payment information is encrypted and secure.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="py-20 text-center">
            <CardContent>
              <ShoppingCart className="size-16 mx-auto text-muted-foreground/30 mb-6" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Add some products to get started</p>
              <Button onClick={() => navigate("/")} size="lg">
                Browse Products
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Cart
