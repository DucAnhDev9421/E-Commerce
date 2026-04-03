import React from 'react';
import { Carousel, Button, Typography, Space } from 'antd';
import { RightOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HeroBanner: React.FC = () => {
  const banners = [
    {
      id: 1,
      title: 'LUXURY ESSENTIALS',
      subtitle: 'Khám phá bộ sưu tập tinh tế với ánh nhìn trong trẻo, mang lại trải nghiệm hoàn mỹ nhất.',
      tagline: 'PREMIUM COLLECTION',
      image: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=1400',
      cta: 'KHÁM PHÁ',
      bgColor: 'bg-primary'
    },
    {
      id: 2,
      title: 'THE MODERN AURA',
      subtitle: 'Ánh sáng và không gian hội tụ tạo nên một phong cách thanh lịch và đương đại.',
      tagline: 'NEW ARRIVALS',
      image: 'https://images.unsplash.com/photo-1512496015851-a1c8ce950df6?auto=format&fit=crop&q=80&w=1400',
      cta: 'MUA NGAY',
      bgColor: 'bg-cta'
    },
  ];

  return (
    <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl mt-8 border border-white/40">
      <Carousel 
        autoplay 
        effect="fade" 
        draggable
        className="hero-carousel"
        dots={{ className: 'hero-dots' }}
      >
        {banners.map((item) => (
          <div key={item.id} className="relative h-[400px] md:h-[600px] outline-none">
            {/* Background Image with Glass Overlay */}
            <div className="absolute inset-0 z-0">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-10000 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex items-center px-8 md:px-24">
              <div className="max-w-xl animate-fadeIn glass-panel p-8 md:p-12 rounded-[2rem] shadow-xl">
                <Space 
                  className="mb-4 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/60"
                >
                  <Text className="text-text text-xs md:text-sm font-bold tracking-[0.2em]">
                    {item.tagline}
                  </Text>
                </Space>
                
                <Title 
                  className="!text-text !text-4xl md:!text-6xl !font-serif !mb-4 !leading-tight tracking-tight scale-up-center"
                >
                  {item.title}
                </Title>
                
                <Paragraph className="!text-text/80 text-sm md:text-lg !mb-8 font-light md:leading-relaxed max-w-md">
                  {item.subtitle}
                </Paragraph>
                
                <div className="flex items-center gap-4">
                  <Button 
                    type="primary" 
                    size="large" 
                    className={`h-14 px-10 rounded-full font-bold text-lg border-none hover:scale-105 transition-all shadow-lg flex items-center gap-2 ${item.bgColor} !text-white`}
                  >
                    {item.cta} <ArrowRightOutlined />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* Decorative Glass Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay"></div>
    </div>
  );
};

export default HeroBanner;
