import React, { useEffect, useState } from 'react';
import { Button, InputNumber, Divider, Typography, Row, Col, Empty, notification, Rate, Breadcrumb, Image, Tabs, Spin } from 'antd';
import { 
  ShoppingCartOutlined, 
  SafetyCertificateOutlined, 
  CheckCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  GlobalOutlined,
  HomeOutlined,
  TruckOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import productApi from '../api/productApi';

const { Title, Text, Paragraph } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

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
      } catch (error: any) {
        notification.error({
          title: 'Lỗi tải chi tiết sản phẩm',
          description: error?.message || 'Không thể lấy thông tin sản phẩm',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addItem({ ...product, qty: quantity }));
    notification.success({ 
      title: 'Đã thêm vào giỏ hàng',
      description: `${product.name} (x${quantity}) đã vào giỏ hàng.`,
      placement: 'bottomRight'
    });
    navigate('/cart');
  };

  const handleBuyNow = () => {
    if (!product) return;
    dispatch(addItem({ ...product, qty: quantity }));
    navigate('/checkout');
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
      <Spin size="large" />
      <Text className="text-blue-500 animate-pulse font-bold tracking-widest uppercase">Đang tải tuyệt phẩm...</Text>
    </div>
  );
  
  if (!product) return <div className="py-20 flex justify-center"><Empty description="Sản phẩm không tồn tại" /></div>;

  const discount = product.discount || 0;
  const oldPrice = discount > 0 ? product.price / (1 - discount / 100) : 0;

  return (
    <div className="bg-background min-h-screen pt-6 pb-24 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-multiply"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none opacity-50 mix-blend-multiply"></div>

      {/* Premium Breadcrumb Overlay */}
      <div className="container mx-auto px-4 mb-8 relative z-10">
        <Breadcrumb separator="/" className="bg-white/40 backdrop-blur-md p-4 px-8 rounded-full border border-white/60 shadow-sm inline-flex items-center gap-2">
          <Breadcrumb.Item><Link to="/" className="hover:text-primary transition-colors text-text/60"><HomeOutlined className="mr-1" /> Trang chủ</Link></Breadcrumb.Item>
          <Breadcrumb.Item className="text-text/40 text-[10px] font-bold uppercase tracking-wider">{product.categoryId?.name}</Breadcrumb.Item>
          <Breadcrumb.Item className="font-serif text-primary">{product.name}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Product Showcase Card */}
        <div className="glass-panel p-8 md:p-12 rounded-[4rem] border border-white/60 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2 opacity-50"></div>
          
          <Row gutter={[64, 48]}>
            {/* Gallery Section - Redesigned */}
            <Col xs={24} lg={11}>
              <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* Thumbnails vertical (side gallery) */}
                <div className="hidden md:flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide shrink-0">
                  {product.images?.map((img: string, idx: number) => {
                    const fullUrl = img.startsWith('http') ? img : `${BASE_URL}${img}`;
                    return (
                      <div 
                        key={idx} 
                        className={`w-24 h-24 rounded-3xl border-2 overflow-hidden cursor-pointer transition-all duration-500 p-2 shrink-0 hover:scale-105 active:scale-95 ${mainImage === fullUrl ? 'border-primary shadow-lg bg-white' : 'border-white/40 opacity-40 hover:opacity-100 bg-white/20'}`}
                        onClick={() => setMainImage(fullUrl)}
                      >
                        <img src={fullUrl} className="w-full h-full object-contain rounded-2xl" alt={`thumb ${idx}`} />
                      </div>
                    );
                  })}
                </div>

                {/* Main Image Showcase */}
                <div className="flex-1">
                  <div className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-[3.5rem] overflow-hidden border border-white/60 group shadow-xl transition-all duration-700">
                    <Image
                      src={mainImage}
                      className="w-full h-full object-contain p-8 md:p-14 transition-transform duration-1000 group-hover:scale-110"
                      preview={{
                        mask: <div className="text-white flex flex-col items-center gap-3 font-black italic tracking-widest drop-shadow-lg"><EyeOutlined style={{ fontSize: 48 }} /> <span className="text-lg">KHÁM PHÁ CHI TIẾT</span></div>
                      }}
                    />
                    
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-8 right-8 animate-bounce">
                        <div className="bg-cta text-white px-6 py-2.5 rounded-full font-serif font-black text-xl shadow-2xl flex items-center gap-2">
                           <ThunderboltOutlined /> -{discount}%
                        </div>
                      </div>
                    )}

                    {/* Like Button */}
                    <div className="absolute bottom-8 right-8">
                       <Button shape="circle" icon={<HeartOutlined className="text-xl" />} className="h-16 w-16 bg-white/60 backdrop-blur-md border border-white/60 shadow-xl hover:text-cta transition-all hover:scale-110 flex items-center justify-center" />
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* Content & Action Section - Redesigned */}
            <Col xs={24} lg={13}>
              <div className="flex flex-col h-full space-y-8 py-2">
                <header>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full tracking-[0.2em] shadow-lg shadow-primary/20">PREMIUM SELECTION</span>
                    <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-4 py-1.5 rounded-full border border-secondary/20 tracking-[0.1em] flex items-center gap-1">
                       <CheckCircleOutlined /> CHÍNH HÃNG 100% 
                    </span>
                  </div>
                  <Title level={1} className="!text-3xl md:!text-5xl !font-serif !font-normal !mb-4 text-text tracking-tight leading-tight">
                    {product.name}
                  </Title>
                  <div className="flex items-center gap-6 bg-white/40 backdrop-blur-sm w-fit px-6 py-2.5 rounded-full border border-white/60">
                    <Rate disabled defaultValue={5} className="text-cta text-sm" />
                    <Divider type="vertical" className="bg-text/10 h-4" />
                    <Text className="text-text/60 text-xs font-light">4.9/5 • 2.5K Lượt xem • 800+ Đã bán</Text>
                  </div>
                </header>

                <div className="bg-primary/5 p-10 rounded-[3rem] border border-white/60 shadow-sm relative group transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 font-serif italic text-6xl tracking-tighter select-none">EXCLUSIVE</div>
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex flex-col">
                        <Title level={1} className="!m-0 !text-primary !font-serif !text-5xl tracking-tighter leading-none">
                          {product.price.toLocaleString('vi-VN')}₫
                        </Title>
                        {oldPrice > product.price && (
                          <Text delete className="text-text/30 text-xl font-light mt-2">
                            {Math.floor(oldPrice).toLocaleString('vi-VN')}₫
                          </Text>
                        )}
                    </div>
                    {discount > 0 && (
                        <div className="bg-white/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-white shadow-sm">
                           <Text className="block text-[10px] font-bold uppercase text-primary/60 tracking-wider mb-1">TIẾT KIỆM NGAY</Text>
                           <Text strong className="text-xl text-secondary font-serif">
                              -{Math.floor(oldPrice - product.price).toLocaleString('vi-VN')}₫
                           </Text>
                        </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                   {/* Quantity Selection Redesign */}
                   <div className="flex items-center gap-8">
                      <span className="text-xs font-bold text-text/40 uppercase tracking-widest shrink-0">SỐ LƯỢNG</span>
                      <div className="bg-white/40 backdrop-blur-sm p-1 rounded-full border border-white/60 inline-flex items-center gap-2 shadow-sm">
                         <Button 
                            type="text" 
                            shape="circle"
                            className="bg-white/80 text-text border-none shadow-sm h-10 w-10 flex items-center justify-center font-bold text-xl hover:bg-primary hover:text-white transition-all transition-colors active:scale-90"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                         >-</Button>
                         <InputNumber 
                            min={1} 
                            max={product.stock} 
                            value={quantity} 
                            onChange={(val) => setQuantity(val || 1)}
                            className="w-12 text-center border-none !bg-transparent font-bold text-xl flex items-center justify-center"
                            controls={false}
                         />
                         <Button 
                            type="text" 
                            shape="circle"
                            className="bg-white/80 text-text border-none shadow-sm h-10 w-10 flex items-center justify-center font-bold text-xl hover:bg-primary hover:text-white transition-all transition-colors active:scale-90"
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                         >+</Button>
                      </div>
                      <div className="flex flex-col">
                        <Text className="text-sm text-text font-bold leading-none">{product.stock}</Text>
                        <Text className="text-[10px] text-text/40 font-bold uppercase tracking-widest">CÓ SẴN</Text>
                      </div>
                   </div>

                   {/* Action Buttons Hub */}
                   <div className="flex flex-col sm:flex-row gap-6 pt-6">
                      <Button 
                        type="primary" 
                        size="large" 
                        icon={<ShoppingCartOutlined className="scale-110" />}
                        className="flex-[1.5] h-16 rounded-full bg-text hover:bg-primary font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2 border-none"
                        onClick={handleAddToCart}
                      >
                        Thêm vào giỏ hàng
                      </Button>
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<ThunderboltOutlined className="scale-110" />}
                        className="flex-1 h-16 rounded-full bg-cta hover:bg-cta/90 font-bold text-lg transition-all shadow-cta/20 shadow-xl flex items-center justify-center gap-2 border-none"
                        onClick={handleBuyNow}
                      >
                        Mua ngay
                      </Button>
                   </div>
                </div>

                 {/* Vertical Badges */}
                 <div className="pt-10 border-t border-text/5">
                    <Row gutter={[24, 24]}>
                       {[
                         { icon: <HistoryOutlined />, label: 'BẢO HÀNH TRỌN ĐỜI', desc: 'An tâm tuyệt đối', color: 'primary' },
                         { icon: <GlobalOutlined />, label: 'XUẤT XỨ CHÍNH HÃNG', desc: 'Nguồn hàng uy tín', color: 'secondary' },
                         { icon: <TruckOutlined />, label: 'GIAO FREE NHANH', desc: 'Nhanh như chớp', color: 'cta' }
                       ].map((item: any, idx: number) => (
                         <Col span={8} key={idx}>
                           <div className="flex flex-col items-center gap-3 p-4 group cursor-help text-center">
                              <div className={`w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all duration-500 group-hover:bg-primary group-hover:text-white border border-white/60`}>
                                {item.icon}
                              </div>
                              <div>
                                 <Text className="block text-[9px] font-bold tracking-widest text-text/80 uppercase mb-0.5">{item.label}</Text>
                                 <Text className="text-[10px] text-text/40 font-medium block">{item.desc}</Text>
                              </div>
                           </div>
                         </Col>
                       ))}
                    </Row>
                 </div>
               </div>
             </Col>
           </Row>
         </div>

        {/* Dynamic Multi-Section Tabs - Revamped */}
        <div className="mt-32">
          <Tabs 
            defaultActiveKey="1" 
            className="premium-tabs-system h-full"
            centered
            items={[
              {
                key: '1',
                label: <span className="text-base md:text-lg px-8 py-3 font-serif tracking-tight">CHI TIẾT SẢN PHẨM</span>,
                children: (
                  <div className="animate-slideUp pt-12">
                    <Row gutter={[64, 64]}>
                       <Col xs={24} lg={14}>
                          <div className="bg-white/40 backdrop-blur-md p-10 md:p-14 rounded-[3.5rem] shadow-xl border border-white/60 relative overflow-hidden h-full">
                             <div className="absolute top-0 right-0 p-12 opacity-[0.02] rotate-12 scale-150 text-primary"><GlobalOutlined style={{ fontSize: 400 }} /></div>
                             <Title level={2} className="!text-3xl !font-serif !mb-8 text-text tracking-tight border-b border-primary/20 pb-4">CÂU CHUYỆN SẢN PHẨM</Title>
                             <Paragraph className="text-text/70 text-lg leading-relaxed font-light">
                               {product.description || 'Sản phẩm này không chỉ là một món hàng công nghệ, mà là sự kết tinh của tư duy đột phá và kỹ nghệ chế tác thượng thừa.'}
                             </Paragraph>
                             
                             <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 glass-panel bg-primary/10 rounded-3xl shadow-sm flex flex-col gap-3 text-text border border-primary/20">
                                   <Title level={4} className="!text-primary !font-serif !mb-0 flex items-center gap-2"><ThunderboltOutlined className="text-xs" /> HIỆU NĂNG</Title>
                                   <Text className="text-text/60 text-sm font-light leading-relaxed">Xử lý mọi tác vụ trong nháy mắt với công nghệ chip tiên tiến nhất.</Text>
                                </div>
                                <div className="p-8 glass-panel bg-text/5 rounded-3xl shadow-sm flex flex-col gap-3 text-text border border-white/20">
                                   <Title level={4} className="!text-text !font-serif !mb-0 flex items-center gap-2"><SafetyCertificateOutlined className="text-xs" /> BỀN BỈ</Title>
                                   <Text className="text-text/60 text-sm font-light leading-relaxed">Chế tác từ vật liệu cao cấp, đảm bảo tuổi thọ lên đến hàng thập kỷ.</Text>
                                </div>
                             </div>
                          </div>
                       </Col>
                       <Col xs={24} lg={10}>
                          <div className="flex flex-col gap-8 h-full">
                             <div className="bg-white/40 backdrop-blur-md p-10 rounded-[3rem] shadow-xl border border-white/60 flex-1">
                                <Title level={4} className="!font-serif !mb-8 uppercase tracking-widest text-text/50"> THÔNG SỐ KỸ THUẬT</Title>
                                <div className="space-y-4">
                                   {[
                                      { l: 'THƯƠNG HIỆU', v: 'Modern Luxury' },
                                      { l: 'MÃ SẢN PHẨM', v: product.slug?.toUpperCase() || 'MOD-001' },
                                      { l: 'DANH MỤC', v: product.categoryId?.name },
                                      { l: 'CHẤT LIỆU', v: 'Hợp kim siêu bền' },
                                      { l: 'XUẤT XỨ', v: 'Chính hãng (Full Box)' }
                                   ].map((item, i) => (
                                      <div key={i} className="flex justify-between items-center py-3 border-b border-text/5 last:border-0 hover:translate-x-1 transition-transform">
                                         <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">{item.l}</Text>
                                         <span className="font-serif text-text text-base italic">{item.v}</span>
                                      </div>
                                   ))}
                                </div>
                             </div>
                             
                             <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10">
                                <Title level={4} className="!font-serif uppercase !text-primary !mb-4">Dịch vụ v.i.p</Title>
                                <ul className="space-y-3 font-light text-text list-none p-0 m-0">
                                   <li className="flex items-center gap-2">✨ Miễn phí bảo trì 5 năm</li>
                                   <li className="flex items-center gap-2">✈️ Giao tận tay người mua</li>
                                   <li className="flex items-center gap-2">💎 Quà tặng độc bản đi kèm</li>
                                </ul>
                             </div>
                          </div>
                       </Col>
                    </Row>
                  </div>
                ),
              },
              {
                 key: '2',
                 label: <span className="text-base md:text-lg px-8 py-3 font-serif tracking-tight transition-all duration-300">ĐÁNH GIÁ (99+)</span>,
                 children: (
                  <div className="animate-slideUp pt-12 flex flex-col items-center">
                    <Empty description={<Text className="text-xl font-serif text-text/20 uppercase tracking-tighter">Đang cập nhật những phản hồi từ khách hàng</Text>} />
                  </div>
                 )
              }
            ]}
          />
        </div>
      </div>

      {/* Extreme Sticky Bottom Hub (Mobile) */}
      <div className="fixed bottom-6 left-6 right-6 z-[100] md:hidden">
         <div className="bg-text/90 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-4 border border-white/20">
            <div className="flex flex-col pl-4">
               <Text className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">TỔNG CỘNG</Text>
               <span className="text-2xl text-white font-serif leading-none">{product.price?.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex gap-3">
                <Button 
                   shape="circle" 
                   icon={<ShoppingCartOutlined className="text-xl" />} 
                   className="h-16 w-16 bg-white/10 text-white border-none flex items-center justify-center hover:bg-primary transition-all active:scale-90"
                   onClick={handleAddToCart}
                />
                <Button 
                   type="primary" 
                   icon={<ThunderboltOutlined />}
                   className="h-16 px-10 rounded-3xl bg-primary font-bold uppercase border-none text-base shadow-xl shadow-primary/20 active:scale-95"
                   onClick={handleBuyNow}
                >
                  MUA
                </Button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProductDetail;
