import React from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import authApi from '../api/authApi';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const onFinish = async (values: any) => {
    dispatch(loginStart());
    try {
      const response: any = await authApi.login(values);
      // axiosClient trả về response.data, nên kết quả là { success, data: { user, accessToken } }
      const { user, accessToken } = response.data;
      
      dispatch(loginSuccess({ user, accessToken }));
      notification.success({
        message: 'Đăng nhập thành công',
        description: `Chào mừng ${user?.fullName || 'khách'} đã quay trở lại!`,
        placement: 'topRight',
      });

      // Điều hướng dựa trên quyền (Role)
      const roleName = typeof user?.role === 'object' ? user.role.name : user?.role;
      if (roleName === 'ADMIN' || roleName === 'MANAGER') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {

      const errorMessage = error?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
      dispatch(loginFailure(errorMessage));
      notification.error({
        message: 'Lỗi đăng nhập',
        description: errorMessage,
        placement: 'topRight',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
            <LockOutlined style={{ fontSize: '24px' }} />
          </div>
          <Title level={2} className="m-0">Đăng nhập</Title>
          <Text type="secondary">Vui lòng nhập thông tin tài khoản của bạn</Text>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Username" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
              className="rounded-lg"
            />
          </Form.Item>

          <div className="flex justify-between items-center mb-6">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Ghi nhớ tôi</Checkbox>
            </Form.Item>
            <a className="text-blue-600 hover:text-blue-500" href="">Quên mật khẩu?</a>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-12 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500"
              loading={loading}
            >
              ĐĂNG NHẬP
            </Button>
          </Form.Item>

          <div className="text-center mt-4">
            <Text type="secondary">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Đăng ký ngay
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
