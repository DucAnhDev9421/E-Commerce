import React from 'react';
import { Layout, Input, Badge, Dropdown, Space, Avatar, Typography, Button, Row, Col } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  FacebookOutlined, 
  InstagramOutlined, 
  YoutubeOutlined,
  LogoutOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import { getAvatarUrl } from '../utils/imageUtils';

const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { Title, Text } = Typography;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const categoriesItems = [
    { key: 'elec', label: 'Điện tử' },
    { key: 'fashion', label: 'Thời trang' },
    { key: 'home', label: 'Nhà cửa & Đời sống' },
    { key: 'beauty', label: 'Làm đẹp' },
  ];

  const userItems = [
    { key: 'profile', label: 'Trang cá nhân', icon: <UserOutlined />, onClick: () => navigate('/profile') },
    ...(typeof user?.role === 'object' && user?.role.name === 'ADMIN' ? [
      { key: 'admin', label: 'Admin Dashboard', icon: <DashboardOutlined />, onClick: () => navigate('/admin') }
    ] : []),
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
  ];

  return (
    <Layout className="min-h-screen bg-white">
      {/* Top Bar Contact */}
      <div className="bg-blue-700 text-white py-2 px-10 hidden sm:block">
        <div className="flex justify-between items-center text-xs">
          <Space split={<span className="opacity-50">|</span>}>
            <span><PhoneOutlined className="mr-1" /> Hot-line: 1900 1234</span>
            <span><MailOutlined className="mr-1" /> support@ecommerce.com</span>
          </Space>
          <Space split={<span className="opacity-50">|</span>}>
            <Link to="/help" className="text-white hover:text-blue-100">Hỗ trợ</Link>
            <Link to="/news" className="text-white hover:text-blue-100">Tin tức</Link>
          </Space>
        </div>
      </div>

      {/* Main Header */}
      <Header className="bg-white px-4 sm:px-10 h-20 flex items-center shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingCartOutlined className="text-white text-2xl" />
            </div>
            <Title level={3} className="!mb-0 hidden md:block text-blue-700">MODERN SHOP</Title>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-10">
            <Search 
              placeholder="Bạn muốn mua gì hôm nay?" 
              enterButton="Tìm kiếm" 
              size="large"
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:block cursor-pointer">
              <Dropdown menu={{ items: categoriesItems }}>
                <Text strong className="hover:text-blue-600 transition-colors">DANH MỤC</Text>
              </Dropdown>
            </div>

            <Badge count={3} overflowCount={99}>
              <div 
                className="text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCartOutlined style={{ fontSize: '24px' }} />
              </div>
            </Badge>

            {isAuthenticated ? (
              <Dropdown menu={{ items: userItems }} placement="bottomRight" arrow>
                <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-100 pr-3 transition-colors">
                  <Avatar src={getAvatarUrl(user?.avatarUrl) || undefined} icon={<UserOutlined />} className="bg-blue-600" />
                  <span className="hidden sm:inline font-medium text-gray-700">{user?.fullName}</span>
                </div>
              </Dropdown>
            ) : (
              <Link to="/login">
                <Button type="primary" shape="round" icon={<UserOutlined />} className="bg-blue-600">
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Header>

      {/* Content */}
      <Content className="bg-[#f5f7fa]">
        <div className="container mx-auto py-0 min-h-[600px]">
          <Outlet />
        </div>
      </Content>

      {/* Footer */}
      <Footer className="bg-gray-900 text-gray-300 py-16 px-10">
        <div className="container mx-auto">
          <Row gutter={[48, 32]}>
            <Col xs={24} md={8}>
              <Title level={4} className="!text-black mb-6">MODERN SHOP</Title>
              <Text className="text-gray-400 block mb-4">
                Hệ thống bán lẻ thiết bị công nghệ và thời trang hàng đầu Việt Nam. Cam kết chất lượng, uy tín và dịch vụ sau bán hàng tốt nhất.
              </Text>
              <Space size="large" className="text-xl">
                <FacebookOutlined className="hover:text-blue-500 cursor-pointer" />
                <InstagramOutlined className="hover:text-pink-500 cursor-pointer" />
                <YoutubeOutlined className="hover:text-red-500 cursor-pointer" />
              </Space>
            </Col>
            
            <Col xs={12} md={5}>
              <Title level={5} className="!text-black mb-6">Dịch vụ khách hàng</Title>
              <ul className="list-none p-0 flex flex-col gap-3">
                <li><Link to="/" className="text-gray-400 hover:text-white">Hướng dẫn mua hàng</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Chính sách trả góp</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Chính sách bảo hành</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Giao hàng & lắp đặt</Link></li>
              </ul>
            </Col>

            <Col xs={12} md={5}>
              <Title level={5} className="!text-black mb-6">Thông tin liên hệ</Title>
              <ul className="list-none p-0 flex flex-col gap-3">
                <li className="text-gray-400">Địa chỉ: 123 Đường ABC, Hà Nội</li>
                <li className="text-gray-400">Hotline: 1900 1234</li>
                <li className="text-gray-400">Email: contact@shop.com</li>
              </ul>
            </Col>

            <Col xs={24} md={6}>
              <Title level={5} className="!text-black mb-6">Tải ứng dụng mobile</Title>
              <div className="flex flex-col gap-3">
                <div className="h-12 w-40 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700">App Store</div>
                <div className="h-12 w-40 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700">Google Play</div>
              </div>
            </Col>
          </Row>
          
          <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-500 text-sm">
            © 2024 MODERN SHOP. All rights reserved. Designed by Antigravity Team.
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
