import React from 'react';
import { Card, Row, Col, Statistic, Typography, Divider } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <Title level={2} style={{ margin: 0 }}>Chào mừng Admin</Title>
        <Text type="secondary">Tổng quan về hệ thống E-Commerce của bạn</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-0 bg-blue-50">
            <Statistic
              title="Tổng Người Dùng"
              value={1248}
              prefix={<UserOutlined style={{ marginRight: 8, color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-0 bg-green-50">
            <Statistic
              title="Tổng Vai Trò (Roles)"
              value={3}
              prefix={<SafetyCertificateOutlined style={{ marginRight: 8, color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-0 bg-orange-50">
            <Statistic
              title="Đơn Hàng Mới"
              value={42}
              prefix={<ShoppingCartOutlined style={{ marginRight: 8, color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-0 bg-purple-50">
            <Statistic
              title="Doanh Thu Tháng"
              value={15200000}
              suffix="₫"
              prefix={<DollarOutlined style={{ marginRight: 8, color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Divider />
      
      <div className="mt-10">
        <Title level={4}>Hoạt động gần đây</Title>
        <Card className="shadow-sm border-0 text-center py-10 text-gray-400">
           Chưa có dữ liệu thống kê hoạt động thực tế. Kết nối API để xem thêm.
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
