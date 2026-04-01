import React from 'react';
import { Tabs, Row, Col, Typography, Button } from 'antd';
import { RiseOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import ProductCard, { type Product } from './ProductCard';

const { Title, Text } = Typography;

const BestSellers: React.FC = () => {
    const products: Record<string, Product[]> = {
        trending: [
            { id: 201, name: 'iPad Air 5 M1 Wi-Fi 64GB - Chính hãng Apple', price: 14500000, oldPrice: 15990000, discount: 10, rating: 5, reviews: 312, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400', isBestSeller: true, sold: 1200, category: 'Máy tính bảng' },
            { id: 202, name: 'Bàn phím cơ không dây AKKO 3068B Multi-mode', price: 1850000, oldPrice: 2250000, discount: 18, rating: 4.8, reviews: 215, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=400', isBestSeller: true, sold: 850, category: 'Phụ kiện' },
            { id: 203, name: 'Chuột Logitech MX Master 3S For Mac', price: 2350000, oldPrice: 2850000, discount: 17, rating: 5, reviews: 450, image: 'https://images.unsplash.com/photo-1527814732934-94a195507575?auto=format&fit=crop&q=80&w=400', isBestSeller: true, sold: 620, category: 'Phụ kiện' },
            { id: 204, name: 'Loa Marshall Emberton II Chính hãng', price: 3450000, oldPrice: 3990000, discount: 13, rating: 4.9, reviews: 180, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=400', isBestSeller: true, sold: 410, category: 'Âm thanh' },
        ],
        fashion: [
             { id: 301, name: 'Áo Hoodie Essentials Fear of God - Grey', price: 2450000, oldPrice: 2990000, discount: 18, rating: 5, reviews: 85, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400', isBestSeller: true, sold: 250, category: 'Thời trang' },
             { id: 302, name: 'Giày Nike Air Jordan 1 Low "Panda"', price: 3850000, oldPrice: 4500000, discount: 14, rating: 4.9, reviews: 142, image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=400', isBestSeller: true, sold: 560, category: 'Giày dép' },
             { id: 303, name: 'Quần Jeans Levi\'s 501 Original Fit', price: 1850000, oldPrice: 2200000, discount: 16, rating: 4.7, reviews: 96, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400', isBestSeller: true, sold: 342, category: 'Thời trang' },
             { id: 304, name: 'Đồng hồ Casio G-Shock GA-2100-1A1DR', price: 2950000, oldPrice: 3400000, discount: 13, rating: 5, reviews: 220, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400', isBestSeller: true, sold: 185, category: 'Phụ kiện' },
        ],
        new: [
             { id: 401, name: 'MacBook Pro 14 inch M3 Pro Space Black', price: 49500000, oldPrice: 54990000, discount: 10, rating: 5, reviews: 45, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400', isNew: true, sold: 24, category: 'Laptop' },
             { id: 402, name: 'Sony PlayStation 5 Slim Standard Edition', price: 12500000, oldPrice: 14990000, discount: 16, rating: 4.9, reviews: 68, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=400', isNew: true, sold: 156, category: 'Gaming' },
             { id: 403, name: 'Samsung Galaxy Ring - Đen Nhám', price: 9500000, oldPrice: 10990000, discount: 13, rating: 4.8, reviews: 15, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400', isNew: true, sold: 12, category: 'Smartwatch' },
             { id: 404, name: 'DJI Osmo Pocket 3 Creator Combo', price: 15800000, oldPrice: 17500000, discount: 10, rating: 5, reviews: 34, image: 'https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?auto=format&fit=crop&q=80&w=400', isNew: true, sold: 48, category: 'Camera' },
        ]
    };

    const tabItems = [
        {
            key: 'trending',
            label: (
                <span className="flex items-center gap-2 px-6 py-2">
                    <FireOutlined /> PHỔ BIẾN
                </span>
            ),
            children: (
                <Row gutter={[20, 20]} className="mt-8">
                    {products.trending.map(p => (
                        <Col xs={12} sm={8} lg={6} key={p.id}>
                            <ProductCard product={p} />
                        </Col>
                    ))}
                </Row>
            )
        },
        {
            key: 'fashion',
             label: (
                <span className="flex items-center gap-2 px-6 py-2">
                    <StarOutlined /> THỜI TRANG
                </span>
            ),
            children: (
                <Row gutter={[20, 20]} className="mt-8">
                    {products.fashion.map(p => (
                        <Col xs={12} sm={8} lg={6} key={p.id}>
                            <ProductCard product={p} />
                        </Col>
                    ))}
                </Row>
            )
        },
        {
            key: 'new',
             label: (
                <span className="flex items-center gap-2 px-6 py-2">
                    <RiseOutlined /> HÀNG MỚI VỀ
                </span>
            ),
            children: (
                <Row gutter={[20, 20]} className="mt-8">
                    {products.new.map(p => (
                        <Col xs={12} sm={8} lg={6} key={p.id}>
                            <ProductCard product={p} />
                        </Col>
                    ))}
                </Row>
            )
        }
    ];

    return (
        <div className="mt-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-gray-100 pb-8">
                 <div className="max-w-2xl">
                    <Title level={2} className="!m-0 !font-extrabold !text-3xl md:!text-4xl">
                        SẢN PHẨM KHÔNG THỂ BỎ LỠ
                    </Title>
                    <Text type="secondary" className="block mt-4 text-base md:text-lg">
                        Tuyển tập những siêu phẩm bán chạy nhất, được cộng đồng săn đón và hàng mới cập bến mỗi tuần.
                    </Text>
                 </div>
                 <Button 
                    type="primary" 
                    size="large" 
                    className="h-12 px-8 rounded-full font-bold bg-black text-white hover:bg-gray-800 hidden md:flex items-center justify-center border-none mt-6 md:mt-0"
                >
                    XEM TOÀN BỘ CỬA HÀNG
                </Button>
            </div>

            <Tabs 
                defaultActiveKey="trending" 
                items={tabItems} 
                className="best-sellers-tabs"
            />
        </div>
    );
};

export default BestSellers;
