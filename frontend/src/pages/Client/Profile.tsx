import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Button, 
  Form, 
  Input, 
  Upload, 
  notification, 
  Spin,
  Divider,
  Tag,
  Modal,
  Switch,
  Select
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  CameraOutlined, 
  LockOutlined, 
  EnvironmentOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined 
} from '@ant-design/icons';
import type { RcFile, UploadProps } from 'antd/es/upload/interface';
import { updateUser } from '../../store/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import userApi from '../../api/userApi';
import addressApi from '../../api/addressApi';
import uploadApi from '../../api/uploadApi';
import type { User, Address } from '../../types/auth';
import { getAvatarUrl } from '../../utils/imageUtils';

const { Title, Text } = Typography;



const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [personalForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [activeTab, setActiveTab ] = useState('1');
  const [addressForm] = Form.useForm();
const [addresses, setAddresses] = useState<Address[]>([]);
const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
const [avatarLoading, setAvatarLoading] = useState(false);
const [provinces, setProvinces] = useState<any[]>([]);
const [districts, setDistricts] = useState<any[]>([]);
const [wards, setWards] = useState<any[]>([]);

// Tải danh sách Tỉnh/Thành
useEffect(() => {
    const fetchProvinces = async () => {
        try {
            const resp = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await resp.json();
            setProvinces(data);
        } catch (error) {
            console.error('Lỗi tải tỉnh thành:', error);
        }
    };
    fetchProvinces();
}, []);

// Khi chọn Tỉnh -> Tải Quận
const handleProvinceChange = async (provinceName: string, option: any) => {
    addressForm.setFieldsValue({ district: undefined, ward: undefined });
    setDistricts([]);
    setWards([]);
    
    try {
        const provinceCode = option.key;
        const resp = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await resp.json();
        setDistricts(data.districts || []);
    } catch (error) {
        console.error('Lỗi tải quận huyện:', error);
    }
};

// Khi chọn Quận -> Tải Phường
const handleDistrictChange = async (districtName: string, option: any) => {
    addressForm.setFieldsValue({ ward: undefined });
    setWards([]);

    try {
        const districtCode = option.key;
        const resp = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await resp.json();
        setWards(data.wards || []);
    } catch (error) {
        console.error('Lỗi tải phường xã:', error);
    }
};

const fetchAddresses = async () => {
  try {
    const data = await addressApi.getAll();
    setAddresses(data);
  } catch (error: any) {
    console.error('Lỗi lấy địa chỉ:', error);
  }
};

  // Fetch latest user data
  const fetchUserData = async () => {
    // 1. Lấy ID linh hoạt (fallback từ _id sang id)
    const currentUserId = currentUser?._id || (currentUser as any)?.id;
    
    if (!currentUserId) return;
    setLoading(true);
    try {
      const resp: any = await userApi.getById(currentUserId);
      // Map id -> _id ngay tại đây để đồng bộ
      if (resp && !resp._id && resp.id) {
        resp._id = resp.id;
      }
      setUserData(resp);
      personalForm.setFieldsValue(resp);
      
      // 2. Đồng bộ ngược lên Redux để Header và các component khác nhận được _id chuẩn
      dispatch(updateUser(resp));
    } catch (error: any) {
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể lấy thông tin người dùng',
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Theo dõi cả _id và id để tránh effect bị kẹt khi loginSuccess mới hoàn tất
  useEffect(() => {
    const cid = currentUser?._id || (currentUser as any)?.id;
    if (cid) {
      fetchUserData();
      fetchAddresses();
    }
  }, [currentUser?._id, (currentUser as any)?.id]);


  // Đồng bộ dữ liệu vào form khi userData thay đổi
  useEffect(() => {
    if (userData) {
      personalForm.setFieldsValue(userData);
    }
  }, [userData, personalForm]);

  const handleDeleteAddress = async (id: string) => {
    try {
      await addressApi.delete(id);
      notification.success({ message: 'Đã xóa địa chỉ' });
      fetchAddresses();
    } catch (error: any) {
      notification.error({ message: 'Lỗi', description: error.message });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await addressApi.setDefault(id);
      notification.success({ message: 'Đã cập nhật địa chỉ mặc định' });
      fetchAddresses();
    } catch (error: any) {
      notification.error({ message: 'Lỗi', description: error.message });
    }
  };
  
  const handleAddAddress = async (values: any) => {
    setLoading(true);
    try {
      await addressApi.create(values);
      notification.success({ message: 'Thêm địa chỉ thành công' });
      setIsAddressModalOpen(false);
      addressForm.resetFields();
      fetchAddresses(); // Tải lại danh sách địa chỉ
    } catch (error: any) {
      notification.error({ 
        message: 'Lỗi', 
        description: error.message || 'Không thể thêm địa chỉ' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle personal info update
  const handleUpdateInfo = async (values: any) => {
    if (!userData?._id) return;
    setLoading(true);
    try {
      // Loại bỏ username trước khi gửi lên API
      const { username, ...updateData } = values;
      const updatedUser = await userApi.update(userData._id, updateData);
      setUserData(updatedUser);
      dispatch(updateUser(updatedUser)); // Cập nhật Redux store (Header, v.v...)
      setIsEditing(false);
      notification.success({
        message: 'Thành công',
        description: 'Cập nhật thông tin cá nhân thành công',
      });
    } catch (error: any) {
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Cập nhật thất bại',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (values: any) => {
    // Lấy ID an toàn nhất từ mọi nguồn
    const userId = currentUser?._id || (currentUser as any)?.id || userData?._id || (userData as any)?.id; 

    if (!userId) {
        return notification.error({ 
            message: 'Lỗi', 
            description: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại' 
        });
    }

    setLoading(true);
    try {
        // 2. Gọi API đổi mật khẩu
        await userApi.changePassword(userId, {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword
        });

        notification.success({ message: 'Đổi mật khẩu thành công' });
        passwordForm.resetFields();
    } catch (error: any) {
        // 3. Hiển thị lỗi từ Backend (ví dụ: Mật khẩu cũ không khớp)
        notification.error({ 
            message: 'Lỗi', 
            description: error.message || 'Không thể đổi mật khẩu'
        });
    } finally {
        setLoading(false);
    }
};

  const handleAvatarChange: UploadProps['onChange'] = async (info) => {
    // Khi dùng beforeUpload={() => false}, Ant Design sẽ không tự động upload
    // mà sẽ gọi onChange ngay lập tức sau khi chọn file.
    // Chúng ta không check info.file.status vì nó sẽ luôn là 'ready' hoặc rỗng.
    const file = info.file.originFileObj || info.file;
    
    if (file) {
      try {
        setAvatarLoading(true);
        const response: any = await uploadApi.uploadImage(file as RcFile);
        
        if (response.avatarUrl && userData?._id) {
          const updatedUser = await userApi.update(userData._id, { avatarUrl: response.avatarUrl });
          setUserData(updatedUser);
          dispatch(updateUser(updatedUser));
          notification.success({ 
            message: 'Thành công', 
            description: 'Thay đổi ảnh đại diện mới thành công' 
          });
        }
      } catch (error: any) {
        console.error('LỖI UPLOAD AVATAR:', error);
        notification.error({
          message: 'Lỗi upload',
          description: error.message || 'Không thể tải ảnh. Vui lòng thử lại sau.'
        });
      } finally {
        setAvatarLoading(false);
      }
    }
  };



  const renderPersonalInfo = () => (
    <Form
      form={personalForm}
      layout="vertical"
      onFinish={handleUpdateInfo}
      onFinishFailed={(errorInfo) => {
        console.log('Validation Failed:', errorInfo);
        notification.error({
          message: 'Lỗi validation',
          description: 'Vui lòng kiểm tra lại các trường thông tin.',
        });
      }}
      requiredMark={false}
      className="profile-form"
    >
      <div className="p-6 bg-white rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="!m-0">Thông tin cá nhân</Title>
          {!isEditing ? (
            <Button 
              type="primary" 
              ghost 
              icon={<EditOutlined />} 
              onClick={() => setIsEditing(true)}
              className="rounded-full border-gray-300 hover:!border-blue-500"
            >
              Chỉnh sửa
            </Button>
          ) : (
            <div className="space-x-2">
              <Button 
                  icon={<CloseOutlined />} 
                  onClick={() => {
                      setIsEditing(false);
                      personalForm.setFieldsValue(userData);
                  }}
                  className="rounded-full"
              >
                Hủy
              </Button>
              <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  htmlType="submit"
                  className="rounded-full"
                  loading={loading}
              >
                Lưu
              </Button>
            </div>
          )}
        </div>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-medium text-gray-600">Họ và tên</span>}
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input size="large" placeholder="Nhập họ và tên" disabled={!isEditing} className="rounded-lg hover:border-blue-400 focus:border-blue-500" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-medium text-gray-600">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không đúng định dạng' }
              ]}
            >
              <Input size="large" placeholder="Nhập email" disabled={!isEditing} className="rounded-lg" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-medium text-gray-600">Số điện thoại</span>}
              name="phone"
              rules={[
                { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa số' }
              ]}
            >
              <Input size="large" placeholder="Nhập số điện thoại" disabled={!isEditing} className="rounded-lg" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-medium text-gray-600">Tên đăng nhập</span>}
              name="username"
            >
              <Input size="large" disabled className="bg-gray-50 rounded-lg" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </Form>
  );

  const renderChangePassword = () => (
    <div className="p-6 bg-white rounded-xl">
      <Title level={4} className="mb-6">Đổi mật khẩu</Title>
      <Form 
        form={passwordForm}
        layout="vertical" 
        className="max-w-md" 
        onFinish={handleUpdatePassword}
      >
        <Form.Item 
          label="Mật khẩu hiện tại" 
          name="oldPassword" 
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password size="large" className="rounded-lg" />
        </Form.Item>
        
        <Form.Item 
          label="Mật khẩu mới" 
          name="newPassword" 
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' }
          ]}
        >
          <Input.Password size="large" className="rounded-lg" />
        </Form.Item>
        
        <Form.Item 
          label="Xác nhận mật khẩu mới" 
          name="confirmPassword" 
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password size="large" className="rounded-lg" />
        </Form.Item>
        
        <Button 
          type="primary" 
          size="large" 
          className="rounded-full w-full mt-4" 
          htmlType="submit"
          loading={loading}
        >
          Cập nhật mật khẩu
        </Button>
      </Form>
    </div>
  );

  const renderAddresses = () => (
    <div className="p-6 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="!m-0">Địa chỉ giao hàng</Title>
        <Button 
          type="primary" 
          ghost 
          className="rounded-full"
          onClick={() => setIsAddressModalOpen(true)}
        >
          Thêm địa chỉ
        </Button>
      </div>
      
      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((addr, index) => (
            <Card key={addr._id} className="rounded-xl border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Text strong className="text-lg">{addr.receiverName}</Text>
                    <Tag color="blue">Địa chỉ {index + 1}</Tag>
                    {addr.isDefault && <Tag color="green">Mặc định</Tag>}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <EnvironmentOutlined />
                    <Text>{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`}</Text>
                  </div>
                  <div className="text-gray-500">
                    <Text type="secondary">Số điện thoại: </Text>
                    <Text strong>{addr.phoneNumber}</Text>
                  </div>
                  {!addr.isDefault && (
                    <Button 
                      type="link" 
                      className="p-0 h-auto text-blue-600 hover:text-blue-700"
                      onClick={() => handleSetDefaultAddress(addr._id!)}
                    >
                      Thiết lập mặc định
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleDeleteAddress(addr._id!)}
                    className="hover:bg-red-50 rounded-full"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-400">
           <EnvironmentOutlined style={{ fontSize: 48 }} />
           <p className="mt-2 text-lg">Chưa có địa chỉ giao hàng nào</p>
           <Button 
            type="primary" 
            className="mt-4 rounded-full"
            onClick={() => setIsAddressModalOpen(true)}
           >
            Tạo địa chỉ đầu tiên
           </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <Row gutter={[32, 32]}>
          {/* Cột trái: Profile Summary */}
          <Col xs={24} lg={8}>
            <Card className="rounded-2xl border-none shadow-sm overflow-hidden sticky top-8">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 -mx-6 -mt-6 mb-16 relative">
                 <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <div className="relative group">
                        <Spin spinning={avatarLoading}>
                            <Avatar 
                                size={120} 
                                src={getAvatarUrl(userData?.avatarUrl) || undefined} 
                                icon={<UserOutlined />}
                                className="border-4 border-white shadow-lg bg-white"
                            />
                        </Spin>
                        <Upload
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleAvatarChange}
                            className="absolute bottom-1 right-1"
                        >
                            <Button 
                                shape="circle" 
                                icon={<CameraOutlined />} 
                                className="shadow-md bg-white border-none group-hover:scale-110 transition-transform"
                                size="middle"
                            />
                        </Upload>
                    </div>
                 </div>
              </div>
              
              <div className="text-center pt-2">
                <Title level={3} className="!mb-1">{userData?.fullName}</Title>
                <Tag color="gold" className="px-3 rounded-full font-medium">
                  {(userData?.role as any)?.name || 'Thành viên'}
                </Tag>
                
                <Divider className="my-6" />
                
                <div className="space-y-4 px-4 text-left">
                  <div className="flex items-center gap-3 text-gray-600">
                    <UserOutlined className="text-blue-500" />
                    <span>{userData?.username}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <EnvironmentOutlined className="text-blue-500" />
                    <span>{userData?.addresses?.[0]?.city || 'Chưa cập nhật địa chỉ'}</span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <Card className="bg-gray-50 border-none rounded-xl py-2 px-1 text-center">
                    <Text strong className="text-blue-600 text-lg">0</Text>
                    <br />
                    <Text type="secondary" className="text-xs">Đơn hàng</Text>
                  </Card>
                  <Card className="bg-gray-50 border-none rounded-xl py-2 px-1 text-center">
                    <Text strong className="text-blue-600 text-lg">0</Text>
                    <br />
                    <Text type="secondary" className="text-xs">Voucher</Text>
                  </Card>
                </div>
              </div>
            </Card>
          </Col>

          {/* Cột phải: Profile Details */}
          <Col xs={24} lg={16}>
            <div className="bg-white rounded-2xl shadow-sm p-4 h-full min-h-[600px]">
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                className="custom-tabs"
                size="large"
                items={[
                  {
                    key: '1',
                    label: (
                        <span className="flex items-center gap-2 px-2">
                            <UserOutlined />
                            Thông tin cá nhân
                        </span>
                    ),
                    children: renderPersonalInfo()
                  },
                  {
                    key: '2',
                    label: (
                        <span className="flex items-center gap-2 px-2">
                            <LockOutlined />
                            Đổi mật khẩu
                        </span>
                    ),
                    children: renderChangePassword()
                  },
                  {
                    key: '3',
                    label: (
                        <span className="flex items-center gap-2 px-2">
                            <EnvironmentOutlined />
                            Địa chỉ giao hàng
                        </span>
                    ),
                    children: renderAddresses()
                  }
                ]}
              />
            </div>
          </Col>
        </Row>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 border-b pb-3">
             <EnvironmentOutlined className="text-blue-600" />
             <span className="text-lg font-semibold">Thêm địa chỉ giao hàng</span>
          </div>
        }
        open={isAddressModalOpen}
        onCancel={() => {
            setIsAddressModalOpen(false);
            addressForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        centered
        width={500}
        className="premium-modal"
      >
        <Form
            form={addressForm}
            layout="vertical"
            onFinish={handleAddAddress}
            initialValues={{ isDefault: false }}
            className="mt-6"
            requiredMark={false}
        >
            <Form.Item
                label={<span className="font-medium text-gray-600">Họ và tên người nhận</span>}
                name="receiverName"
                rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
            >
                <Input size="large" placeholder="Nhập tên người nhận" className="rounded-lg" />
            </Form.Item>

            <Form.Item
                label={<span className="font-medium text-gray-600">Số điện thoại</span>}
                name="phoneNumber"
                rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]+$/, message: 'Số điện thoại không hợp lệ' }
                ]}
            >
                <Input size="large" placeholder="Nhập số điện thoại" className="rounded-lg" />
            </Form.Item>

            <Row gutter={12}>
                <Col span={12}>
                    <Form.Item
                        label={<span className="font-medium text-gray-600">Tỉnh/Thành phố</span>}
                        name="city"
                        rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành' }]}
                    >
                        <Select 
                            showSearch
                            size="large" 
                            placeholder="Chọn Tỉnh/Thành" 
                            className="rounded-lg w-full"
                            onChange={handleProvinceChange}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={provinces.map(p => ({ label: p.name, value: p.name, key: p.code }))}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label={<span className="font-medium text-gray-600">Quận/Huyện</span>}
                        name="district"
                        rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện' }]}
                    >
                        <Select 
                            showSearch
                            size="large" 
                            placeholder="Chọn Quận/Huyện" 
                            className="rounded-lg w-full"
                            disabled={!districts.length}
                            onChange={handleDistrictChange}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={districts.map(d => ({ label: d.name, value: d.name, key: d.code }))}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                label={<span className="font-medium text-gray-600">Phường/Xã</span>}
                name="ward"
                rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã' }]}
            >
                <Select 
                    showSearch
                    size="large" 
                    placeholder="Chọn Phường/Xã" 
                    className="rounded-lg w-full"
                    disabled={!wards.length}
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={wards.map(w => ({ label: w.name, value: w.name }))}
                />
            </Form.Item>

            <Form.Item
                label={<span className="font-medium text-gray-600">Địa chỉ cụ thể (Số nhà, đường...)</span>}
                name="street"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}
            >
                <Input.TextArea rows={2} placeholder="Nhập số nhà, tên đường..." className="rounded-lg" />
            </Form.Item>

            <Form.Item 
                name="isDefault" 
                valuePropName="checked"
                className="mb-6"
            >
                <div className="flex items-center gap-3">
                    <Switch />
                    <span className="text-gray-600">Đặt làm địa chỉ mặc định</span>
                </div>
            </Form.Item>

            <div className="flex gap-3 pt-2">
                <Button 
                    className="flex-1 h-12 rounded-xl text-gray-600"
                    onClick={() => {
                        setIsAddressModalOpen(false);
                        addressForm.resetFields();
                    }}
                >
                    Hủy
                </Button>
                <Button 
                    type="primary" 
                    htmlType="submit"
                    className="flex-1 h-12 rounded-xl bg-blue-600"
                    loading={loading}
                >
                    Thêm địa chỉ
                </Button>
            </div>
        </Form>
      </Modal>


    

      
      
      {/* Premium styles for custom elements */}
      <style>{`
        .custom-tabs .ant-tabs-nav::before {
            border-bottom: none;
        }
        .custom-tabs .ant-tabs-ink-bar {
            height: 3px;
            border-radius: 3px;
            background: #2563eb;
        }
        .custom-tabs .ant-tabs-tab {
            margin: 0 16px 0 0 !important;
            padding: 12px 4px !important;
            transition: all 0.3s;
        }
        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #2563eb !important;
            font-weight: 600;
        }
        .custom-tabs .ant-tabs-tab:hover {
            color: #2563eb;
        }
        .profile-form .ant-form-item-label label {
            font-size: 0.9rem;
        }
      `}</style>
      
    </div>
  );
};

export default Profile;
