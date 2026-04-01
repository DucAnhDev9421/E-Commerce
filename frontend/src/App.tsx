import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import PrivateRoutes from './middleware/PrivateRoutes';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import Roles from './pages/Admin/Roles';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563eb', // Blue-600
          borderRadius: 12,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        components: {
          Button: {
            controlHeight: 40,
            fontWeight: 600,
          },
          Card: {
            boxShadowSecondary: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          }
        }
      }}
    >
      <Router>
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<div className="p-20 text-center"><h1>Trang Thanh Toán</h1><p>Đang phát triển...</p></div>} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes for Auth Users */}
          <Route element={<PrivateRoutes />}>
            <Route element={<MainLayout />}>
              <Route path="/profile" element={<div className="p-20 text-center"><h1>Trang Cá Nhân</h1><p>Thông tin của bạn sẽ hiển thị ở đây.</p></div>} />
            </Route>
          </Route>

          {/* Protected Routes for ADMIN only */}
          <Route element={<PrivateRoutes allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/roles" element={<Roles />} />
              <Route path="/admin/users" element={<div className="p-5"><h1>User Management</h1><p>Tính năng đang phát triển.</p></div>} />
            </Route>
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
