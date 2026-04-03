import React from 'react';
import { Table, Space, Button, InputNumber, Card, Divider, Typography, Row, Col, Empty, Tooltip, notification, Badge } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, ShoppingOutlined, CreditCardOutlined, TruckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { removeItem as removeFromCart, updateQuantity } from '../store/cartSlice';

const { Title, Text } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: cartItems, totalAmount: subtotal } = useSelector((state: RootState) => state.cart);

  const handleUpdateQuantity = (id: string, val: number | null) => {
    if (!val) return;
    dispatch(updateQuantity({ id, quantity: val }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
    notification.success({ 
      title: 'Đã xóa sản phẩm',
      description: 'Sản phẩm đã được xóa khỏi giỏ hàng của bạn.',
      placement: 'bottomRight'
    });
  };

  // Tính toán
  const shipping = subtotal > 1000000 ? 0 : 50000;
  const total = subtotal + shipping;

  const columns = [
    {
      title: 'SẢN PHẨM',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => {
        const imageUrl = record.image?.startsWith('http') ? record.image : `${BASE_URL}${record.image}`;
        return (
          <Space size="large" align="center" className="py-2">
            <div className="relative group">
              <img 
                src={imageUrl} 
                className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-2xl shadow-md border border-gray-100 bg-gray-50 transition-transform duration-300 group-hover:scale-105" 
                alt={text}
              />
              {record.discount > 0 && (
                <Badge count={`-${record.discount}%`} className="absolute -top-2 -right-2 font-bold" color="#f5222d" />
              )}
            </div>
            <div className="flex flex-col justify-center gap-1 max-w-[320px]">
               <Text strong className="text-base md:text-lg leading-tight hover:text-blue-600 transition-colors cursor-pointer">{text}</Text>
               <Text type="secondary" className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded inline-block w-fit">
                 {record.category || 'Công nghệ'}
               </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'ĐƠN GIÁ',
      dataIndex: 'price',
      key: 'price',
      align: 'center' as const,
      width: 150,
      render: (price: number) => <Text strong className="text-base md:text-lg text-gray-700">{price.toLocaleString('vi-VN')}₫</Text>,
    },
    {
      title: 'SỐ LƯỢNG',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      width: 120,
      render: (quantity: number, record: any) => (
        <InputNumber 
          min={1} 
          max={100} 
          value={quantity} 
          onChange={(val) => handleUpdateQuantity(record._id, val)}
          className="rounded-xl h-9 md:h-10 w-20 md:w-24 flex items-center font-bold border-gray-200 shadow-sm custom-input-number"
        />
      ),
    },
    {
      title: 'THÀNH TIỀN',
      key: 'subtotal',
      align: 'right' as const,
      width: 180,
      render: (_: any, record: any) => (
        <Text strong className="text-lg md:text-xl text-blue-600 font-mono tracking-tighter">
          {(record.price * record.quantity).toLocaleString('vi-VN')}₫
        </Text>
      ),
    },
    {
      title: '',
      key: 'action',
      align: 'right' as const,
      width: 60,
      render: (_: any, record: any) => (
        <Tooltip title="Xóa">
          <Button 
            type="text" 
            danger 
            shape="circle"
            icon={<DeleteOutlined style={{ fontSize: '18px' }} />} 
            onClick={() => handleRemoveItem(record._id)}
            className="hover:bg-red-50 flex items-center justify-center h-8 w-8 md:h-10 md:w-10 transition-colors"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="pt-8 md:pt-16 pb-32 px-4 md:px-0 bg-[#f8fbff] min-h-screen">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div>
            <Title level={1} className="!mb-1 flex items-center gap-3 !text-3xl md:!text-4xl font-black italic text-gray-900 tracking-tight">
               <ShoppingOutlined className="text-blue-600 drop-shadow-lg" /> GIỎ HÀNG
            </Title>
            <Text type="secondary" className="text-base md:text-lg font-medium opacity-70">Sản phẩm bạn đã chọn</Text>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            type="link" 
            size="large"
            className="text-base md:text-lg font-bold p-0 text-gray-400 hover:text-blue-600 transition-colors"
            onClick={() => navigate('/')}
          >
            TIẾP TỤC MUA SẮM
          </Button>
        </div>

        {cartItems.length > 0 ? (
          <Row gutter={[40, 40]} align="top">
            <Col xs={24} lg={16}>
               <Card 
                  className="shadow-xl rounded-[2rem] border-0 overflow-hidden bg-white/90 backdrop-blur-md"
                  styles={{ body: { padding: '0px' } }}
               >
                  <Table 
                    columns={columns} 
                    dataSource={cartItems} 
                    pagination={false} 
                    rowKey="_id"
                    className="custom-cart-table-premium"
                  />
               </Card>
               <div className="mt-10 flex gap-5 p-8 bg-blue-50/50 rounded-[2rem] border-2 border-dashed border-blue-100 items-center">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-blue-200 shadow-xl shrink-0">
                    <TruckOutlined className="text-3xl text-white" />
                  </div>
                  <div>
                    <Text strong className="text-xl block text-blue-900">
                      {subtotal >= 1000000 ? 'CHÚC MỪNG! BẠN ĐÃ ĐƯỢC MIỄN PHÍ VẬN CHUYỂN' : 'Miễn phí vận chuyển cho đơn hàng từ 1.000.000₫'}
                    </Text>
                    {subtotal < 1000000 && (
                      <Text type="secondary" className="text-lg text-gray-500 italic block">
                        Đặt thêm <span className="text-blue-600 font-bold">{(1000000 - subtotal).toLocaleString('vi-VN')}₫</span> nữa để nhận ưu đãi ngay!
                      </Text>
                    )}
                  </div>
               </div>
            </Col>

            <Col xs={24} lg={8}>
               <div className="sticky top-24 lg:top-28">
                 <Card 
                   className="shadow-[0_30px_60px_rgba(37,_99,_235,_0.12)] rounded-[2.5rem] border-0 bg-white overflow-hidden"
                   styles={{ body: { padding: '0px' } }}
                 >
                    <div className="bg-gray-50/50 p-8 border-b border-gray-100">
                       <Title level={3} className="!mt-0 !mb-0 font-black text-gray-900 uppercase tracking-tight italic">TỔNG ĐƠN HÀNG</Title>
                    </div>

                    <div className="p-10 flex flex-col gap-8">
                      <div className="flex justify-between items-center px-2">
                        <Text className="text-xl text-gray-500 font-medium">Tạm tính</Text>
                        <Text strong className="text-2xl">{subtotal.toLocaleString('vi-VN')}₫</Text>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <Text className="text-xl text-gray-500 font-medium">Phí vận chuyển</Text>
                        <Text strong className={shipping === 0 ? 'text-green-600 text-2xl' : 'text-2xl'}>
                          {shipping === 0 ? 'MIỄN PHÍ' : `${shipping.toLocaleString('vi-VN')}₫`}
                        </Text>
                      </div>
                      
                      <Divider className="my-2 border-gray-100" />
                      
                      <div className="flex justify-between items-center mb-4 px-2">
                        <Text strong className="text-2xl text-gray-900 italic uppercase">TỔNG CỘNG</Text>
                        <Title level={2} className="!mb-0 !text-blue-600 font-mono tracking-tighter drop-shadow-sm !text-4xl italic">
                          {total.toLocaleString('vi-VN')}₫
                        </Title>
                      </div>

                      <Button 
                        type="primary" 
                        size="large" 
                        icon={<CreditCardOutlined className="scale-125" />}
                        className="h-24 rounded-[2rem] bg-blue-600 hover:bg-blue-700 font-black text-3xl transition-all shadow-blue-200 shadow-2xl mb-4 hover:scale-102 flex items-center justify-center gap-6 border-none uppercase italic"
                        onClick={() => navigate('/checkout')}
                      >
                        THANH TOÁN
                      </Button>

                      <div className="bg-green-50/50 p-6 rounded-3xl flex flex-col gap-4 border border-green-100 italic transition-all hover:bg-green-50">
                        <div className="flex items-center gap-3 text-green-700 font-black text-lg">
                           <SafetyCertificateOutlined className="text-2xl" /> BẢO MẬT 100%
                        </div>
                        <Text type="secondary" className="text-sm leading-relaxed text-green-800/70">
                          Thanh toán an toàn qua cổng quốc tế với mã hóa SSL cao cấp nhất.
                        </Text>
                      </div>
                    </div>
                 </Card>
               </div>
            </Col>
          </Row>
        ) : (
          <Card className="py-32 shadow-xl border-0 rounded-[3rem] text-center bg-white">
             <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description={<Text className="text-3xl font-black text-gray-300 uppercase tracking-widest italic">Giỏ hàng của bạn đang trống</Text>}
             />
             <Button 
                type="primary" 
                size="large" 
                className="mt-12 h-16 px-12 rounded-3xl bg-blue-600 font-black text-xl shadow-xl hover:scale-110 transition-transform"
                onClick={() => navigate('/')}
             >
                KHÁM PHÁ CỬA HÀNG NGAY
             </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Cart;
