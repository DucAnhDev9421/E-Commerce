import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  BellOutlined,
  SettingOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import type { Role } from '../types/auth';
import { getAvatarUrl } from '../utils/imageUtils';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'catalog',
      icon: <AppstoreOutlined />,
      label: 'Quản lý Catalog',
      children: [
        {
          key: '/admin/categories',
          icon: <TagsOutlined />,
          label: 'Danh mục',
        },
        {
          key: '/admin/products',
          icon: <ShoppingOutlined />,
          label: 'Sản phẩm',
        },
      ],
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: 'Hệ thống',
      children: [
        {
          key: '/admin/users',
          icon: <UserOutlined />,
          label: 'Người dùng',
        },
        {
          key: '/admin/roles',
          icon: <SafetyCertificateOutlined />,
          label: 'Phân quyền',
        },
      ],
    },
  ];

  // Find the default open keys based on current path
  const getOpenKeys = () => {
    if (location.pathname.startsWith('/admin/categories') || location.pathname.startsWith('/admin/products')) {
      return ['catalog'];
    }
    if (location.pathname.startsWith('/admin/users') || location.pathname.startsWith('/admin/roles')) {
      return ['system'];
    }
    return [];
  };

  const roleName = typeof user?.role === 'object' ? (user.role as Role).name : 'ADMIN';

  return (
    <Layout className="min-h-screen" style={{ background: '#f0f2f5' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={256}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(59,130,246,0.5)',
            }}
          >
            <ShoppingOutlined style={{ color: 'white', fontSize: 18 }} />
          </div>
          {!collapsed && (
            <div style={{ marginLeft: 12 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>MODERN SHOP</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* User info in sidebar */}
        {!collapsed && (
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Avatar
              src={user?.avatarUrl}
              icon={<UserOutlined />}
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', flexShrink: 0 }}
              size={38}
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.fullName || 'Admin'}
              </div>
              <div
                style={{
                  color: '#60a5fa',
                  fontSize: 11,
                  display: 'inline-block',
                  background: 'rgba(59,130,246,0.15)',
                  padding: '1px 8px',
                  borderRadius: 20,
                  border: '1px solid rgba(59,130,246,0.3)',
                }}
              >
                {roleName}
              </div>
            </div>
          </div>
        )}

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '12px 8px',
          }}
        />
      </Sider>

      <Layout className="flex flex-col">
        <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center px-4 shadow-sm z-10">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="w-16 h-16"
          />
          
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button icon={<HomeOutlined />} style={{ borderRadius: 8, fontWeight: 500 }}>
                Xem Website
              </Button>
            </Link>

            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Badge>

            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Hồ sơ cá nhân', icon: <UserOutlined /> },
                  { type: 'divider' },
                  { key: 'logout', label: 'Đăng xuất', danger: true, icon: <LogoutOutlined />, onClick: handleLogout },
                ],
              }}
              placement="bottomRight"
            >
              <div className="flex items-center cursor-pointer gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all">
                <Avatar src={getAvatarUrl(user?.avatarUrl) || undefined} icon={<UserOutlined />} />
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
          // 100vh - 64px (header) - 48px (margin top/bottom)
          minHeight: 'calc(100vh - 64px - 48px)', 
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
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
