import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Statistic, Tag, Avatar, Spin, Empty, Progress, List } from 'antd';
import {
  UserOutlined, SafetyCertificateOutlined, ShoppingCartOutlined,
  TagsOutlined, ShoppingOutlined, ArrowUpOutlined, ArrowDownOutlined,
  RiseOutlined, AppstoreOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
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
    style={{
      borderRadius: 20, border: 'none', overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%'
    }}
    bodyStyle={{ padding: 24 }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Text>
        {loading ? (
          <div style={{ marginTop: 12 }}><Spin size="small" /></div>
        ) : (
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1.2 }}>
            {value}{suffix}
          </div>
        )}
        {trend !== undefined && !loading && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            {trend >= 0
              ? <ArrowUpOutlined style={{ color: '#10b981', fontSize: 12 }} />
              : <ArrowDownOutlined style={{ color: '#ef4444', fontSize: 12 }} />
            }
            <Text style={{ fontSize: 12, color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
              {Math.abs(trend)}% so với tháng trước
            </Text>
          </div>
        )}
      </div>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 24, color
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

const Dashboard: React.FC = () => {
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
    .slice(0, 5);

  const quickLinks = [
    { label: 'Quản lý Danh mục', icon: <TagsOutlined />, color: '#3b82f6', bg: '#eff6ff', path: '/admin/categories', count: stats.categories },
    { label: 'Quản lý Sản phẩm', icon: <ShoppingOutlined />, color: '#10b981', bg: '#f0fdf4', path: '/admin/products', count: stats.products },
    { label: 'Quản lý Người dùng', icon: <UserOutlined />, color: '#f59e0b', bg: '#fffbeb', path: '/admin/users', count: stats.users },
    { label: 'Phân quyền', icon: <SafetyCertificateOutlined />, color: '#8b5cf6', bg: '#f5f3ff', path: '/admin/roles', count: stats.roles },
  ];

  return (
    <div>
      {/* Hero Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
        borderRadius: 24, padding: '32px 36px', marginBottom: 28,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)'
        }} />
        <div style={{
          position: 'absolute', right: 60, bottom: -60,
          width: 280, height: 280, borderRadius: '50%',
          background: 'rgba(59,130,246,0.15)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
          <Avatar
            src={user?.avatarUrl}
            icon={<UserOutlined />}
            size={64}
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: '3px solid rgba(255,255,255,0.2)', flexShrink: 0 }}
          />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 4 }}>
              {greeting}, 👋
            </div>
            <Title level={2} style={{ margin: 0, color: 'white', fontWeight: 800 }}>
              {user?.fullName || 'Admin'}!
            </Title>
            <div style={{ marginTop: 6 }}>
              <Tag color="blue" style={{ borderRadius: 20, fontWeight: 700, border: '1px solid rgba(59,130,246,0.5)', background: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}>
                {roleName}
              </Tag>
              <Text style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 8, fontSize: 13 }}>
                {now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Tổng người dùng" value={stats.users} icon={<UserOutlined />} color="#3b82f6" bg="#eff6ff" trend={12} loading={loading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Tổng danh mục" value={stats.categories} icon={<TagsOutlined />} color="#10b981" bg="#f0fdf4" trend={5} loading={loading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Tổng sản phẩm" value={stats.products} icon={<ShoppingOutlined />} color="#f59e0b" bg="#fffbeb" trend={8} loading={loading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Giá trị kho hàng"
            value={loading ? 0 : Math.round(totalValue / 1000000)}
            suffix="M₫"
            icon={<RiseOutlined />}
            color="#8b5cf6"
            bg="#f5f3ff"
            trend={3}
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        {/* Quick Links */}
        <Col xs={24} lg={8}>
          <Card
            title={<><AppstoreOutlined style={{ marginRight: 8, color: '#3b82f6' }} /><b>Truy cập nhanh</b></>}
            style={{ borderRadius: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}
            bodyStyle={{ padding: '16px 24px 24px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {quickLinks.map((link, i) => (
                <a key={i} href={link.path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 14,
                    background: link.bg, transition: 'all 0.2s',
                    cursor: 'pointer', border: `1px solid ${link.color}18`
                  }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: link.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 18, flexShrink: 0
                    }}>
                      {link.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{link.label}</div>
                    </div>
                    <div style={{
                      background: link.color, color: 'white',
                      borderRadius: 20, padding: '2px 10px',
                      fontSize: 13, fontWeight: 700
                    }}>
                      {loading ? '...' : link.count}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </Col>

        {/* Inventory Status */}
        <Col xs={24} lg={8}>
          <Card
            title={<><ShoppingOutlined style={{ marginRight: 8, color: '#3b82f6' }} /><b>Tình trạng kho</b></>}
            style={{ borderRadius: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}
            bodyStyle={{ padding: '16px 24px 24px' }}
          >
            {loading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: 600 }}>Còn hàng</Text>
                    <Text strong style={{ color: '#10b981' }}>{stats.inStock} / {stats.products}</Text>
                  </div>
                  <Progress
                    percent={stats.products ? Math.round((stats.inStock / stats.products) * 100) : 0}
                    strokeColor="#10b981" trailColor="#f0fdf4"
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: 600 }}>Hết hàng</Text>
                    <Text strong style={{ color: '#ef4444' }}>{stats.outOfStock} / {stats.products}</Text>
                  </div>
                  <Progress
                    percent={stats.products ? Math.round((stats.outOfStock / stats.products) * 100) : 0}
                    strokeColor="#ef4444" trailColor="#fef2f2"
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: 600 }}>Danh mục đang hoạt động</Text>
                    <Text strong style={{ color: '#3b82f6' }}>{activeCategories} / {stats.categories}</Text>
                  </div>
                  <Progress
                    percent={stats.categories ? Math.round((activeCategories / stats.categories) * 100) : 0}
                    strokeColor="#3b82f6" trailColor="#eff6ff"
                  />
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Recent Products */}
        <Col xs={24} lg={8}>
          <Card
            title={<><CheckCircleOutlined style={{ marginRight: 8, color: '#3b82f6' }} /><b>Sản phẩm mới nhất</b></>}
            style={{ borderRadius: 20, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}
            bodyStyle={{ padding: '8px 24px 24px' }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : recentProducts.length === 0 ? (
              <Empty description="Chưa có sản phẩm nào" style={{ padding: '40px 0' }} />
            ) : (
              <List
                dataSource={recentProducts}
                renderItem={(item: any) => (
                  <List.Item style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {item.images?.[0]
                          ? <img src={item.images[0].startsWith('http') ? item.images[0] : `${(import.meta.env.VITE_API_URL || '').replace('/api/v1', '')}${item.images[0]}`}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => { e.target.style.display = 'none'; }}
                          />
                          : <ShoppingOutlined style={{ color: '#cbd5e1' }} />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>
                          {item.price?.toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                      <Tag
                        color={item.status === 'in_stock' ? 'success' : 'error'}
                        style={{ borderRadius: 20, fontSize: 11 }}
                      >
                        {item.status === 'in_stock' ? 'Còn' : 'Hết'}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
