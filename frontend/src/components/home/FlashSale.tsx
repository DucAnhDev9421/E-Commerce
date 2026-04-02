import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Progress, Button } from 'antd';
import { ThunderboltOutlined, RightOutlined } from '@ant-design/icons';
import ProductCard, { type Product } from './ProductCard';

const { Text } = Typography;

const FlashSale: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h, m, s };
  };

  const { h, m, s } = formatTime(timeLeft);

  const flashSaleProducts: Product[] = [
    { id: 101, name: 'iPhone 15 Pro Max 256GB - VN/A Titan Gray', price: 29500000, oldPrice: 34990000, discount: 15, rating: 5, reviews: 124, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=400', sold: 45, category: 'Điện thoại' },
    { id: 102, name: 'Sony WH-1000XM5 Noise Canceling Headphone', price: 6800000, oldPrice: 8900000, discount: 23, rating: 4.5, reviews: 88, image: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=400', sold: 68, category: 'Phụ kiện' },
    { id: 103, name: 'Apple Watch Series 9 GPS 41mm Midnight', price: 8200000, oldPrice: 10990000, discount: 25, rating: 4.8, reviews: 52, image: 'https://images.unsplash.com/photo-1434493907317-a46b53b81882?auto=format&fit=crop&q=80&w=400', sold: 12, category: 'Smartwatch' },
    { id: 104, name: 'Logitech G Pro X Superlight Wireless Mouse', price: 2800000, oldPrice: 3500000, discount: 20, rating: 4.9, reviews: 215, image: 'https://images.unsplash.com/photo-1615663248517-46388588ca78?auto=format&fit=crop&q=80&w=400', sold: 95, category: 'Gaming' },
  ];

  return (
    <div className="mt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-bold rounded-full text-lg shadow-lg">
            <ThunderboltOutlined className="animate-bounce" /> FLASH SALE
          </div>
          <div className="flex items-center gap-3">
             <Text className="text-gray-500 font-bold hidden sm:inline uppercase">Kết thúc sau:</Text>
             <div className="flex gap-2">
                {[h, m, s].map((val, i) => (
                  <div key={i} className="bg-gray-800 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-inner">
                    {val.toString().padStart(2, '0')}
                  </div>
                ))}
             </div>
          </div>
        </div>
        <Button 
          type="link" 
          className="p-0 h-auto text-blue-600 font-bold text-lg group flex items-center gap-2 hover:translate-x-2 transition-all"
        >
          XEM TẤT CẢ <RightOutlined className="text-xs" />
        </Button>
      </div>

      <Row gutter={[20, 20]}>
        {flashSaleProducts.map(product => (
          <Col xs={12} sm={8} lg={6} key={product.id}>
             <div className="relative h-full flex flex-col group">
                <ProductCard product={product} />
                <div className="px-4 pb-4 -mt-4 bg-white rounded-b-2xl shadow-sm z-10 border border-t-0 border-gray-100">
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <Text className="text-[11px] font-bold text-gray-500">ĐÃ BÁN {product.sold}</Text>
                            <Text className="text-[11px] font-bold text-red-500 uppercase">Sắp hết hàng</Text>
                        </div>
                        <Progress 
                            percent={(product.sold || 0) / ( (product.sold || 0) + 10) * 100} 
                            showInfo={false} 
                            strokeColor={{
                                '0%': '#ef4444',
                                '100%': '#f87171',
                            }}
                            className="m-0"
                            size="small"
                        />
                    </div>
                </div>
             </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FlashSale;
