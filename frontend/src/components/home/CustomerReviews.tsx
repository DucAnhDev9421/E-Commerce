import React from 'react';
import { Row, Col, Typography, Card, Avatar, Rate, Space } from 'antd';
import { StarFilled, MessageOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const CustomerReviews: React.FC = () => {
  const reviews = [
    {
      id: 1,
      name: 'Nguyễn Văn Nam',
      role: 'Business Owner',
      avatar: 'https://i.pravatar.cc/150?u=1',
      rating: 5,
      content: 'Chất lượng iPhone 15 Pro Max thực sự tuyệt vời, dịch vụ giao hàng 2h của shop quá nhanh, mình nhận được máy chỉ sau 45 phút đặt hàng. Rất hài lòng!',
      date: '2 ngày trước'
    },
    {
      id: 2,
      name: 'Trần Thị Mỹ Linh',
      role: 'Fashion Blogger',
      avatar: 'https://i.pravatar.cc/150?u=2',
      rating: 5,
      content: 'Bộ sưu tập Thu Đông năm nay cực kỳ tinh tế, chất vải cao cấp chuẩn hàng hiệu. Đã mua 3 mẫu và mẫu nào cũng ưng ý hết nấc!',
      date: '1 tuần trước'
    },
    {
      id: 3,
      name: 'Lê Minh Hiếu',
      role: 'Software Engineer',
      avatar: 'https://i.pravatar.cc/150?u=3',
      rating: 4.5,
      content: 'Laptop Gaming ASUS ROG chạy cực mượt, chiến Game đỉnh cao. Shop tư vấn rất nhiệt tình, hỗ trợ cài đặt phần mềm tận nơi.',
      date: '3 ngày trước'
    }
  ];

  return (
    <div className="mt-32 mb-32 relative overflow-hidden bg-white/40 backdrop-blur-3xl rounded-[4rem] px-10 md:px-24 py-24 shadow-2xl border border-white/60">
      <div className="text-center mb-20 relative z-10">
        <Space size="middle" className="mb-6 bg-primary/10 text-primary px-6 py-2 rounded-full font-bold">
            <StarFilled /> ĐÁNH GIÁ TỪ KHÁCH HÀNG
        </Space>
        <Title level={1} className="!m-0 !font-serif !text-4xl md:!text-5xl tracking-tight text-text">
          CÂU CHUYỆN HÀI LÒNG
        </Title>
      </div>

      <Row gutter={[32, 32]} className="relative z-10">
        {reviews.map((rev) => (
          <Col xs={24} md={8} key={rev.id}>
            <Card className="h-full rounded-[2.5rem] border border-white/60 shadow-xl p-12 hover:shadow-2xl transition-all duration-500 group relative glass-card">
               <div className="absolute top-10 right-10 opacity-[0.05] group-hover:opacity-[0.15] transition-opacity">
                  <MessageOutlined className="text-8xl text-primary" />
               </div>
               
               <div className="mb-10 flex items-center gap-4">
                  <Avatar size={80} src={rev.avatar} className="border-4 border-white shadow-md" />
                  <div>
                    <Text className="block font-bold text-xl text-text leading-tight mb-1">{rev.name}</Text>
                    <Text className="text-sm text-primary font-bold uppercase tracking-widest">{rev.role}</Text>
                  </div>
               </div>

               <div className="mb-8 border-l-4 border-primary pl-6">
                  <Paragraph className="text-text/70 italic text-lg leading-relaxed line-clamp-4 font-light">
                    "{rev.content}"
                  </Paragraph>
               </div>

               <div className="mt-auto flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                  <Rate disabled defaultValue={rev.rating} style={{ fontSize: '14px' }} className="text-cta" />
                  <Text className="text-text/50 text-xs font-bold">{rev.date}</Text>
               </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Decorative Circles */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
    </div>
  );
};

export default CustomerReviews;
