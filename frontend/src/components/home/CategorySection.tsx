import React from 'react';
import { Typography, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const CategorySection: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    { 
      name: 'iPhone 15 Series', 
      image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=300', 
      color: 'bg-[#f0f9ff]',
      hoverColor: 'hover:bg-blue-600',
      count: '150+ Sản phẩm'
    },
    { 
      name: 'Laptops & Office', 
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=300', 
      color: 'bg-[#fdf2f8]',
      hoverColor: 'hover:bg-pink-600',
      count: '80+ Sản phẩm'
    },
    { 
      name: 'Smart Watches', 
      image: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882?auto=format&fit=crop&q=80&w=300', 
      color: 'bg-[#ecfdf5]',
      hoverColor: 'hover:bg-green-600',
      count: '40+ Sản phẩm'
    },
    { 
      name: 'Audio & Music', 
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300', 
      color: 'bg-[#fff7ed]',
      hoverColor: 'hover:bg-orange-600',
      count: '120+ Sản phẩm'
    },
     { 
      name: 'Gaming Gear', 
      image: 'https://images.unsplash.com/photo-1615663248517-46388588ca78?auto=format&fit=crop&q=80&w=300', 
      color: 'bg-[#f5f3ff]',
      hoverColor: 'hover:bg-purple-600',
      count: '60+ Sản phẩm'
    },
     { 
      name: 'Photography', 
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=300', 
      color: 'bg-[#fefce8]',
      hoverColor: 'hover:bg-yellow-600',
      count: '30+ Sản phẩm'
    }
  ];

  return (
    <div className="mt-24">
      <div className="text-center mb-16">
        <Title level={2} className="!m-0 tracking-tight !font-extrabold !text-3xl md:!text-4xl text-gray-900">
          KHÁM PHÁ DANH MỤC
        </Title>
        <div className="w-16 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        <Text type="secondary" className="block mt-4 text-base md:text-lg max-w-2xl mx-auto">
          Tất cả những thiết bị bạn cần để nâng tầm trải nghiệm cuộc sống hiện đại và năng động.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {categories.map((cat, idx) => (
          <Col xs={12} sm={8} lg={4} key={idx}>
            <div 
              className="flex flex-col items-center group cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
              onClick={() => navigate('/products')}
            >
              <div 
                className={`${cat.color} w-full aspect-square rounded-[2rem] p-8 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:rounded-[3rem] shadow-sm border border-transparent group-hover:border-blue-100 group-hover:shadow-xl`}
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-contain drop-shadow-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-125 pointer-events-none"
                />
              </div>
              <div className="text-center mt-6">
                <Text strong className="text-sm md:text-base block group-hover:text-blue-600 transition-all font-bold uppercase tracking-wide px-2">
                  {cat.name}
                </Text>
                <Text className="text-[11px] md:text-xs text-gray-400 font-bold opacity-60">
                    {cat.count}
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
