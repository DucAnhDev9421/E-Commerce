import React from 'react';
import { Carousel, Button, Typography, Space } from 'antd';
import { RightOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HeroBanner: React.FC = () => {
  const banners = [
    {
      id: 1,
      title: 'FUTURE TECH 2026',
      subtitle: 'Trải nghiệm đỉnh cao công nghệ cùng thế hệ iPhone mới nhất.',
      tagline: 'SIÊU SALE ĐIỆN TỬ',
      image: 'https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?auto=format&fit=crop&q=80&w=1400',
      cta: 'MUA NGAY',
      color: '#2563eb',
      bgColor: 'bg-blue-600'
    },
    {
      id: 2,
      title: 'LUXURY FASHION',
      subtitle: 'Bộ sưu tập thời trang Thu-Đông phong cách Minimalism.',
      tagline: 'PREMIUM COLLECTION',
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1400',
      cta: 'KHÁM PHÁ',
      color: '#ea580c',
      bgColor: 'bg-orange-600'
    },
  ];

  return (
    <div className="relative group overflow-hidden rounded-[2rem] shadow-2xl mt-8">
      <Carousel 
        autoplay 
        effect="fade" 
        draggable
        className="hero-carousel"
        dots={{ className: 'hero-dots' }}
      >
        {banners.map((item) => (
          <div key={item.id} className="relative h-[250px] md:h-[520px] outline-none">
            {/* Background Image with Layer Mask */}
            <div className="absolute inset-0 z-0">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex items-center px-10 md:px-24">
              <div className="max-w-xl animate-fadeIn">
                <Space 
                  className="mb-4 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20"
                >
                  <Text className="text-white text-xs md:text-sm font-bold tracking-[0.2em]">
                    {item.tagline}
                  </Text>
                </Space>
                
                <Title 
                  className="!text-white !text-3xl md:!text-6xl !font-extrabold !mb-4 !leading-tight tracking-tight scale-up-center"
                >
                  {item.title}
                </Title>
                
                <Paragraph className="!text-gray-200 text-sm md:text-xl !mb-10 font-medium md:leading-relaxed max-w-md opacity-90">
                  {item.subtitle}
                </Paragraph>
                
                <div className="flex items-center gap-4">
                  <Button 
                    type="primary" 
                    size="large" 
                    className={`h-14 px-10 rounded-full font-bold text-lg border-none hover:scale-105 transition-all shadow-lg flex items-center gap-2 ${item.bgColor}`}
                  >
                    {item.cta} <ArrowRightOutlined />
                  </Button>
                  <Button 
                    ghost 
                    size="large" 
                    className="h-14 px-10 rounded-full border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-black transition-all transition-colors"
                  >
                    XEM CHI TIẾT
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
};

export default HeroBanner;
