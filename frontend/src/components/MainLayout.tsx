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
import { fetchCart, clearCart } from '../store/cartSlice';
import { getAvatarUrl } from '../utils/imageUtils';
import categoryApi from '../api/categoryApi';


const { Header, Content, Footer } = Layout;
const { Search } = Input;
const { Title, Text } = Typography;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { totalQuantity } = useAppSelector((state) => state.cart);
  const [searchValue, setSearchValue] = React.useState('');


  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/login');
  };

  const [categoriesItems, setCategoriesItems] = React.useState<any[]>([
    { key: 'loading', label: 'Đang tải...' }
  ]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res: any = await categoryApi.getAll();
        const items = res.map((cat: any) => ({
          key: cat._id,
          label: cat.name,
          onClick: () => navigate(`/?category=${cat._id}`)
        }));
        setCategoriesItems(items.length > 0 ? items : [{ key: 'empty', label: 'Chưa có danh mục' }]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, [navigate]);

  // Fetch Cart when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const userItems = [
    { key: 'profile', label: 'Trang cá nhân', icon: <UserOutlined />, onClick: () => navigate('/profile') },
    ...(typeof user?.role === 'object' && user?.role.name === 'ADMIN' ? [
      { key: 'admin', label: 'Admin Dashboard', icon: <DashboardOutlined />, onClick: () => navigate('/admin') }
    ] : []),
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
  ];

  return (
    <Layout className="min-h-screen bg-transparent">
      {/* Top Bar Contact - Refined */}
      <div className="bg-primary/5 text-primary py-2 px-10 hidden sm:block border-b border-primary/10">
        <div className="container mx-auto flex justify-between items-center text-[11px] font-bold tracking-wider">
          <Space size="large">
            <span><PhoneOutlined className="mr-1.5" /> HOTLINE: 1900 1234</span>
            <span><MailOutlined className="mr-1.5" /> SUPPORT@MODERN.COM</span>
          </Space>
          <Space size="large">
            <Link to="/help" className="text-primary hover:text-cta transition-colors text-[11px] font-bold">HỖ TRỢ</Link>
            <Link to="/news" className="text-primary hover:text-cta transition-colors text-[11px] font-bold">TIN TỨC</Link>
          </Space>
        </div>
      </div>

      {/* Main Header - Liquid Glass */}
      <Header className="bg-white/70 backdrop-blur-xl px-4 sm:px-10 h-24 flex items-center sticky top-0 z-50 border-b border-white/40 shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-8">
          {/* Logo - Typography Only */}
          <Link to="/" className="flex items-center group transition-transform hover:scale-105">
            <div className="flex flex-col leading-none">
              <span className="font-serif text-3xl tracking-tighter text-text font-light">MODERN</span>
              <span className="font-serif text-xl tracking-[0.3em] text-primary font-black -mt-1">SHOP</span>
            </div>
          </Link>
          
          {/* Categories - Moved to Left */}
          <div className="hidden lg:block cursor-pointer group shrink-0">
            <Dropdown menu={{ items: categoriesItems }}>
              <div className="flex items-center gap-2">
                <Text strong className="group-hover:text-primary transition-colors tracking-widest text-xs">DANH MỤC</Text>
                <div className="w-1.5 h-1.5 rounded-full bg-cta opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </Dropdown>
          </div>

          {/* Search - Elegant */}
          <div className="flex-1 max-w-3xl hidden md:block">
            <Search 
              placeholder="Tìm kiếm xu hướng mới nhất..." 
              enterButton={
                <Button type="primary" className="h-full !bg-primary border-none rounded-r-full px-8 font-bold">
                  TÌM KIẾM
                </Button>
              }
              size="large"
              className="w-full search-glass"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={(value) => {
                if (value.trim()) {
                  navigate(`/?search=${encodeURIComponent(value)}`);
                } else {
                  navigate('/');
                }
              }}
            />
          </div>

          <div className="flex items-center gap-8">
            <Badge count={totalQuantity} overflowCount={99} color="#059669">
              <div 
                className="text-text hover:text-primary cursor-pointer transition-all hover:scale-110 flex items-center justify-center p-2 rounded-full hover:bg-primary/5"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCartOutlined style={{ fontSize: '26px' }} />
              </div>
            </Badge>

            {isAuthenticated ? (
              <Dropdown menu={{ items: userItems }} placement="bottomRight" arrow>
                <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-full hover:bg-white/60 transition-all border border-transparent hover:border-white/40 glass-panel pl-1.5 pr-4">
                  <Avatar src={getAvatarUrl(user?.avatarUrl) || undefined} icon={<UserOutlined />} className="bg-primary shadow-sm" />
                  <span className="hidden sm:inline font-bold text-text text-sm tracking-tight">{user?.fullName?.split(' ').pop()}</span>
                </div>
              </Dropdown>
            ) : (
              <Link to="/login">
                <Button type="primary" shape="round" size="large" icon={<UserOutlined />} className="!bg-primary h-12 px-8 font-bold text-sm shadow-lg border-none hover:scale-105 transition-all">
                  ĐĂNG NHẬP
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Header>

      {/* Content */}
      <Content className="bg-transparent relative z-10">
        <div className="container mx-auto py-0 min-h-[600px]">
          <Outlet />
        </div>
      </Content>

      {/* Footer - Liquid Glass Dark */}
      <Footer className="bg-text text-white py-24 px-10 relative overflow-hidden">
        {/* Background Blur for Footer */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="container mx-auto relative z-10">
          <Row gutter={[64, 48]}>
            <Col xs={24} md={8}>
              <div className="flex flex-col mb-8">
                <span className="font-serif text-4xl tracking-tighter text-white font-light">MODERN</span>
                <span className="font-serif text-2xl tracking-[0.3em] text-primary font-black -mt-1">SHOP</span>
              </div>
              <Text className="text-white/60 block mb-10 leading-relaxed font-light text-base max-w-sm">
                Trải nghiệm kỷ nguyên mua sắm mới với phong cách thanh lịch và công nghệ đón đầu tương lai.
              </Text>
              <Space size="large" className="text-2xl">
                <FacebookOutlined className="hover:text-primary transition-colors cursor-pointer" />
                <InstagramOutlined className="hover:text-cta transition-colors cursor-pointer" />
                <YoutubeOutlined className="hover:text-secondary transition-colors cursor-pointer" />
              </Space>
            </Col>
            
            <Col xs={12} md={5}>
              <Title level={5} className="!text-white mb-8 !font-serif !tracking-widest !text-sm uppercase opacity-50">DỊCH VỤ</Title>
              <ul className="list-none p-0 flex flex-col gap-4 font-light">
                <li><Link to="/" className="text-white/70 hover:text-primary transition-colors">Hướng dẫn mua hàng</Link></li>
                <li><Link to="/" className="text-white/70 hover:text-primary transition-colors">Chính sách trả góp</Link></li>
                <li><Link to="/" className="text-white/70 hover:text-primary transition-colors">Chính sách bảo hành</Link></li>
                <li><Link to="/" className="text-white/70 hover:text-primary transition-colors">Giao hàng & lắp đặt</Link></li>
              </ul>
            </Col>

            <Col xs={12} md={5}>
              <Title level={5} className="!text-white mb-8 !font-serif !tracking-widest !text-sm uppercase opacity-50">LIÊN HỆ</Title>
              <ul className="list-none p-0 flex flex-col gap-4 font-light">
                <li className="text-white/70">123 Street Aura, Aura Building, HN</li>
                <li className="text-white/70">Hotline: 1900 1234</li>
                <li className="text-white/70">Email: concierge@modern.com</li>
              </ul>
            </Col>

            <Col xs={24} md={6}>
              <Title level={5} className="!text-white mb-8 !font-serif !tracking-widest !text-sm uppercase opacity-50">EXPERIENCE MOBILE</Title>
              <div className="flex flex-col gap-4">
                <div className="h-14 w-full glass-panel flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all rounded-2xl border border-white/10 text-white font-bold tracking-widest text-xs">APP STORE</div>
                <div className="h-14 w-full glass-panel flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all rounded-2xl border border-white/10 text-white font-bold tracking-widest text-xs">GOOGLE PLAY</div>
              </div>
            </Col>
          </Row>
          
          <div className="border-t border-white/10 mt-24 pt-10 text-center text-white/30 text-xs font-bold tracking-[0.4em] uppercase">
            © 2026 MODERN SHOP • ELEGANCE IN EVERY PIXEL
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
