import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Profile from './pages/Client/Profile';
import PrivateRoutes from './middleware/PrivateRoutes';

import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import Roles from './pages/Admin/Roles';
import AdminUsers from './pages/Admin/Users';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#059669', // Emerald-600
          colorInfo: '#10B981',    // Emerald-500
          borderRadius: 16,        // Rounded for glass effect
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        components: {
          Button: {
            controlHeight: 44,       // Slightly larger, modern
            fontWeight: 600,
            borderRadius: 9999,      // Pill shape buttons
          },
          Card: {
            colorBgContainer: 'rgba(255, 255, 255, 0.6)',
            boxShadowSecondary: 'none',
          }
        }
      }}
    >
      <AntdApp>
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
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AntdApp>
  </ConfigProvider>
  );
}

export default App;
