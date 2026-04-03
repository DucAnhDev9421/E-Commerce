import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Progress, Button, Spin, Empty } from 'antd';
import { ThunderboltOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import productApi from '../../api/productApi';

const { Text } = Typography;

const FlashSale: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res: any = await productApi.getAll();
        // Backend returns { items, page, ... }
        const saleProducts = (res.items || [])
          .sort((a: any, b: any) => (b.discount || 0) - (a.discount || 0))
          .slice(0, 4);
        setProducts(saleProducts);
      } catch (error) {
        console.error("Fetch flash sale error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h, m, s };
  };

  const { h, m, s } = formatTime(timeLeft);

  if (loading) {
    return <div className="mt-20 text-center"><Spin size="large" description="Đang tải Flash Sale..." /></div>;
  }

  if (products.length === 0) {
    return null; // Don't show anything if no products
  }

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
          onClick={() => navigate('/?view=all')}
          className="p-0 h-auto text-blue-600 font-bold text-lg group flex items-center gap-2 hover:translate-x-2 transition-all"
        >
          XEM TẤT CẢ <RightOutlined className="text-xs" />
        </Button>
      </div>

      <Row gutter={[20, 20]}>
        {products.map(product => {
          const sold = Math.floor(Math.random() * 100) + 10;
          return (
            <Col xs={12} sm={8} lg={6} key={product._id}>
               <div className="relative h-full flex flex-col group">
                  <ProductCard product={product} />
                  <div className="px-4 pb-4 -mt-4 bg-white rounded-b-2xl shadow-sm z-10 border border-t-0 border-gray-100">
                      <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                              <Text className="text-[11px] font-bold text-gray-500">ĐÃ BÁN {sold}</Text>
                              <Text className="text-[11px] font-bold text-red-500 uppercase">Sắp hết hàng</Text>
                          </div>
                          <Progress 
                              percent={Math.min(95, (sold / (sold + 15)) * 100)} 
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
          );
        })}
      </Row>
    </div>
  );
};

export default FlashSale;
