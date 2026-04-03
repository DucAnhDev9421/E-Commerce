import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Divider } from 'antd';
import { 
  CheckCircleFilled, 
  CloseCircleFilled, 
  ShoppingOutlined, 
  ArrowRightOutlined,
  HomeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAppDispatch } from '../../store/hooks';
import { clearCart } from '../../store/cartSlice';

const { Title, Text, Paragraph } = Typography;

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    window.scrollTo(0, 0);
    // Nếu thanh toán thành công, xóa giỏ hàng ở Client
    if (status === 'success') {
      dispatch(clearCart());
    }
  }, [status, dispatch]);

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen pt-24 pb-32 bg-[#f0f9f6] flex items-center justify-center px-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isSuccess ? 'bg-emerald-400' : 'bg-red-400'}`} />
      <div className={`absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full blur-[100px] opacity-10 ${isSuccess ? 'bg-emerald-300' : 'bg-red-300'}`} />

      <Card className="max-w-2xl w-full glass-panel rounded-[3rem] border border-white/60 shadow-2xl bg-white/40 backdrop-blur-xl p-8 md:p-12 relative z-10">
        <div className="text-center mb-10">
           {isSuccess ? (
             <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-200 mx-auto mb-8 animate-bounce">
                <CheckCircleFilled className="text-5xl text-white" />
             </div>
           ) : (
             <div className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-100 mx-auto mb-8">
                <CloseCircleFilled className="text-5xl text-white" />
             </div>
           )}
           
           <Title level={1} className="!m-0 !font-serif !font-normal tracking-tight">
             {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
           </Title>
           <Text className="text-text/40 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 block">
              {isSuccess ? 'CẢM ƠN BẠN ĐÃ TIN TƯỞNG LỰA CHỌN' : 'VUI LÒNG KIỂM TRA LẠI GIAO DỊCH'}
           </Text>
        </div>

        <Divider className="my-10 border-white/60" />

        <div className="space-y-6 mb-12">
            <Paragraph className="text-center text-text/60 text-lg leading-relaxed px-4 md:px-10">
                {isSuccess 
                  ? 'Tuyệt vời! Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý. Chúng tôi sẽ sớm liên hệ với bạn để bắt đầu hành trình vận chuyển.' 
                  : 'Rất tiếc, đã có một chút gián đoạn trong quá trình thanh toán của bạn. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.'}
            </Paragraph>

            {orderId && (
                <div className="bg-white/50 p-6 rounded-3xl border border-white/80 flex flex-col items-center gap-2">
                    <Text className="text-text/30 font-bold text-[10px] uppercase tracking-widest">MÃ ĐƠN HÀNG CỦA BẠN</Text>
                    <Title level={4} className="!m-0 !font-mono text-emerald-700 tracking-wider">#{orderId}</Title>
                    <Text type="secondary" className="text-xs italic mt-1">Lưu mã này để tra cứu trạng thái đơn hàng</Text>
                </div>
            )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
            {isSuccess ? (
                <>
                    <Button 
                        size="large" 
                        icon={<FileTextOutlined />}
                        className="h-16 px-10 rounded-2xl border-emerald-600/30 text-emerald-700 font-bold tracking-widest text-xs uppercase hover:bg-emerald-50"
                        onClick={() => navigate('/profile')}
                    >
                        XEM ĐƠN HÀNG
                    </Button>
                    <Button 
                        type="primary"
                        size="large" 
                        icon={<HomeOutlined />}
                        className="h-16 px-10 rounded-2xl bg-emerald-600 border-none font-bold tracking-widest text-xs uppercase shadow-xl shadow-emerald-200"
                        onClick={() => navigate('/')}
                    >
                        VỀ TRANG CHỦ
                    </Button>
                </>
            ) : (
                <>
                    <Button 
                        size="large" 
                        icon={<ShoppingOutlined />}
                        className="h-16 px-10 rounded-2xl border-red-200 text-text/60 font-bold tracking-widest text-xs uppercase hover:bg-gray-50"
                        onClick={() => navigate('/cart')}
                    >
                        VỀ GIỎ HÀNG
                    </Button>
                    <Button 
                        type="primary"
                        size="large" 
                        className="h-16 px-10 rounded-2xl bg-text border-none font-bold tracking-widest text-xs uppercase shadow-xl"
                        onClick={() => navigate('/checkout')}
                    >
                        THỬ LẠI NGAY <ArrowRightOutlined className="ml-2" />
                    </Button>
                </>
            )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/40 flex items-center justify-center gap-6 grayscale opacity-40">
             <img src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo-vnpay.png" alt="VNPay" className="h-4" />
             <ShoppingOutlined className="text-xl" />
        </div>
      </Card>
    </div>
  );
};

export default PaymentResult;
