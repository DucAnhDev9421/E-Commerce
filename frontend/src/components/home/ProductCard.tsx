import React from 'react';
import { Card, Tag, Rate, Button, Typography, notification } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, HeartOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/cartSlice';

const { Text, Title } = Typography;

export interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  qty?: number; // for cart
  images?: string[];
  categoryId?: {
    _id: string;
    name: string;
  };
  status?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating?: number;
  reviews?: number;
  sold?: number;
}

interface ProductCardProps {
  product: Product;
}

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addItem(product));
    notification.success({
      message: 'Đã thêm vào giỏ hàng',
      description: `${product.name} đã được thêm vào giỏ hàng của bạn.`,
      placement: 'bottomRight',
      duration: 2,
    });
    // Chuyển hướng tới giỏ hàng theo yêu cầu
    navigate('/cart');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addItem(product));
    // Chuyển hướng thẳng tới thanh toán
    navigate('/checkout');
  };

  const mainImage = product.images && product.images.length > 0 
    ? (product.images[0].startsWith('http') ? product.images[0] : `${BASE_URL}${product.images[0]}`)
    : 'https://via.placeholder.com/300';

  const discount = product.discount || 0;
  const oldPrice = discount > 0 ? product.price / (1 - discount / 100) : 0;
  const rating = product.rating || 5;
  const reviews = product.reviews || 0;
  const categoryName = product.categoryId?.name || 'Công nghệ';

  return (
    <Card
      hoverable
      className="group h-full border-0 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl overflow-hidden bg-white"
      styles={{ body: { padding: '16px' } }}
      cover={
        <div 
          className="relative overflow-hidden pt-[100%] cursor-pointer bg-gray-50"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {/* Main Image */}
          <img
            alt={product.name}
            src={mainImage}
            className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] object-contain transition-transform duration-500 group-hover:scale-110"
            onError={(e: any) => {
              e.target.src = 'https://via.placeholder.com/300';
            }}
          />
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button 
              shape="circle" 
              icon={<EyeOutlined />} 
              className="translate-y-10 group-hover:translate-y-0 transition-transform duration-300 bg-white/90 border-none hover:bg-blue-600 hover:text-white flex items-center justify-center"
            />
            <Button 
              shape="circle" 
              icon={<HeartOutlined />} 
              className="translate-y-10 group-hover:translate-y-0 transition-transform duration-310 delay-[50ms] bg-white/90 border-none hover:bg-red-500 hover:text-white flex items-center justify-center"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Tag className="m-0 bg-red-600 text-white font-bold border-none rounded-lg px-2.5 py-0.5 shadow-sm">
                -{discount}%
              </Tag>
            )}
            {(product.isNew || new Date(product as any).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) && (
              <Tag className="m-0 bg-blue-600 text-white font-bold border-none rounded-lg px-2.5 py-0.5 shadow-sm">
                NEW
              </Tag>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full space-y-1.5">
        <Text 
          className="text-gray-400 text-[10px] uppercase font-bold tracking-widest"
        >
          {categoryName}
        </Text>
        
        <Title 
          level={5} 
          className="!m-0 !text-sm lg:!text-[15px] !font-semibold line-clamp-2 min-h-[42px] group-hover:text-blue-600 transition-colors leading-snug"
        >
          {product.name}
        </Title>
        
        <div className="flex items-center gap-1.5">
          <Rate disabled defaultValue={rating} style={{ fontSize: '10px' }} className="text-yellow-400" />
          <Text className="text-gray-400 text-[11px]">({reviews})</Text>
          {product.sold && (
            <Text className="text-gray-400 text-[11px] ml-auto">Đã bán {product.sold}</Text>
          )}
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <Text className="text-blue-600 text-lg font-black">
            {product.price.toLocaleString('vi-VN')}₫
          </Text>
          {oldPrice > product.price && (
            <Text className="text-gray-400 text-sm line-through opacity-60">
              {Math.round(oldPrice).toLocaleString('vi-VN')}₫
            </Text>
          )}
        </div>

        {/* Sales Progress Bar */}
        <div className="pt-3 pb-1">
          <div className="flex justify-between text-[11px] font-bold mb-1.5 uppercase tracking-tighter">
            <span className="text-gray-900">ĐÃ BÁN {product.sold || 0}</span>
            <span className="text-red-500">{((product.sold || 0) > 10) ? 'SẮP HẾT HÀNG' : 'SỐ LƯỢNG CÓ HẠN'}</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, ((product.sold || 0) / 20) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons - Always Visible */}
        <div className="flex flex-col gap-2 pt-3">
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            size="large"
            className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-bold border-none shadow-sm rounded-xl flex items-center justify-center transition-all hover:scale-102 active:scale-95"
            onClick={handleAddToCart}
          >
            THÊM GIỎ HÀNG
          </Button>
          <Button 
            type="default" 
            icon={<ShoppingOutlined style={{ color: '#2563eb' }} />}
            size="large"
            className="w-full border-2 border-blue-600 text-blue-600 h-10 font-bold rounded-xl flex items-center justify-center hover:bg-blue-50 transition-all"
            onClick={handleBuyNow}
          >
            MUA NGAY
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
