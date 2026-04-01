import React from 'react';
import { Form, Input, Button, Card, Typography, notification } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await authApi.register(values);
      notification.success({
        message: 'Đăng ký thành công',
        description: 'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập!',
        placement: 'topRight',
      });
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      notification.error({
        message: 'Lỗi đăng ký',
        description: errorMessage,
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-xl shadow-xl rounded-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
            <EditOutlined style={{ fontSize: '24px' }} />
          </div>
          <Title level={2} className="m-0">Tạo tài khoản mới</Title>
          <Text type="secondary">Tham gia cộng đồng mua sắm của chúng tôi ngay hôm nay</Text>
        </div>

        <Form
          name="register_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6"
        >
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập Họ tên!' }]}
            className="md:col-span-2"
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Nguyễn Văn A" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không đúng định dạng!' },
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="example@gmail.com" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa số!' },
            ]}
          >
            <Input 
              prefix={<PhoneOutlined className="text-gray-400" />} 
              placeholder="0912345678" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Tên đăng nhập" 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập Mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải tối thiểu 6 ký tự!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Tạo mật khẩu"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item className="md:col-span-2 mt-4 mb-0">
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full h-12 rounded-lg font-bold bg-blue-600 hover:bg-blue-500"
              loading={loading}
            >
              ĐĂNG KÝ NGAY
            </Button>
          </Form.Item>

          <div className="md:col-span-2 text-center mt-6">
            <Text type="secondary">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Đăng nhập
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
