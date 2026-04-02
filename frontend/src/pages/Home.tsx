import React from 'react';
import HeroBanner from '../components/home/HeroBanner';
import TrustBadges from '../components/home/TrustBadges';
import FlashSale from '../components/home/FlashSale';
import CategorySection from '../components/home/CategorySection';
import BestSellers from '../components/home/BestSellers';
import CustomerReviews from '../components/home/CustomerReviews';
import { Typography, Button, Input } from 'antd';
import { SendOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Home: React.FC = () => {
  return (
    <div className="bg-[#fcfdfe] min-h-screen">
      {/* Container shared for all sections */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        
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

        {/* 7. Newsletter - Re-designed */}
        <section className="mt-40 mb-20 relative overflow-hidden rounded-[4rem] group shadow-2xl animate-slideUp delay-[600ms]">
           <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 px-12 py-24 md:py-32 flex flex-col items-center justify-center text-center relative z-10 transition-all duration-700 group-hover:scale-105">
              <div className="max-w-4xl relative z-20">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-12 shadow-2xl scale-125 border border-white/20">
                    <MailOutlined className="text-white text-5xl animate-pulse" />
                </div>
                
                <Title level={1} className="!text-white !font-black !text-4xl md:!text-6xl !mb-8 tracking-tighter uppercase leading-tight drop-shadow-lg">
                  NHẬN NGAY ƯU ĐÃI <span className="text-yellow-300">80%</span> <br/> CHO ĐIƠN HÀNG ĐẦU TIÊN
                </Title>
                
                <Text className="text-blue-100 block text-lg md:text-2xl mb-16 font-medium max-w-3xl mx-auto opacity-80 border-l-2 border-white/30 pl-8 text-left italic">
                  Đăng ký email của bạn ngay bây giờ để nhận bản tin khuyến mãi giới hạn, bí quyết công nghệ và những bộ sưu tập xu hướng nhất từ Modern Shop.
                </Text>
                
                <div className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto items-stretch md:items-center">
                  <div className="flex-1 relative group-focus-within:scale-105 transition-transform duration-300">
                     <Input 
                        placeholder="Nhập địa chỉ email của bạn..." 
                        prefix={<MailOutlined className="text-blue-400 mr-2" />}
                        className="h-16 rounded-3xl border-none text-xl px-8 shadow-2xl w-full !bg-white/95 backdrop-blur-md focus:!bg-white"
                      />
                  </div>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<SendOutlined className="scale-125 -rotate-45" />}
                    className="h-16 px-12 rounded-3xl bg-blue-900 border-none text-white font-black text-xl hover:bg-black hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center gap-3 uppercase tracking-wider"
                  >
                    ĐĂNG KÝ NGAY
                  </Button>
                </div>
                <Text className="text-white/40 block text-sm mt-8 font-bold uppercase tracking-widest">
                  Cam kết bảo mật thông tin 100% • Hủy đăng ký bất cứ lúc nào
                </Text>
              </div>
           </div>
           
           {/* Dynamic Background Effects */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-400/30 rounded-full blur-[120px] animate-blob pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-400/20 rounded-full blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>
           <div className="absolute -inset-1 border border-white/10 rounded-[4rem] pointer-events-none"></div>
        </section>

      </div>
    </div>
  );
};

export default Home;
