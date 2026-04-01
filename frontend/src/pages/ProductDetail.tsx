import React, { useState } from 'react';
import { Row, Col, Typography, Button, Rate, Tag, InputNumber, Divider, Space, Breadcrumb, Card, Image, Tabs, List, Avatar } from 'antd';
import { 
  ShoppingCartOutlined, 
  LeftOutlined, 
  SafetyCertificateOutlined, 
  CarOutlined, 
  CheckCircleOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  // Giả lập data sản phẩm
  const product = {
    id: id,
    name: 'iPhone 15 Pro Max 256GB - VN/A Chính hãng Titan Tự Nhiên',
    price: 32000000,
    oldPrice: 34990000,
    rating: 5,
    reviews: 1240,
    sold: 5000,
    description: 'iPhone 15 Pro Max là mẫu điện thoại cao cấp nhất của Apple trong năm 2023, với khung viền Titan siêu nhẹ và bền bỉ, chip A17 Pro mạnh mẽ nhất thế giới và camera zoom quang học 5x hiện đại.',
    images: [
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1695048133142-13ef86b403ec?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1695642435728-660c6d59ce6c?auto=format&fit=crop&q=80&w=800',
    ]
  };

  return (
    <div className="py-10 container mx-auto px-4 lg:px-0">
      <Breadcrumb className="mb-8 text-lg font-medium">
        <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
        <Breadcrumb.Item><Link to="/category/dienthoai">Điện thoại</Link></Breadcrumb.Item>
        <Breadcrumb.Item>iPhone 15 Pro Max</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={[48, 24]}>
        {/* Left Gallery */}
        <Col xs={24} lg={12}>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
            <Image
              src={product.images[0]}
              className="rounded-2xl max-h-[500px] object-contain mb-6"
            />
            <div className="flex gap-4 overflow-x-auto pb-2 w-full justify-center">
              {product.images.map((img, idx) => (
                <div key={idx} className="w-24 h-24 rounded-xl border-2 border-gray-100 overflow-hidden cursor-pointer hover:border-blue-500 transition-all p-1">
                  <img src={img} className="w-full h-full object-cover rounded-lg" alt={`thumb ${idx}`} />
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* Right Info */}
        <Col xs={24} lg={12}>
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 h-full">
            <div className="mb-4">
              <Tag color="blue" className="px-3 py-1 font-bold rounded-lg border-none text-sm mb-4">CHÍNH HÃNG VN/A</Tag>
              <Title level={2} className="!mb-2 leading-tight">{product.name}</Title>
              <div className="flex items-center gap-6">
                <Space>
                  <Rate disabled defaultValue={product.rating} style={{ fontSize: '16px' }} />
                  <Text className="text-gray-400">({product.reviews} đánh giá)</Text>
                </Space>
                <Divider type="vertical" className="bg-gray-200 h-4" />
                <Text className="text-gray-400">Đã bán {product.sold}+</Text>
              </div>
            </div>

            <div className="bg-blue-50/50 p-8 rounded-2xl mb-8 flex flex-col gap-2">
              <Text delete className="text-xl text-gray-400">{product.oldPrice.toLocaleString('vi-VN')}₫</Text>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-extrabold text-blue-600 font-mono tracking-tighter">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                <Tag color="red" className="text-lg px-2 rounded-lg font-bold">GIẢM 9%</Tag>
              </div>
              <div className="flex items-center gap-2 text-green-600 mt-2 font-medium">
                <CheckCircleOutlined /> Còn hàng - Giao hàng nhanh trong 2h
              </div>
            </div>

            <div className="mb-8 p-6 border-2 border-gray-50 rounded-2xl">
              <Text strong className="block mb-4 text-lg">Số lượng</Text>
              <Space size="large">
                <InputNumber 
                  min={1} 
                  max={10} 
                  defaultValue={1} 
                  size="large" 
                  className="w-32 rounded-xl h-12 flex items-center" 
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                />
                <Text type="secondary" className="text-sm italic italic">Chỉ còn 15 sản phẩm trong kho.</Text>
              </Space>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />} 
                className="flex-1 h-16 rounded-2xl bg-blue-600 font-bold text-lg hover:scale-102 transition-transform"
                onClick={() => navigate('/cart')}
              >
                THÊM VÀO GIỎ HÀNG
              </Button>
              <Button 
                size="large" 
                className="flex-1 h-16 rounded-2xl border-2 border-blue-600 text-blue-600 font-bold text-lg hover:bg-blue-50 transition-colors"
                onClick={() => navigate('/checkout')}
              >
                MUA NGAY
              </Button>
            </div>

            <Divider />
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                  <SafetyCertificateOutlined style={{ fontSize: '24px' }} />
                </div>
                <div>
                  <Text strong className="block">Bảo hành 12 tháng</Text>
                  <Text type="secondary" className="text-xs">Chính hãng tại các trung tâm bảo hành Apple.</Text>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <CarOutlined style={{ fontSize: '24px' }} />
                </div>
                <div>
                  <Text strong className="block">Miễn phí vận chuyển</Text>
                  <Text type="secondary" className="text-xs">Đơn hàng từ 1.000.000₫.</Text>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tabs and More details */}
      <div className="mt-16 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        <Tabs
          defaultActiveKey="1"
          size="large"
          items={[
            {
              key: '1',
              label: 'Mô tả sản phẩm',
              children: (
                <div className="py-6">
                  <Paragraph className="text-lg leading-relaxed text-gray-700">
                    {product.description}
                  </Paragraph>
                  <Paragraph className="text-lg leading-relaxed text-gray-700">
                    iPhone 15 Pro Max mang đến những cải tiến mạnh mẽ nhất từ trước đến nay. Thiết kế Titan không chỉ bền bỉ mà còn mang lại cảm giác nhẹ nhàng chưa từng có mẫu Pro Max nào trước đây. Hệ thống camera được nâng cấp toàn diện giúp người dùng có thể sáng tạo chuyên nghiệp nhất.
                  </Paragraph>
                </div>
              ),
            },
            {
              key: '2',
              label: 'Thông số kỹ thuật',
              children: (
                <List
                  bordered
                  className="my-6 rounded-2xl border-gray-100"
                  dataSource={[
                    { label: 'Chip set', value: 'A17 Pro (3nm)' },
                    { label: 'Màn hình', value: '6.7 inch, Super Retina XDR OLED' },
                    { label: 'RAM', value: '8 GB' },
                    { label: 'Pin', value: '4441 mAh, Li-Ion' }
                  ]}
                  renderItem={(item) => (
                    <List.Item className="px-8 h-12">
                      <Text strong className="w-1/3">{item.label}</Text>
                      <Text className="text-gray-600">{item.value}</Text>
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: '3',
              label: 'Đánh giá từ khách hàng (1240)',
              children: <div className="py-20 text-center text-gray-400">Đang tải đánh giá...</div>,
            },
          ]}
        />
      </div>
    </div>
  );
};

// Cần tạo dummy Link vì import từ router-dom
const Link = ({ to, children, ...props }: any) => <a onClick={(e) => { e.preventDefault(); /* setup custom logic simple */ }} href={to} {...props}>{children}</a>;

export default ProductDetail;
