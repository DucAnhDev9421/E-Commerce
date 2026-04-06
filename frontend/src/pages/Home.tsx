import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import TrustBadges from '../components/home/TrustBadges';
import FlashSale from '../components/home/FlashSale';
import CategorySection from '../components/home/CategorySection';
import BestSellers from '../components/home/BestSellers';
import CustomerReviews from '../components/home/CustomerReviews';
import { Typography, Button, Input, Row, Col, Card, Spin, Empty, Breadcrumb } from 'antd';
import { SendOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { useSearchParams, Link } from 'react-router-dom';
import productApi from '../api/productApi';

const { Title, Text } = Typography;

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const viewParam = searchParams.get('view');
  const categoryParam = searchParams.get('category');
  const isListView = Boolean(searchQuery || viewParam === 'all' || categoryParam);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isListView) {
      const fetchSearchResults = async () => {
        setLoading(true);
        try {
          const params: any = {};
          if (searchQuery) params.search = searchQuery;
          if (categoryParam) params.categoryId = categoryParam;
          
          const res: any = await productApi.getAll(params);
          setProducts(res);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSearchResults();
    }
  }, [isListView, searchQuery, categoryParam]);

  if (isListView) {
    let titleText = "TẤT CẢ SẢN PHẨM";
    if (searchQuery) titleText = `KẾT QUẢ TÌM KIẾM CHO: "${searchQuery}"`;
    else if (categoryParam) titleText = "SẢN PHẨM THEO DANH MỤC";

    return (
      <div className="bg-[#fcfdfe] min-h-screen py-10 px-4 md:px-10">
        <div className="container mx-auto">
          <Breadcrumb className="mb-6">
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{searchQuery ? `Tìm kiếm: "${searchQuery}"` : categoryParam ? 'Danh mục' : 'Tất cả sản phẩm'}</Breadcrumb.Item>
          </Breadcrumb>

          <Title level={2} className="mb-8 font-black uppercase text-blue-900 border-l-4 border-blue-600 pl-4">
            {titleText}
          </Title>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" tip="Đang tìm kiếm sản phẩm..." />
            </div>
          ) : products.length > 0 ? (
            <Row gutter={[24, 24]}>
              {products.map((product) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                  <Link to={`/product/${product._id}`}>
                    <Card
                      hoverable
                      cover={
                        <img 
                          alt={product.name} 
                          src={product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${product.images[0]}`) : 'https://via.placeholder.com/300'} 
                          className="h-64 object-cover"
                        />
                      }
                      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                    >
                      <Card.Meta 
                        title={<span className="text-lg font-bold text-gray-800">{product.name}</span>} 
                        description={
                          <div className="mt-2">
                            <Text type="secondary" className="block mb-2 line-clamp-1">{product.categoryId?.name}</Text>
                            <Text className="text-blue-600 font-extrabold text-xl">
                              {product.price?.toLocaleString()} đ
                            </Text>
                          </div>
                        } 
                      />
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={
                <div className="text-center py-20">
                  <Text className="text-xl text-gray-500">Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp.</Text>
                  <p className="mt-4"><Link to="/"><Button type="primary" shape="round">Quay lại Trang chủ</Button></Link></p>
                </div>
              }
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Background Orbs for Liquid Glass */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-blob pointer-events-none z-0"></div>
      <div className="fixed top-[40%] left-[-10%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] animate-blob animation-delay-2000 pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[10%] w-[450px] h-[450px] bg-cta/10 rounded-full blur-[90px] animate-blob animation-delay-4000 pointer-events-none z-0"></div>

      {/* Container shared for all sections */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 pt-6">
        
        {/* 1. Hero Banner */}
        <section className="animate-slideUp">
          <HeroBanner />
        </section>

        {/* 2. Trust Badges */}
        <section className="animate-slideUp delay-[100ms]">
          <TrustBadges />
        </section>

        {/* 3. Flash Sale */}
        <section className="animate-slideUp delay-[200ms]">
          <FlashSale />
        </section>

        {/* 4. Category Grid */}
        <section className="animate-slideUp delay-[300ms]">
          <CategorySection />
        </section>

        {/* 5. Best Sellers / Tabs */}
        <section className="animate-slideUp delay-[400ms]">
          <BestSellers />
        </section>

        {/* 6. Customer Reviews */}
        <section className="animate-slideUp delay-[500ms]">
          <CustomerReviews />
        </section>

        {/* 7. Newsletter - Re-designed to Liquid Glass */}
        <section className="mt-40 mb-20 relative overflow-hidden rounded-[3rem] group animate-slideUp delay-[600ms]">
           <div className="bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/80 backdrop-blur-3xl px-12 py-24 md:py-32 flex flex-col items-center justify-center text-center relative z-10 transition-all duration-700 group-hover:scale-[1.02] border border-white/20 glass-card">
              <div className="max-w-4xl relative z-20">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-12 shadow-2xl scale-125 border border-white/30">
                    <MailOutlined className="text-white text-5xl animate-pulse" />
                </div>
                
                <Title level={1} className="!text-white !font-serif !text-4xl md:!text-6xl !mb-8 tracking-wide uppercase leading-tight drop-shadow-lg">
                  NHẬN NGAY ƯU ĐÃI <span className="text-cta">80%</span> <br/> CHO ĐƠN HÀNG ĐẦU TIÊN
                </Title>
                
                <Text className="text-white block text-lg md:text-2xl mb-16 font-light max-w-3xl mx-auto opacity-90 border-l-2 border-white/30 pl-8 text-left italic">
                  Đăng ký email của bạn ngay bây giờ để nhận bản tin khuyến mãi giới hạn, bí quyết mua sắm và những bộ sưu tập sang trọng nhất từ Modern Shop.
                </Text>
                
                <div className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto items-stretch md:items-center">
                  <div className="flex-1 relative group-focus-within:scale-105 transition-transform duration-300">
                     <Input 
                        placeholder="Nhập địa chỉ email của bạn..." 
                        prefix={<MailOutlined className="text-primary mr-2" />}
                        className="h-16 rounded-full border-none text-xl px-8 shadow-2xl w-full !bg-white/80 backdrop-blur-md focus:!bg-white outline-none"
                      />
                  </div>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<SendOutlined className="scale-125 md:-rotate-45" />}
                    className="h-16 px-12 rounded-full !bg-cta hover:!bg-cta/90 border-none text-white font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3 uppercase tracking-wider"
                  >
                    ĐĂNG KÝ NGAY
                  </Button>
                </div>
                <Text className="text-white/60 block text-sm mt-8 font-medium uppercase tracking-widest">
                  Cam kết bảo mật thông tin 100% • Hủy đăng ký bất cứ lúc nào
                </Text>
              </div>
           </div>
           
           {/* Dynamic Background Effects for Newsletter */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cta/30 rounded-full blur-[120px] animate-blob pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>
           <div className="absolute -inset-1 border border-white/20 rounded-[3rem] pointer-events-none"></div>
        </section>

      </div>
    </div>
  );
};

export default Home;
