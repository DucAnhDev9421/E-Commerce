import React from 'react';
import { Row, Col, Typography, Space } from 'antd';
import { 
  RocketOutlined, 
  SafetyCertificateOutlined, 
  RotateLeftOutlined, 
  CustomerServiceOutlined 
} from '@ant-design/icons';

const { Text, Title } = Typography;

const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: <RocketOutlined className="text-3xl" />,
      title: 'Giao hàng nhanh 2h',
      desc: 'Miễn phí cho đơn từ 500k',
      color: '#2563eb'
    },
    {
      icon: <SafetyCertificateOutlined className="text-3xl" />,
      title: 'Cam kết chính hãng',
      desc: 'Hoàn tiền 200% nếu giả',
      color: '#16a34a'
    },
    {
      icon: <RotateLeftOutlined className="text-3xl" />,
      title: 'Đổi trả trong 7 ngày',
      desc: 'Thủ tục nhanh gọn, tận nơi',
      color: '#ea580c'
    },
    {
      icon: <CustomerServiceOutlined className="text-3xl" />,
      title: 'Hỗ trợ 24/7',
      desc: 'Đội ngũ chuyên nghiệp tận tâm',
      color: '#7c3aed'
    }
  ];

  return (
    <div className="bg-white rounded-3xl py-10 px-8 shadow-sm border border-gray-100 mt-12 hover:shadow-md transition-shadow">
      <Row gutter={[32, 24]} align="middle">
        {badges.map((badge, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <div className={`flex items-center gap-6 group hover:translate-y-[-2px] transition-transform`}>
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all bg-opacity-10 group-hover:bg-opacity-20 flex-shrink-0"
                style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
              >
                {badge.icon}
              </div>
              <div className="flex flex-col">
                <Text className="text-sm md:text-base font-bold text-gray-800 leading-tight">
                  {badge.title}
                </Text>
                <Text className="text-xs md:text-sm text-gray-400 mt-1">
                  {badge.desc}
                </Text>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TrustBadges;
