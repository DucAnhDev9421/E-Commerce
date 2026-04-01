import React, { useState } from 'react';
import { Table, Space, Button, InputNumber, Card, Divider, Typography, Row, Col, Empty, Tooltip, notification } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const Cart: React.FC = () => {
  const navigate = useNavigate();
  
  // Giả lập data giỏ hàng
  const [cartItems, setCartItems] = useState<any[]>([
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB - VN/A Titan Gray',
      price: 32000000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=200',
      category: 'Điện thoại'
    },
    {
      id: 2,
      name: 'Sony WH-1000XM5 Noise Canceling Headphone',
      price: 7800000,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200',
      category: 'Phụ kiện'
    }
  ]);

  const updateQuantity = (id: number, val: number | null) => {
    if (!val) return;
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: val } : item
    ));
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    notification.success({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  };

  // Tính toán
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 1000000 ? 0 : 50000;
  const total = subtotal + shipping;

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space size="large" className="py-2">
          <img src={record.image} className="w-20 h-20 object-cover rounded-xl shadow-sm border border-gray-100" />
          <div className="flex flex-col gap-1 max-w-[300px]">
             <Text strong className="text-lg leading-tight block">{text}</Text>
             <Text type="secondary" className="text-xs uppercase">{record.category}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <Text strong className="text-lg">{price.toLocaleString('vi-VN')}₫</Text>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: any) => (
        <InputNumber 
          min={1} 
          max={10} 
          value={quantity} 
          onChange={(val) => updateQuantity(record.id, val)}
          className="rounded-lg h-10 w-24 flex items-center font-bold"
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Text strong className="text-xl text-blue-600">{(record.price * record.quantity).toLocaleString('vi-VN')}₫</Text>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: any) => (
        <Tooltip title="Xóa sản phẩm">
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined style={{ fontSize: '18px' }} />} 
            onClick={() => removeItem(record.id)}
            className="hover:bg-red-50"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="py-12 container mx-auto px-4 md:px-0">
      <div className="flex items-center justify-between mb-10">
        <div>
          <Title level={2} className="!mb-0 uppercase tracking-tight flex items-center gap-3">
             <ShoppingOutlined className="text-blue-600" /> Giỏ hàng của bạn
          </Title>
          <Text type="secondary" className="text-lg">Bạn đang có {cartItems.length} sản phẩm trong danh sách</Text>
        </div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          type="link" 
          className="text-lg font-bold p-0 text-blue-600"
          onClick={() => navigate('/')}
        >
          TIẾP TỤC MUA SẮM
        </Button>
      </div>

      {cartItems.length > 0 ? (
        <Row gutter={[32, 24]}>
          <Col xs={24} lg={16}>
             <Card className="shadow-sm rounded-3xl border-0 overflow-hidden">
                <Table 
                   columns={columns} 
                   dataSource={cartItems} 
                   pagination={false} 
                   rowKey="id"
                   className="custom-cart-table"
                />
             </Card>
          </Col>

          <Col xs={24} lg={8}>
             <Card className="shadow-lg rounded-3xl border-0 p-4 sticky top-24">
                <Title level={4} className="mb-8">TÓM TẮT ĐƠN HÀNG</Title>
                
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center text-lg">
                    <Text type="secondary">Tạm tính</Text>
                    <Text strong className="text-xl">{subtotal.toLocaleString('vi-VN')}₫</Text>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <Text type="secondary">Phí vận chuyển</Text>
                    <Text strong className={shipping === 0 ? 'text-green-600 text-xl' : 'text-xl'}>
                      {shipping === 0 ? 'MIỄN PHÍ' : `${shipping.toLocaleString('vi-VN')}₫`}
                    </Text>
                  </div>
                  
                  <Divider className="my-2" />
                  
                  <div className="flex justify-between items-center mb-6">
                    <Text strong className="text-xl uppercase">TỔNG CỘNG</Text>
                    <Text strong className="text-3xl text-blue-600 font-mono tracking-tighter">
                      {total.toLocaleString('vi-VN')}₫
                    </Text>
                  </div>

                  <Button 
                    type="primary" 
                    size="large" 
                    className="h-16 rounded-2xl bg-blue-600 font-extrabold text-xl hover:scale-102 transition-transform shadow-blue-200 shadow-xl mb-4"
                    onClick={() => navigate('/checkout')}
                  >
                    TIẾN HÀNH THANH TOÁN
                  </Button>

                  <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-4 border border-dashed border-gray-200">
                    <div className="flex items-center gap-3 text-green-600 font-medium italic">
                       <SafetyCertificateOutlined /> Thanh toán an toàn 100%
                    </div>
                    <Text type="secondary" className="text-xs">
                      Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Modern Shop.
                    </Text>
                  </div>
                </div>
             </Card>
          </Col>
        </Row>
      ) : (
        <Card className="py-24 shadow-sm border-0 rounded-3xl flex flex-col items-center">
           <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={<Text className="text-2xl text-gray-400">Giỏ hàng đang trống!</Text>}
           />
           <Button 
              type="primary" 
              size="large" 
              className="mt-8 h-12 px-10 rounded-xl bg-blue-600 font-bold"
              onClick={() => navigate('/')}
           >
              MUA SẮM NGAY BÂY GIỜ
           </Button>
        </Card>
      )}
    </div>
  );
};

export default Cart;
