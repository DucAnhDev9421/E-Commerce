import React from 'react';
import { Card, Tag, Rate, Button, Typography, notification } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, HeartOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart } from '../../store/cartSlice';

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
  stock?: number;
}

interface ProductCardProps {
  product: Product;
}

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      notification.info({
        message: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
      });
      navigate('/login');
      return;
    }
    
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      notification.success({ 
        title: 'Đã thêm vào giỏ hàng',
        description: `${product.name} đã được thêm thành công.`,
        placement: 'bottomRight',
        duration: 2,
      });
      navigate('/cart');
    } catch (error: any) {
      notification.error({ message: 'Lỗi', description: error || 'Không thể thêm sản phẩm' });
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      notification.info({
        message: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập để đặt sắm.',
      });
      navigate('/login');
      return;
    }

    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      navigate('/checkout');
    } catch (error: any) {
      notification.error({ message: 'Lỗi', description: error || 'Không thể đặt hàng' });
    }
  };

  const mainImage = product.images && product.images.length > 0 
    ? (product.images[0].startsWith('http') ? product.images[0] : `${BASE_URL}${product.images[0]}`)
    : 'https://via.placeholder.com/300';

  const discount = product.discount || 0;
  const oldPrice = discount > 0 ? product.price / (1 - discount / 100) : 0;
  const rating = product.rating || 5;
  const reviews = product.reviews || 0;
  const categoryName = product.categoryId?.name || 'Công nghệ';

  const isOutOfStock = product.status === 'out_of_stock' || (product.stock !== undefined && product.stock <= 0);

  return (
    <Card
      hoverable={!isOutOfStock}
      className={`group h-full border-0 shadow-sm transition-all duration-300 rounded-[2rem] overflow-hidden glass-card ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}
      styles={{ body: { padding: '20px' } }}
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
          
          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
               <div className="bg-white/90 px-6 py-2 rounded-full border-2 border-cta shadow-2xl scale-110">
                  <Text className="text-cta font-black tracking-widest uppercase text-sm">HẾT HÀNG</Text>
               </div>
            </div>
          )}

          {/* Overlay Actions */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-background/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <Button 
                shape="circle" 
                icon={<EyeOutlined />} 
                className="translate-y-10 group-hover:translate-y-0 transition-transform duration-300 bg-white/90 border-none hover:bg-primary hover:text-white flex items-center justify-center backdrop-blur-md"
              />
              <Button 
                shape="circle" 
                icon={<HeartOutlined />} 
                className="translate-y-10 group-hover:translate-y-0 transition-transform duration-310 delay-[50ms] bg-white/90 border-none hover:bg-cta hover:text-white flex items-center justify-center backdrop-blur-md"
              />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {discount > 0 && (
              <Tag className="m-0 bg-cta text-white font-bold border-none rounded-full px-3 py-1 shadow-md">
                -{discount}%
              </Tag>
            )}
            {(product.isNew || new Date(product as any).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) && (
              <Tag className="m-0 bg-secondary text-white font-bold border-none rounded-full px-3 py-1 shadow-md">
                MỚI
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
          className="!m-0 !text-sm lg:!text-[15px] !font-semibold line-clamp-2 min-h-[42px] group-hover:text-primary transition-colors leading-snug"
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
          <Text className="text-primary text-xl font-black">
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
            <span className={isOutOfStock ? 'text-cta font-black' : 'text-red-500'}>
               {isOutOfStock ? 'TẠM HẾT HÀNG' : ((product.sold || 0) > 10) ? 'SẮP HẾT HÀNG' : 'SỐ LƯỢNG CÓ HẠN'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isOutOfStock ? 'bg-gray-300' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
              style={{ width: isOutOfStock ? '100%' : `${Math.min(100, ((product.sold || 0) / ((product.sold || 0) + (product.stock || 20))) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons - Always Visible */}
        <div className="flex flex-col gap-2 pt-3">
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            size="large"
            className={`w-full h-12 font-bold border-none shadow-md rounded-full flex items-center justify-center transition-all ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : '!bg-primary hover:!bg-primary/90 text-white'}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'HẾT HÀNG' : 'THÊM GIỎ HÀNG'}
          </Button>
          <Button 
            type="default" 
            icon={<ShoppingOutlined className={isOutOfStock ? 'text-gray-400' : 'text-cta'} />}
            size="large"
            className={`w-full h-12 font-bold rounded-full flex items-center justify-center transition-all ${isOutOfStock ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed' : 'border-2 border-cta text-cta bg-white/50 backdrop-blur-sm'}`}
            onClick={handleBuyNow}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'LIÊN HỆ' : 'MUA NGAY'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
