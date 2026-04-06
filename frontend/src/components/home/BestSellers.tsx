import React, { useEffect, useState } from 'react';
import { Tabs, Row, Col, Typography, Button, Spin, Empty } from 'antd';
import { RiseOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import productApi from '../../api/productApi';

const { Title, Text } = Typography;

const BestSellers: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res: any = await productApi.getAll();
                // Backend returns { items, page, ... }
                setProducts(res.items || []);
            } catch (error) {
                console.error("Fetch best sellers error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return <div className="mt-32 text-center"><Spin size="large" description="Đang tải sản phẩm..." /></div>;
    }

    if (products.length === 0) {
        return <div className="mt-32"><Empty description="Chưa có sản phẩm nào" /></div>;
    }

    // Categorization logic
    const trending = products.slice(0, 4);
    const fashion = products.filter(p => (p.categoryId?.name || '').toLowerCase().includes('phụ kiện') || (p.categoryId?.name || '').toLowerCase().includes('thời trang')).slice(0, 4);
    const newArrivals = [...products]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);

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
                    {trending.map(p => (
                        <Col xs={12} sm={8} lg={6} key={p._id}>
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
                    <StarOutlined /> LINH KIỆN
                </span>
            ),
            children: (
                <Row gutter={[20, 20]} className="mt-8">
                    {fashion.length > 0 ? (
                        fashion.map(p => (
                            <Col xs={12} sm={8} lg={6} key={p._id}>
                                <ProductCard product={p} />
                            </Col>
                        ))
                    ) : (
                        <Col span={24} className="text-center py-20 text-gray-400">Chưa có sản phẩm thuộc nhóm này</Col>
                    )}
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
                    {newArrivals.map(p => (
                        <Col xs={12} sm={8} lg={6} key={p._id}>
                            <ProductCard product={p} />
                        </Col>
                    ))}
                </Row>
            )
        }
    ];

    return (
        <div className="mt-32 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-primary/20 pb-8 relative z-10">
                 <div className="max-w-2xl">
                    <Title level={2} className="!m-0 !font-serif !text-4xl md:!text-5xl text-text">
                        SẢN PHẨM KHÔNG THỂ BỎ LỠ
                    </Title>
                    <Text className="block mt-4 text-base md:text-lg text-text/70 font-light">
                        Tuyển tập những siêu phẩm bán chạy nhất, được cộng đồng săn đón và hàng mới cập bến mỗi tuần.
                    </Text>
                 </div>
                 <Button 
                    type="primary" 
                    size="large" 
                    onClick={() => navigate('/?view=all')}
                    className="h-12 px-8 rounded-full font-bold bg-text text-white hover:bg-primary hidden md:flex items-center justify-center border-none mt-6 md:mt-0 transition-colors"
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
