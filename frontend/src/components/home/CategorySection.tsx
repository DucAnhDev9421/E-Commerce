import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Spin, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import categoryApi from '../../api/categoryApi';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

const { Title, Text } = Typography;

const CategorySection: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res: any = await categoryApi.getAll();
        setCategories(res.filter((c: any) => c.status === 'active' && !c.isDeleted));
      } catch (error) {
        console.error("Fetch categories error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const placeholderImages = [
    'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1434493907317-a46b53b81882?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1615663248517-46388588ca78?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=300'
  ];

  if (loading) {
    return <div className="mt-20 text-center"><Spin size="large" tip="Đang tải danh mục..." /></div>;
  }

  if (categories.length === 0) {
    return <div className="mt-20"><Empty description="Chưa có danh mục nào" /></div>;
  }

  return (
    <div className="mt-24 relative">
      <div className="text-center mb-16 relative z-10">
        <Title level={2} className="!m-0 tracking-tight !font-serif !text-3xl md:!text-5xl text-text drop-shadow-sm">
          DANH MỤC NỔI BẬT
        </Title>
        <div className="w-16 h-1 bg-primary mx-auto mt-6 rounded-full opacity-70"></div>
        <Text className="block mt-6 text-text/70 font-light text-base md:text-lg max-w-2xl mx-auto">
          Lựa chọn những bộ sưu tập chất lượng nhất được tuyển chọn tinh tế.
        </Text>
      </div>

      <Row gutter={[24, 24]} className="relative z-10">
        {categories.map((cat, idx) => (
          <Col xs={12} sm={8} lg={4} key={cat._id}>
            <div 
              className="flex flex-col items-center group cursor-pointer transition-all duration-300 transform hover:-translate-y-2 h-full"
              onClick={() => navigate(`/?category=${cat._id}`)}
            >
              <div 
                className="w-full aspect-square rounded-full p-6 flex flex-col items-center justify-center relative overflow-hidden glass-card"
              >
                <img 
                  src={cat.image ? getImageUrl(cat.image) : placeholderImages[idx % placeholderImages.length]} 
                  alt={cat.name} 
                  className="w-full h-full object-contain mix-blend-multiply opacity-90 drop-shadow-xl transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-125 group-hover:opacity-100 pointer-events-none"
                />
              </div>
              <div className="text-center mt-6">
                <Text strong className="text-sm md:text-base block group-hover:text-primary transition-all font-bold uppercase tracking-wide text-text px-2">
                  {cat.name}
                </Text>
                <Text className="text-[11px] md:text-xs text-text/50 font-medium">
                  {Math.floor(Math.random() * 50) + 10} sản phẩm
                </Text>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CategorySection;
