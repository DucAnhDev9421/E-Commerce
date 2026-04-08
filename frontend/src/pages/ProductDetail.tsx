import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/cartSlice';
import productApi from '../api/productApi';
import reviewApi from '../api/reviewApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  ShoppingCart, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  Heart, 
  Zap, 
  History, 
  Globe, 
  Home, 
  Truck,
  Star,
  ChevronRight,
  Minus,
  Plus,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from "@/components/ui/card";
import { message } from 'antd';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      message.info('Vui lòng đăng nhập để đánh giá sản phẩm.');
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) {
      message.warning('Vui lòng nhập nội dung đánh giá.');
      return;
    }
    try {
      if (!id) return;
      await reviewApi.create(id, { rating: reviewRating, comment: reviewComment });
      message.success('Cảm ơn bạn đã đánh giá sản phẩm!');
      setIsReviewOpen(false);
      setReviewComment('');
      setReviewRating(5);
      
      const revRes: any = await reviewApi.getByProduct(id);
      const reviewsData = Array.isArray(revRes.data) ? revRes.data : Array.isArray(revRes) ? revRes : [];
      reviewsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(reviewsData);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không thể gửi đánh giá lúc này.');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res: any = await productApi.getById(id);
        setProduct(res);
        if (res.images && res.images.length > 0) {
          const firstImage = res.images[0].startsWith('http') ? res.images[0] : `${BASE_URL}${res.images[0]}`;
          setMainImage(firstImage);
        }
        
        try {
          const revRes: any = await reviewApi.getByProduct(id);
          const reviewsData = Array.isArray(revRes.data) ? revRes.data : Array.isArray(revRes) ? revRes : [];
          reviewsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setReviews(reviewsData);
        } catch(e) {
          console.error("Lỗi lấy danh sách đánh giá", e);
        }
      } catch (error: any) {
        message.error('Lỗi tải chi tiết sản phẩm: ' + (error?.message || 'Không thể lấy thông tin sản phẩm'));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      message.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      navigate('/login');
      return;
    }

    if (!product) return;
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      message.success(`${product.name} đã được thêm vào giỏ hàng.`);
    } catch (error: any) {
      message.error('Không thể thêm sản phẩm: ' + (error || 'Lỗi hệ thống'));
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      message.info('Vui lòng đăng nhập để bắt đầu đặt hàng.');
      navigate('/login');
      return;
    }

    if (!product) return;
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      navigate('/checkout');
    } catch (error: any) {
      message.error('Lỗi: ' + (error || 'Không thể tiến hành đặt hàng'));
    }
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return <ProductNotFound />;

  const discount = product.discount || 0;
  const oldPrice = discount > 0 ? product.price / (1 - discount / 100) : 0;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + (rev.rating || 5), 0) / reviews.length).toFixed(1) 
    : '5.0';
  const totalReviews = reviews.length;

  return (
    <div className="min-h-screen bg-background pb-20 pt-8 animate-fadeIn">
      {/* Container with Breadcrumbs */}
      <div className="container mx-auto px-4">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Home className="size-4" /> Trang chủ
          </Link>
          <ChevronRight className="size-3.5 opacity-40 shrink-0" />
          <span className="opacity-60">{product.categoryId?.name}</span>
          <ChevronRight className="size-3.5 opacity-40 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="relative group rounded-3xl overflow-hidden bg-card border shadow-sm aspect-[4/3] md:aspect-[16/9] lg:aspect-auto lg:h-[600px] flex items-center justify-center">
              <img 
                src={mainImage} 
                className="w-full h-full object-contain p-4 md:p-8 transition-transform duration-700 group-hover:scale-105" 
                alt={product.name} 
              />
              {discount > 0 && (
                <Badge variant="destructive" className="absolute top-6 right-6 text-base font-bold px-4 py-1.5 shadow-lg rounded-full">
                  -{discount}%
                </Badge>
              )}
              <div className="absolute bottom-6 right-6 flex items-center gap-2">
                <Button size="icon" variant="secondary" className="rounded-full shadow-md bg-background/80 backdrop-blur-sm hover:scale-110 active:scale-95 transition-all outline-none border border-border">
                  <Heart className="size-5" />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full shadow-md bg-background/80 backdrop-blur-sm hover:scale-110 active:scale-95 transition-all outline-none border border-border">
                  <Share2 className="size-5" />
                </Button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {product.images?.map((img: string, idx: number) => {
                const fullUrl = img.startsWith('http') ? img : `${BASE_URL}${img}`;
                return (
                  <button
                    key={idx}
                    onClick={() => setMainImage(fullUrl)}
                    className={cn(
                      "relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 shrink-0 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-card",
                      mainImage === fullUrl ? "border-primary shadow-md" : "border-border/50 opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={fullUrl} className="w-full h-full object-cover p-2" alt={product.name} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 pointer-events-none rounded-md px-3 py-1 font-medium tracking-wide">CHÍNH HÃNG</Badge>
                <div className="flex items-center gap-1 ml-auto">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{averageRating}</span>
                    <span className="text-xs text-muted-foreground font-normal">({totalReviews} đánh giá)</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                {product.name}
              </h1>

              <div className="space-y-1">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black text-primary tracking-tighter">
                    {product.price.toLocaleString('vi-VN')}₫
                  </span>
                  {oldPrice > product.price && (
                    <span className="text-xl text-muted-foreground/50 line-through font-normal">
                      {Math.floor(oldPrice).toLocaleString('vi-VN')}₫
                    </span>
                  )}
                </div>
                {discount > 0 && (
                   <div className="text-sm text-primary font-medium flex items-center gap-1.5 animate-pulse">
                      <Zap className="size-3.5 fill-current" />
                      Tiết kiệm {Math.floor(oldPrice - product.price).toLocaleString('vi-VN')}₫ ngay hôm nay
                   </div>
                )}
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Config & Actions */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                 <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Số lượng</span>
                 <div className="flex items-center border rounded-full p-1 bg-muted/30">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-10 rounded-full hover:bg-background shadow-none" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={product.stock <= 0}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="min-w-10 text-center font-bold text-lg">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-10 rounded-full hover:bg-background shadow-none" 
                      onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                      disabled={product.stock <= 0}
                    >
                      <Plus className="size-4" />
                    </Button>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <Button 
                    size="lg" 
                    className="h-16 text-lg font-bold rounded-full transition-all group overflow-hidden relative"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                 >
                    <span className="relative z-10 flex items-center gap-2">
                       {product.stock <= 0 ? 'HẾT HÀNG' : 'MUA NGAY'}
                       {product.stock > 0 && <ChevronRight className="size-5 transition-all group-hover:translate-x-1" />}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transition-all group-hover:h-full" />
                 </Button>
                 <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-16 text-lg font-bold rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary transition-all gap-2"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                 >
                    <ShoppingCart className="size-5" />
                    {product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                 </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/20 p-4 rounded-2xl border border-dotted">
                 <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                 Sản phẩm đang còn {product.stock} chiếc trong kho
              </div>
            </div>

            {/* Service Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 p-4 rounded-2xl border bg-card/50">
                 <Truck className="size-6 text-primary" />
                 <span className="text-xs font-bold uppercase tracking-tight">Giao hàng nhanh</span>
                 <span className="text-[10px] text-muted-foreground leading-none">Miễn phí cho đơn từ 2tr</span>
              </div>
              <div className="flex flex-col gap-2 p-4 rounded-2xl border bg-card/50">
                 <History className="size-6 text-primary" />
                 <span className="text-xs font-bold uppercase tracking-tight">Bảo hành 2 năm</span>
                 <span className="text-[10px] text-muted-foreground leading-none">Chính sách 1 đổi 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-24">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none gap-8">
              <TabsTrigger 
                value="details" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent bg-transparent rounded-none px-4 py-4 text-base font-bold tracking-tight uppercase"
              >
                Chi tiết sản phẩm
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent bg-transparent rounded-none px-4 py-4 text-base font-bold tracking-tight uppercase"
              >
                Đánh giá ({totalReviews > 99 ? '99+' : totalReviews})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-12">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  <div className="lg:col-span-7 prose prose-emerald max-w-none">
                     <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
                        <CheckCircle2 className="size-6 text-primary" /> 
                        Câu chuyện sản phẩm
                     </h3>
                     <p className="text-lg text-muted-foreground leading-relaxed font-light">
                        {product.description || 'Sản phẩm tuyệt vời với thiết kế hiện đại và tinh tế. Phù hợp với mọi không gian và phong cách sống của bạn.'}
                     </p>
                     
                     <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-muted/30 border-none shadow-none">
                          <CardContent className="p-6">
                             <Zap className="size-6 text-primary mb-3" />
                             <h4 className="font-bold mb-1">Hiệu năng tối ưu</h4>
                             <p className="text-xs text-muted-foreground">Được trang bị công nghệ mới nhất cho trải nghiệm mượt mà.</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30 border-none shadow-none">
                          <CardContent className="p-6">
                             <ShieldCheck className="size-6 text-primary mb-3" />
                             <h4 className="font-bold mb-1">An toàn tuyệt đối</h4>
                             <p className="text-xs text-muted-foreground">Đảm bảo các tiêu chuẩn an toàn quốc tế khắt khe nhất.</p>
                          </CardContent>
                        </Card>
                     </div>
                  </div>
                  <div className="lg:col-span-5 flex flex-col gap-6">
                     <div className="bg-card border rounded-3xl p-8 shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center ring-1 ring-border rounded-full py-1">Thông số kỹ thuật</h4>
                        <div className="space-y-5">
                          {[
                            { l: 'Thương hiệu', v: 'Luxury Modern' },
                            { l: 'Mã sản phẩm', v: product.slug?.toUpperCase() || 'MOD-ITEM' },
                            { l: 'Phân khúc', v: 'Premium Edition' },
                            { l: 'Năm ra mắt', v: '2024' },
                            { l: 'Tình trạng', v: 'Hàng chính hãng' },
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-2 group hover:bg-muted/30 px-2 rounded-lg transition-all">
                              <span className="text-xs font-medium text-muted-foreground uppercase">{item.l}</span>
                              <span className="font-bold text-foreground text-sm italic">{item.v}</span>
                            </div>
                          ))}
                        </div>
                     </div>
                     <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20 relative overflow-hidden group">
                        <div className="relative z-10">
                           <h4 className="text-lg font-bold text-primary mb-2">Đặc biệt tại Modern Store</h4>
                           <p className="text-sm text-primary/70 leading-relaxed font-light">
                              Mỗi sản phẩm được kiểm tra thủ công bởi đội ngũ chuyên gia trước khi đóng gói gửi đến bạn.
                           </p>
                        </div>
                        <Globe className="absolute -bottom-10 -right-10 size-40 text-primary/5 group-hover:rotate-45 transition-transform duration-1000" />
                     </div>
                  </div>
               </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-12 pb-20">
               {reviews && reviews.length > 0 ? (
                 <div className="space-y-8">
                   <div className="flex justify-between items-center bg-muted/20 p-6 rounded-2xl border">
                     <div>
                       <h3 className="text-2xl font-bold mb-1">Đánh giá từ khách hàng</h3>
                       <p className="text-muted-foreground text-sm">Có {reviews.length} đánh giá cho sản phẩm này</p>
                     </div>
                     <Button className="rounded-full px-8" onClick={() => setIsReviewOpen(true)}>Viết đánh giá</Button>
                   </div>
                   <div className="space-y-4">
                     {reviews.map((rev, idx) => (
                       <Card key={idx} className="shadow-sm">
                         <CardContent className="p-6">
                           <div className="flex justify-between items-start mb-4">
                             <div className="flex gap-2 items-center">
                               <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                                 {rev.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                               </div>
                               <div>
                                 <div className="font-bold text-sm">{rev.user?.username || 'Người dùng'}</div>
                                 <div className="text-xs text-muted-foreground">
                                   {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("vi-VN") : 'Gần đây'}
                                 </div>
                               </div>
                             </div>
                             <div className="flex">
                               {[1,2,3,4,5].map(star => (
                                 <Star key={star} className={cn("size-4", star <= rev.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20")} />
                               ))}
                             </div>
                           </div>
                           <p className="text-sm leading-relaxed">{rev.comment}</p>
                         </CardContent>
                       </Card>
                     ))}
                   </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-muted/20 rounded-[3rem] border border-dashed">
                    <div className="p-6 bg-background rounded-full shadow-md">
                       <Star className="size-12 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-xl font-bold">Chưa có đánh giá nào</h3>
                       <p className="text-muted-foreground max-w-xs mx-auto">Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận về sản phẩm này.</p>
                    </div>
                    <Button variant="outline" className="rounded-full px-8 mt-4" onClick={() => setIsReviewOpen(true)}>Viết đánh giá</Button>
                 </div>
               )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đánh giá sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2 mx-auto mb-2">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                    <Star className={cn("size-8 transition-colors", star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nội dung đánh giá</label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmitReview}>Gửi đánh giá</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6 pt-2 bg-gradient-to-t from-background to-transparent pointer-events-none">
         <div className="bg-background/80 backdrop-blur-3xl border shadow-2xl p-4 rounded-[2rem] flex items-center gap-4 pointer-events-auto">
            <div className="flex flex-col pl-4 flex-1">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Giá thanh toán</span>
               <span className="text-xl font-black text-primary leading-none tracking-tighter">{product.price?.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex gap-2">
                <Button 
                   size="icon" 
                   variant="outline"
                   className="h-14 w-14 rounded-2xl hover:bg-primary/5"
                   onClick={handleAddToCart}
                >
                   <ShoppingCart className="size-5" />
                </Button>
                <Button 
                   className="h-14 px-8 rounded-2xl font-bold bg-primary shadow-lg shadow-primary/20 active:scale-95 transition-all outline-none"
                   onClick={handleBuyNow}
                >
                  MUA NGAY
                </Button>
            </div>
         </div>
      </div>
    </div>
  );
};

const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        <Skeleton className="w-full aspect-[16/9] rounded-[2rem]" />
        <div className="flex gap-4">
           {[1, 2, 3, 4].map(i => <Skeleton key={i} className="size-24 rounded-2xl" />)}
        </div>
      </div>
      <div className="lg:col-span-5 xl:col-span-4 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-6">
           <Skeleton className="h-10 w-full" />
           <Skeleton className="h-16 w-full rounded-full" />
           <Skeleton className="h-16 w-full rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const ProductNotFound = () => (
  <div className="flex flex-col items-center justify-center py-40 animate-fadeIn">
     <div className="size-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Eye className="size-12 text-muted-foreground" />
     </div>
     <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
     <p className="text-muted-foreground mb-8">Xin lỗi, sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
     <Button asChild className="rounded-full px-8">
        <Link to="/">Quay lại trang chủ</Link>
     </Button>
  </div>
);

export default ProductDetail;
