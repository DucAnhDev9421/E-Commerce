import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Statistic, Tag, Avatar, Spin, Empty, Progress, List, Button } from 'antd';
import {
  UserOutlined, SafetyCertificateOutlined, ShoppingCartOutlined,
  TagsOutlined, ShoppingOutlined, ArrowUpOutlined, ArrowDownOutlined,
  RiseOutlined, AppstoreOutlined, CheckCircleOutlined, ArrowRightOutlined,
  ThunderboltOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import type { Role } from '../../types/auth';
import categoryApi from '../../api/categoryApi';
import productApi from '../../api/productApi';
import userApi from '../../api/userApi';
import roleApi from '../../api/roleApi';

const { Title, Text } = Typography;

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  suffix?: string;
  trend?: number;
  loading?: boolean;
}> = ({ title, value, icon, color, bg, suffix, trend, loading }) => (
  <Card
    className="rounded-[2.5rem] border-none shadow-xl bg-white/40 backdrop-blur-md overflow-hidden relative group hover:scale-102 transition-all duration-500"
    bodyStyle={{ padding: 32 }}
  >
    {/* Decorative Background Shape */}
    <div 
        className="absolute top-[-10%] right-[-10%] w-24 h-24 rounded-full blur-3xl opacity-20 transition-all duration-700 group-hover:scale-150 group-hover:opacity-40" 
        style={{ background: color }}
    />
    
    <div className="flex justify-between items-start relative z-10">
      <div className="flex-1">
        <Text className="text-[10px] font-bold text-text/30 uppercase tracking-[0.2em] mb-2 block">
          {title}
        </Text>
        {loading ? (
          <div className="mt-2"><Spin size="small" /></div>
        ) : (
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-4xl font-serif font-black text-text tracking-tighter">
                {value}
            </span>
            {suffix && <span className="text-lg font-bold text-text/40">{suffix}</span>}
          </div>
        )}
        
        {trend !== undefined && !loading && (
          <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? <ArrowUpOutlined size={10} /> : <ArrowDownOutlined size={10} />}
            {Math.abs(trend)}% <span className="opacity-40 ml-1">so với tháng trước</span>
          </div>
        )}
      </div>
      
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" 
        style={{ background: color, color: '#fff', boxShadow: `0 8px 16px ${color}40` }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState({ users: 0, categories: 0, products: 0, roles: 0, inStock: 0, outOfStock: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const roleName = typeof user?.role === 'object' ? (user.role as Role).name : 'ADMIN';
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [userRes, catRes, prodRes, roleRes]: any[] = await Promise.allSettled([
          userApi.getAll(),
          categoryApi.getAll(),
          productApi.getAll(),
          roleApi.getAll(),
        ]);

        const users = userRes.status === 'fulfilled' ? userRes.value : [];
        const cats = catRes.status === 'fulfilled' ? catRes.value : [];
        const prods = prodRes.status === 'fulfilled' ? (prodRes.value.items || []) : [];
        const roles = roleRes.status === 'fulfilled' ? roleRes.value : [];

        setCategories(cats);
        setProducts(prods);
        setStats({
          users: users.length,
          categories: cats.length,
          products: prods.length,
          roles: roles.length,
          inStock: prods.filter((p: any) => p.status === 'in_stock').length,
          outOfStock: prods.filter((p: any) => p.status === 'out_of_stock').length,
        });
      } catch {
        // silently fail - show zeros
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock || 0), 0);
  const activeCategories = categories.filter(c => c.status === 'active').length;

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-10">
      {/* Immersive Greeting */}
      <div className="relative p-10 md:p-12 rounded-[3.5rem] bg-text overflow-hidden group shadow-2xl">
         {/* Abstract Glass Background Shapes */}
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px] -z-10 group-hover:scale-110 transition-transform duration-1000" />
         <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] -z-10" />
         
         <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
             <div className="relative">
                <Avatar 
                    src={user?.avatarUrl} 
                    icon={<UserOutlined />} 
                    size={120} 
                    className="bg-emerald-600 shadow-2xl ring-8 ring-white/5"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-text shadow-lg">
                    <CheckCircleOutlined className="text-white text-lg" />
                </div>
             </div>

             <div className="flex-1 text-center md:text-left">
                <Text className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs block mb-4">HỆ THỐNG QUẢN TRỊ TRỰC TUYẾN</Text>
                <Title level={1} className="!m-0 !font-serif !text-5xl md:!text-6xl !text-white tracking-tighter leading-none mb-4">
                    {greeting}, {user?.fullName?.split(' ').pop()}!
                </Title>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-8 flex-wrap">
                    <div className="px-6 py-2 bg-emerald-600 text-white rounded-full font-bold text-xs tracking-widest uppercase shadow-xl shadow-emerald-900/20">
                        {roleName}
                    </div>
                    <div className="px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 rounded-full font-bold text-xs tracking-widest uppercase flex items-center gap-2">
                        <HistoryOutlined /> {now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
             </div>

             <div className="hidden lg:flex flex-col gap-4">
                <Button 
                    type="primary" 
                    icon={<AppstoreOutlined />} 
                    className="h-14 px-10 rounded-3xl bg-white text-text border-none font-bold text-xs tracking-widest uppercase shadow-xl hover:scale-105 transition-all w-full flex items-center justify-center"
                    onClick={() => navigate('/admin/products')}
                >
                    QUẢN LÝ KHO HÀNG
                </Button>
                <Button 
                    className="h-14 px-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-white font-bold text-xs tracking-widest uppercase shadow-xl hover:bg-white/10 transition-all w-full flex items-center justify-center"
                    onClick={() => navigate('/admin/users')}
                >
                    NGƯỜI DÙNG MỚI
                </Button>
             </div>
         </div>
      </div>

      {/* Stats row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Người dùng" value={stats.users} icon={<UserOutlined />} color="#059669" bg="#059669" trend={12} loading={loading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Danh mục" value={stats.categories} icon={<TagsOutlined />} color="#10b981" bg="#10b981" trend={5} loading={loading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Sản phẩm" value={stats.products} icon={<ShoppingOutlined />} color="#1d4ed8" bg="#1d4ed8" trend={8} loading={loading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Giá trị kho"
            value={loading ? 0 : Math.round(totalValue / 1000000)}
            suffix="M₫"
            icon={<RiseOutlined />}
            color="#7c3aed"
            bg="#7c3aed"
            trend={3}
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[32, 32]}>
        {/* Inventory Status - Modern Glass */}
        <Col xs={24} lg={12}>
           <Card 
             title={<Text className="font-serif text-2xl tracking-tight !m-0">Tình trạng kho hàng</Text>}
             className="rounded-[3rem] border-none shadow-2xl bg-white/50 backdrop-blur-xl h-full"
             bodyStyle={{ padding: 40 }}
             extra={<Button type="link" className="text-emerald-600 font-bold">XEM CHI TIẾT</Button>}
           >
                {loading ? <div className="text-center py-20"><Spin size="large" /></div> : (
                  <div className="space-y-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl">
                             <CheckCircleOutlined />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <Text strong className="text-lg">Sản phẩm còn hàng</Text>
                                <Text strong className="text-emerald-600 text-lg">{stats.inStock} / {stats.products}</Text>
                            </div>
                            <Progress 
                                percent={stats.products ? Math.round((stats.inStock / stats.products) * 100) : 0} 
                                strokeColor="#059669" 
                                trailColor="rgba(5, 150, 105, 0.05)"
                                strokeWidth={12}
                                className="progress-rounded"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600 text-2xl">
                             <ThunderboltOutlined />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <Text strong className="text-lg">Sản phẩm hết hàng</Text>
                                <Text strong className="text-red-600 text-lg">{stats.outOfStock} / {stats.products}</Text>
                            </div>
                            <Progress 
                                percent={stats.products ? Math.round((stats.outOfStock / stats.products) * 100) : 0} 
                                strokeColor="#ef4444" 
                                trailColor="rgba(239, 68, 68, 0.05)"
                                strokeWidth={12}
                                className="progress-rounded"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 text-2xl">
                             <TagsOutlined />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <Text strong className="text-lg">Danh mục đang chạy</Text>
                                <Text strong className="text-blue-600 text-lg">{activeCategories} / {stats.categories}</Text>
                            </div>
                            <Progress 
                                percent={stats.categories ? Math.round((activeCategories / stats.categories) * 100) : 0} 
                                strokeColor="#1d4ed8" 
                                trailColor="rgba(29, 78, 216, 0.05)"
                                strokeWidth={12}
                                className="progress-rounded"
                            />
                        </div>
                    </div>
                  </div>
                )}
           </Card>
        </Col>

        {/* Recent Products - Glass List */}
        <Col xs={24} lg={12}>
           <Card 
             title={<Text className="font-serif text-2xl tracking-tight !m-0">Sản phẩm mới cập nhật</Text>}
             className="rounded-[3rem] border-none shadow-2xl bg-white/50 backdrop-blur-xl h-full overflow-hidden"
             bodyStyle={{ padding: 0 }}
             extra={<Button shape="circle" icon={<ArrowRightOutlined />} className="bg-emerald-600 text-white border-none shadow-lg" onClick={() => navigate('/admin/products')} />}
           >
                <div className="p-8 pb-0">
                    <Text className="text-[10px] font-bold text-text/30 uppercase tracking-[0.2em] mb-8 block">DANH SÁCH 4 SẢN PHẨM GẦN NHẤT</Text>
                </div>
                {loading ? (
                    <div className="text-center py-20"><Spin /></div>
                ) : (
                    <div className="divide-y divide-gray-100/50">
                        {recentProducts.map((item: any) => (
                            <div key={item._id} className="p-6 hover:bg-emerald-600/5 transition-all flex items-center gap-6 group cursor-pointer" onClick={() => navigate('/admin/products')}>
                                <div className="w-20 h-20 bg-white rounded-3xl overflow-hidden shadow-sm p-2 group-hover:scale-105 transition-transform">
                                    {item.images?.[0] ? (
                                        <img 
                                            src={item.images[0].startsWith('http') ? item.images[0] : `http://localhost:5000${item.images[0]}`} 
                                            alt={item.name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-text/10 text-2xl">
                                             <ShoppingOutlined />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <Text strong className="text-lg block truncate">{item.name}</Text>
                                    <div className="flex items-center gap-3 mt-1">
                                        <Text className="text-emerald-600 font-bold">{(item.price).toLocaleString('vi-VN')}₫</Text>
                                        <div className="w-1.5 h-1.5 rounded-full bg-text/10" />
                                        <Text className="text-xs text-text/40">{item.categoryId?.name}</Text>
                                    </div>
                                </div>
                                <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.status === 'in_stock' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {item.status === 'in_stock' ? 'Còn' : 'Hết'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {recentProducts.length === 0 && !loading && (
                    <div className="py-20 flex flex-col items-center">
                        <Empty description="Chưa có dữ liệu" />
                    </div>
                )}
           </Card>
        </Col>
      </Row>

      <style>{`
        .ant-progress-bg {
            border-radius: 9999px !important;
        }
        .progress-rounded .ant-progress-inner {
            border-radius: 9999px !important;
        }
        .hover\:scale-102:hover {
            transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
