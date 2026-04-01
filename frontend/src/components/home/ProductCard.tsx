import React from 'react';
import { Card, Tag, Rate, Button, Space, Typography } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

export interface Product {
  id: string | number;
  name: string;
  price: number;
  oldPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  sold?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  category?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      className="group h-full border-0 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-2xl overflow-hidden bg-white"
      styles={{ body: { padding: '16px' } }}
      cover={
        <div 
          className="relative overflow-hidden pt-[100%] cursor-pointer bg-gray-50"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {/* Main Image */}
          <img
            alt={product.name}
            src={product.image}
            className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] object-contain transition-transform duration-500 group-hover:scale-110"
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
            {product.discount > 0 && (
              <Tag className="m-0 bg-red-600 text-white font-bold border-none rounded-lg px-2.5 py-0.5 shadow-sm">
                -{product.discount}%
              </Tag>
            )}
            {product.isNew && (
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
          {product.category || 'Technology'}
        </Text>
        
        <Title 
          level={5} 
          className="!m-0 !text-sm lg:!text-[15px] !font-semibold line-clamp-2 min-h-[42px] group-hover:text-blue-600 transition-colors leading-snug"
        >
          {product.name}
        </Title>
        
        <div className="flex items-center gap-1.5">
          <Rate disabled defaultValue={product.rating} style={{ fontSize: '10px' }} className="text-yellow-400" />
          <Text className="text-gray-400 text-[11px]">({product.reviews})</Text>
          {product.sold && (
            <Text className="text-gray-400 text-[11px] ml-auto">Đã bán {product.sold}</Text>
          )}
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <Text className="text-red-500 text-lg font-bold">
            {product.price.toLocaleString('vi-VN')}₫
          </Text>
          {product.oldPrice > product.price && (
            <Text className="text-gray-400 text-xs line-through opacity-60">
              {product.oldPrice.toLocaleString('vi-VN')}₫
            </Text>
          )}
        </div>

        {/* Quick Add To Cart Button - Visible on Hover for Desktop */}
        <div className="pt-2">
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            size="large"
            className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-bold border-none shadow-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            THÊM GIỎ HÀNG
          </Button>
          {/* Mobile version always visible */}
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            className="w-full bg-blue-600 h-9 font-bold border-none rounded-xl md:hidden flex items-center justify-center mt-2"
          >
            MUA
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
