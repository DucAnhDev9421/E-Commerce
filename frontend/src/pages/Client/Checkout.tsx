import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Typography, 
  Button, 
  Radio, 
  Divider, 
  Empty, 
  notification, 
  Spin,
  Badge,
  Input
} from 'antd';
import { 
  EnvironmentOutlined, 
  CreditCardOutlined, 
  ShoppingOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LockOutlined,
  TruckOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import addressApi from '../../api/addressApi';
import orderApi from '../../api/orderApi';
import type { Address } from '../../types/auth';

const { Title, Text } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items: cartItems, totalAmount: subtotal } = useAppSelector((state) => state.cart);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    const fetchData = async () => {
      try {
        const addrList = await addressApi.getAll();
        setAddresses(addrList);
        // Tự động chọn địa chỉ mặc định
        const defaultAddr = addrList.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id!);
        } else if (addrList.length > 0) {
          setSelectedAddressId(addrList[0]._id!);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu checkout:', error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [cartItems, navigate]);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      return notification.warning({ message: 'Vui lòng chọn địa chỉ giao hàng' });
    }

    setLoading(true);
    try {
      const response = await orderApi.checkout({
        addressId: selectedAddressId,
        paymentMethod,
        note
      });

      if (paymentMethod === 'VNPAY' && response.paymentUrl) {
         // Chuyển hướng sang VNPay
         window.location.href = response.paymentUrl;
      } else {
         // COD thành công
         notification.success({ 
            message: 'Đặt hàng thành công', 
            description: 'Thông tin đơn hàng đã được gửi tới email của bạn.' 
         });
         navigate(`/payment-result?status=success&orderId=${response._id || response.id}`);
      }
    } catch (error: any) {
      notification.error({ 
        message: 'Đặt hàng thất bại', 
        description: error.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" tip="Đang chuẩn bị thanh toán..." />
      </div>
    );
  }

  const shipping = subtotal > 1000000 ? 0 : 50000;
  const total = subtotal + shipping;

  return (
    <div className="relative pt-16 pb-32 px-4 md:px-0 bg-[#f0f9f6] min-h-screen overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px] opacity-40 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-emerald-50 rounded-full blur-[100px] opacity-30" />

      <div className="container mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-12">
            <Button 
                shape="circle" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/cart')}
                className="bg-white/80 border-none shadow-md hover:scale-110 transition-transform"
            />
            <div>
              <Title level={1} className="!m-0 !font-serif !font-normal tracking-tight">Thanh toán</Title>
              <Text className="text-text/40 font-bold uppercase text-[10px] tracking-[0.3em]">Hoàn tất hành trình mua sắm của bạn</Text>
            </div>
        </div>

        <Row gutter={[40, 40]}>
          <Col xs={24} lg={15}>
            {/* 1. Địa chỉ giao hàng */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 backdrop-blur-md mb-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <EnvironmentOutlined className="text-white text-lg" />
                    </div>
                    <Title level={4} className="!m-0 !font-serif !font-normal">Địa chỉ nhận hàng</Title>
                </div>
                <Button 
                    type="link" 
                    className="text-emerald-600 font-bold hover:text-emerald-500"
                    onClick={() => navigate('/profile')}
                >
                    + Thêm địa chỉ mới
                </Button>
              </div>

              {addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div 
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id!)}
                      className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group ${
                        selectedAddressId === addr._id 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-lg' 
                        : 'border-white/60 bg-white/50 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <Radio checked={selectedAddressId === addr._id} className="mt-1 custom-emerald-radio" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Text strong className="text-lg">{addr.receiverName}</Text>
                                {addr.isDefault && <Badge count="MẶC ĐỊNH" style={{ backgroundColor: '#059669', fontSize: '8px' }} />}
                            </div>
                            <Text className="block text-text/60 leading-relaxed">
                                {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                            </Text>
                            <Text className="block text-text/40 text-xs mt-2 font-mono">{addr.phoneNumber}</Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                   <Empty description="Bạn chưa có địa chỉ giao hàng nào" />
                   <Button 
                    type="primary" 
                    className="mt-6 bg-emerald-600 border-none rounded-full"
                    onClick={() => navigate('/profile')}
                   >
                    Đến trang quản lý địa chỉ
                   </Button>
                </div>
              )}
            </div>

            {/* 2. Phương thức thanh toán */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 backdrop-blur-md mb-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <CreditCardOutlined className="text-white text-lg" />
                    </div>
                    <Title level={4} className="!m-0 !font-serif !font-normal">Phương thức thanh toán</Title>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div 
                        onClick={() => setPaymentMethod('COD')}
                        className={`flex-1 p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                            paymentMethod === 'COD' 
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-lg' 
                            : 'border-white/60 bg-white/50 hover:border-emerald-200'
                        }`}
                    >
                        <Radio checked={paymentMethod === 'COD'} />
                        <div>
                             <Text strong className="block">COD</Text>
                             <Text type="secondary" className="text-xs">Thanh toán khi nhận hàng</Text>
                        </div>
                    </div>
                    <div 
                        onClick={() => setPaymentMethod('VNPAY')}
                        className={`flex-1 p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                            paymentMethod === 'VNPAY' 
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-lg' 
                            : 'border-white/60 bg-white/50 hover:border-emerald-200'
                        }`}
                    >
                        <Radio checked={paymentMethod === 'VNPAY'} />
                        <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                                <Text strong>VNPAY</Text>
                                <img src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo-vnpay.png" alt="VNPay" className="h-4" />
                             </div>
                             <Text type="secondary" className="text-xs">ATM / QR-Code / Ví điện tử</Text>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Ghi chú */}
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/60 shadow-xl bg-white/40 backdrop-blur-md">
                <Title level={4} className="mb-4 !font-serif !font-normal">Ghi chú đơn hàng</Title>
                <Input.TextArea 
                    rows={4} 
                    placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi giao..." 
                    className="rounded-3xl border-none bg-white/50 p-4"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
          </Col>

          <Col xs={24} lg={9}>
            <div className="sticky top-24">
              <div className="glass-panel p-8 rounded-[3rem] border border-white/60 shadow-2xl bg-white/60 backdrop-blur-xl overflow-hidden relative">
                <Title level={3} className="!mb-8 !font-serif !font-normal tracking-tight">Tóm tắt đơn hàng</Title>
                
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-8">
                  {cartItems.map((item) => {
                    const imgUrl = item.image?.startsWith('http') ? item.image : `${BASE_URL}${item.image}`;
                    return (
                        <div key={item._id} className="flex gap-4">
                            <Badge count={item.quantity} className="shrink-0">
                                <div className="w-16 h-16 bg-white rounded-2xl p-2 border border-emerald-50 flex items-center justify-center">
                                    <img src={imgUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                                </div>
                            </Badge>
                            <div className="flex flex-col justify-center flex-1 overflow-hidden">
                                <Text strong className="truncate text-sm">{item.name}</Text>
                                <Text type="secondary" className="text-xs">{(item.price).toLocaleString('vi-VN')}₫</Text>
                            </div>
                            <div className="flex items-center text-emerald-600 font-bold whitespace-nowrap">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                            </div>
                        </div>
                    );
                  })}
                </div>

                <Divider className="my-8 border-emerald-100" />

                <div className="space-y-4">
                    <div className="flex justify-between text-text/60">
                        <Text>Tạm tính</Text>
                        <Text strong className="text-text">{subtotal.toLocaleString('vi-VN')}₫</Text>
                    </div>
                    <div className="flex justify-between text-text/60">
                        <Text>Phí vận chuyển</Text>
                        <Text strong className={shipping === 0 ? 'text-emerald-600' : 'text-text'}>
                            {shipping === 0 ? 'MIỄN PHÍ' : `${shipping.toLocaleString('vi-VN')}₫`}
                        </Text>
                    </div>
                    
                    <div className="h-px bg-emerald-100 my-2" />
                    
                    <div className="flex justify-between items-center py-4 bg-emerald-600/5 -mx-8 px-8 mb-8">
                        <Title level={4} className="!m-0 !font-serif !font-normal italic">TỔNG CỘNG</Title>
                        <Title level={2} className="!m-0 !text-emerald-600 italic tracking-tighter">
                            {total.toLocaleString('vi-VN')}₫
                        </Title>
                    </div>
                </div>

                <Button 
                    type="primary" 
                    size="large" 
                    block
                    loading={loading}
                    disabled={!selectedAddressId}
                    icon={<LockOutlined />}
                    className="h-16 rounded-full bg-emerald-600 border-none font-bold tracking-widest text-xs uppercase shadow-xl shadow-emerald-200 mt-4 hover:scale-102 transition-all"
                    onClick={handleCheckout}
                >
                    {paymentMethod === 'VNPAY' ? 'THANH TOÁN QUA VNPAY' : 'XÁC NHẬN ĐẶT HÀNG'}
                </Button>

                <div className="mt-8 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-text/30 uppercase tracking-[0.2em] justify-center">
                        <CheckCircleOutlined className="text-emerald-600" /> Thanh toán an toàn & mã hóa
                    </div>
                    <div className="flex items-center gap-4 justify-center grayscale opacity-40">
                         <img src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo-vnpay.png" alt="VNPay" className="h-4" />
                         <TruckOutlined className="text-xl" />
                         <ShoppingOutlined className="text-xl" />
                    </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <style>{`
        .custom-emerald-radio .ant-radio-checked .ant-radio-inner {
          border-color: #059669 !important;
          background-color: #059669 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Checkout;
