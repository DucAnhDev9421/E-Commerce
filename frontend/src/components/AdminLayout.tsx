import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  HomeOutlined,
  ShoppingOutlined,
  BellOutlined,
  SettingOutlined,
  TagsOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import type { Role } from '../types/auth';
import { getAvatarUrl } from '../utils/imageUtils';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const isExpanded = !collapsed || isHovered;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined className="text-lg" />,
      label: 'Tổng quan',
    },
    {
        key: 'catalog-header',
        type: 'group' as const,
        label: isExpanded ? (
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">
                DANH MỤC
            </Text>
        ) : null,
        children: [
            {
              key: '/admin/categories',
              icon: <TagsOutlined className="text-lg" />,
              label: 'Danh mục',
            },
            {
              key: '/admin/products',
              icon: <ShoppingOutlined className="text-lg" />,
              label: 'Sản phẩm',
            },
        ]
    },
    {
        key: 'system-header',
        type: 'group' as const,
        label: isExpanded ? (
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">
                HỆ THỐNG
            </Text>
        ) : null,
        children: [
            {
              key: '/admin/users',
              icon: <UserOutlined className="text-lg" />,
              label: 'Người dùng',
            },
            {
              key: '/admin/roles',
              icon: <SafetyCertificateOutlined className="text-lg" />,
              label: 'Phân quyền',
            },
        ]
    },
  ];

  const roleName = typeof user?.role === 'object' ? (user.role as Role).name : 'ADMIN';

  return (
    <Layout className="min-h-screen bg-[#f8fbfa] overflow-hidden relative">
      {/* Background Organic Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[100px] opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-blue-50 rounded-full blur-[80px] opacity-30 pointer-events-none" />
      
      {/* Smart Floating Sider */}
      <Sider
        trigger={null}
        collapsible
        collapsed={!isExpanded}
        width={280}
        theme="light"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-6 top-6 bottom-6 z-50 transition-all duration-500 ease-in-out !bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/80 shadow-2xl glass-panel shrink-0 flex flex-col ${isExpanded ? 'w-[280px]' : 'w-[80px]'}`}
        style={{
            height: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column'
        }}
      >
        <div className={`h-24 flex items-center flex-none ${!isExpanded ? 'justify-center' : 'px-8'} mb-4 border-b border-white/20 transition-all duration-500`}>
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
             <ShopOutlined className="text-white text-xl" />
          </div>
          {isExpanded && (
            <div className="ml-4 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
               <Text className="block font-serif text-lg tracking-tighter text-slate-800 leading-none font-bold">MODERN</Text>
               <Text className="block text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] -mt-1">ADMIN BOX</Text>
            </div>
          )}
        </div>

        {/* Scrollable middle section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden admin-sidebar-scroll custom-scrollbar">
            {/* User Quick Access Expansion */}
            <div className={`px-4 mb-4 mt-4 transition-all duration-500 ${!isExpanded ? 'opacity-0 scale-95 h-0 overflow-hidden' : 'opacity-100 scale-100 h-auto'}`}>
                <div className="p-4 rounded-[2rem] bg-emerald-600/5 border border-emerald-600/5 flex items-center gap-3">
                    <Avatar 
                        src={getAvatarUrl(user?.avatarUrl) || undefined} 
                        icon={<UserOutlined />} 
                        className="bg-emerald-600 shadow-md ring-2 ring-white"
                        size={44}
                    />
                    <div className="overflow-hidden">
                        <Text strong className="block text-sm truncate uppercase tracking-tight">{user?.fullName}</Text>
                        <Badge status="success" text={<Text className="text-[10px] font-bold text-emerald-600 uppercase">{roleName}</Text>} />
                    </div>
                </div>
            </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="bg-transparent border-none px-2 admin-sidebar-menu"
        />

        </div>

        {/* Bottom Actions - Now flex-none and mt-auto */}
        <div className={`flex-none p-6 mt-auto transition-all duration-500 ${!isExpanded ? 'text-center' : ''}`}>
            <Button 
                block 
                type="text" 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                className={`h-12 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 flex items-center ${!isExpanded ? 'justify-center w-12 mx-auto px-0' : 'justify-center'}`}
            >
                {isExpanded && "ĐĂNG XUẤT"}
            </Button>
        </div>
      </Sider>

      {/* Main Layout Area - Fixed Padding to prevent shifts */}
      <Layout className="bg-transparent transition-all duration-300 pl-[124px] pr-6 pt-6 pb-6 min-h-screen">
        {/* Header - Glass Bar */}
        <Header className="h-20 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-lg px-8 flex items-center justify-between mb-8 transition-all relative z-40">
           <div className="flex items-center gap-4">
               <Button 
                    type="text" 
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
                    onClick={() => setCollapsed(!collapsed)}
                    className={`w-10 h-10 flex items-center justify-center bg-white/50 rounded-xl hover:bg-white/80 transition-all border border-white/40 shadow-sm ${!collapsed ? 'text-emerald-600 bg-emerald-50' : ''}`}
               />
               <div className="hidden md:flex flex-col ml-4">
                   <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">TRANG ĐANG XEM</Text>
                   <Text strong className="text-lg font-serif">
                       {location.pathname === '/admin' ? 'Tổng quan Dashboard' : 
                        location.pathname === '/admin/products' ? 'Quản lý Sản phẩm' :
                        location.pathname === '/admin/categories' ? 'Quản lý Danh mục' :
                        location.pathname === '/admin/users' ? 'Quản lý Người dùng' :
                        location.pathname === '/admin/roles' ? 'Quản lý Phân quyền' : 'Hệ thống'}
                   </Text>
               </div>
           </div>

           <div className="flex items-center gap-6">
                <Link to="/">
                    <Button 
                        icon={<HomeOutlined />} 
                        className="h-10 rounded-xl bg-slate-900 text-white border-none font-bold text-xs tracking-widest uppercase shadow-md hover:scale-105 transition-all flex items-center gap-2"
                    >
                        XEM WEBSITE
                    </Button>
                </Link>

                <div className="h-8 w-px bg-slate-200" />

                <Badge count={5} size="small" offset={[-2, 2]}>
                    <Button 
                        type="text" 
                        icon={<BellOutlined className="text-xl text-slate-400" />} 
                        className="w-10 h-10 flex items-center justify-center bg-white/50 rounded-xl border border-white/40 shadow-sm"
                    />
                </Badge>

                <Dropdown 
                    menu={{
                        items: [
                            { key: 'profile', label: 'Hồ sơ cá nhân', icon: <UserOutlined /> },
                            { key: 'settings', label: 'Cài đặt', icon: <SettingOutlined /> },
                            { type: 'divider' },
                            { key: 'logout', label: 'Đăng xuất', danger: true, icon: <LogoutOutlined />, onClick: handleLogout },
                        ]
                    }}
                    placement="bottomRight"
                >
                    <Avatar 
                        src={getAvatarUrl(user?.avatarUrl) || undefined} 
                        icon={<UserOutlined />} 
                        className="cursor-pointer bg-emerald-600 shadow-md ring-4 ring-white/50 hover:scale-110 transition-transform" 
                        size={40}
                    />
                </Dropdown>
           </div>
        </Header>

        {/* Dynamic Content */}
        <Content className="relative z-30">
             <div className="glass-panel min-h-[calc(100vh-144px)] p-8 rounded-[3.5rem] bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl relative overflow-hidden">
                <Outlet />
             </div>
        </Content>
      </Layout>

      <style>{`
        .admin-sidebar-menu .ant-menu-item {
          height: 52px !important;
          margin-bottom: 8px !important;
          border-radius: 1.5rem !important;
          width: calc(100% - 12px) !important;
          margin-left: 6px !important;
          color: #475569 !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          border: 1px solid transparent !important;
        }
        .admin-sidebar-menu .ant-menu-item-selected {
          background: rgba(5, 150, 105, 0.1) !important;
          color: #059669 !important;
          border: 1px solid rgba(5, 150, 105, 0.1) !important;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.05) !important;
        }
        .admin-sidebar-menu .ant-menu-item-active {
            background: rgba(0, 0, 0, 0.02) !important;
        }
        .admin-sidebar-menu .ant-menu-item .ant-menu-item-icon {
            transition: transform 0.3s ease;
            font-size: 1.2rem !important;
        }
        .admin-sidebar-menu .ant-menu-item-selected .ant-menu-item-icon {
            transform: scale(1.1);
            color: #059669 !important;
        }
        .admin-sidebar-menu .ant-menu-item-group-title {
            padding-top: 16px !important;
            padding-bottom: 8px !important;
            transition: opacity 0.3s ease;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        
        .ant-menu-inline-collapsed .ant-menu-item {
            padding: 0 calc(50% - 11px) !important;
            margin-left: 6px !important;
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(5, 150, 105, 0.1);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(5, 150, 105, 0.2);
        }
      `}</style>
    </Layout>
  );
};

export default AdminLayout;
