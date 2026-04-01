import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Typography, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import type { Role } from '../types/auth';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Menu items
  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý Người dùng',
    },
    {
      key: '/admin/roles',
      icon: <SafetyCertificateOutlined />,
      label: 'Quản lý Quyền (Roles)',
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="dark"
        width={260}
      >
        <div className="flex items-center justify-center h-16 bg-[#001529]">
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            {collapsed ? 'ADM' : 'ADMIN PANEL'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="mt-4"
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center px-4 shadow-sm z-10">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="w-16 h-16"
          />
          
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button icon={<HomeOutlined />}>Xem Website</Button>
            </Link>
            
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Hồ sơ cá nhân' },
                  { type: 'divider' },
                  { key: 'logout', label: 'Đăng xuất', danger: true, icon: <LogoutOutlined />, onClick: handleLogout },
                ],
              }}
            >
              <div className="flex items-center cursor-pointer gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all">
                <Avatar src={user?.avatarUrl} icon={<UserOutlined />} />
                <div className="hidden sm:block">
                  <div className="font-semibold text-sm leading-none">{user?.fullName}</div>
                  <div className="text-xs text-gray-400">
                    {typeof user?.role === 'object' ? (user.role as Role).name : 'ADMIN'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'initial'
          }}
          className="shadow-sm border border-gray-100"
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
