import React, { useState, useEffect } from 'react';
import {
  Tabs,
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
  const [activeTab, setActiveTab] = useState('1');
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

      // Đảm bảo state được cập nhật với object mới nhất để UI re-render (bao gồm avatarUrl)
      setUserData({ ...resp });
      personalForm.setFieldsValue(resp);

      // 2. Đồng bộ ngược lên Redux để Header và các component khác nhận được avatar mới
      dispatch(updateUser(resp));
    } catch (error: any) {
      console.error('Lỗi lấy thông tin cá nhân:', error);
      notification.error({
        title: 'Lỗi',
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
      notification.success({ title: 'Đã xóa địa chỉ' });
      fetchAddresses();
    } catch (error: any) {
      notification.error({ title: 'Lỗi', description: error.message });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await addressApi.setDefault(id);
      notification.success({ title: 'Đã cập nhật địa chỉ mặc định' });
      fetchAddresses();
    } catch (error: any) {
      notification.error({ message: 'Lỗi', description: error.message });
    }
  };

  const handleAddAddress = async (values: any) => {
    setLoading(true);
    try {
      await addressApi.create(values);
      notification.success({ title: 'Thêm địa chỉ thành công' });
      setIsAddressModalOpen(false);
      addressForm.resetFields();
      fetchAddresses(); // Tải lại danh sách địa chỉ
    } catch (error: any) {
      notification.error({
        title: 'Lỗi',
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
        title: 'Thành công',
        description: 'Cập nhật thông tin cá nhân thành công',
      });
    } catch (error: any) {
      notification.error({
        title: 'Lỗi',
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
            title: 'Thành công',
            description: 'Thay đổi ảnh đại diện mới thành công'
          });
        }
      } catch (error: any) {
        console.error('LỖI UPLOAD AVATAR:', error);
        notification.error({
          title: 'Lỗi upload',
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
          title: 'Lỗi validation',
          description: 'Vui lòng kiểm tra lại các trường thông tin.',
        });
      }}
      requiredMark={false}
      className="profile-form"
    >
      <div className="p-8 glass-panel bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60">
        <div className="flex justify-between items-center mb-8">
          <Title level={4} className="!m-0 !font-serif !font-normal tracking-tight">Thông tin cá nhân</Title>
          {!isEditing ? (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold text-xs"
            >
              CHỈNH SỬA
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                icon={<CloseOutlined />}
                onClick={() => {
                  setIsEditing(false);
                  personalForm.setFieldsValue(userData);
                }}
                className="rounded-full border-text/10 text-text/60 font-bold text-xs"
              >
                HỦY
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                className="rounded-full bg-primary border-none font-bold text-xs shadow-lg"
                loading={loading}
              >
                LƯU
              </Button>
            </div>
          )}
        </div>

        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Họ và tên</span>}
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input size="large" placeholder="Nhập họ và tên" disabled={!isEditing} className="rounded-2xl bg-white/50 hover:border-primary focus:border-primary border-white/60 h-12" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không đúng định dạng' }
              ]}
            >
              <Input size="large" placeholder="Nhập email" disabled={!isEditing} className="rounded-2xl bg-white/50 border-white/60 h-12" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Số điện thoại</span>}
              name="phone"
              rules={[
                { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa số' }
              ]}
            >
              <Input size="large" placeholder="Nhập số điện thoại" disabled={!isEditing} className="rounded-2xl bg-white/50 border-white/60 h-12" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Tên đăng nhập</span>}
              name="username"
            >
              <Input size="large" disabled className="rounded-2xl bg-text/5 border-none h-12 opacity-50" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </Form>
  );

  const renderChangePassword = () => (
    <div className="p-8 glass-panel bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60">
      <Title level={4} className="mb-8 !font-serif !font-normal tracking-tight">Đổi mật khẩu</Title>
      <Form
        form={passwordForm}
        layout="vertical"
        className="max-w-md"
        onFinish={handleUpdatePassword}
      >
        <Form.Item
          label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Mật khẩu hiện tại</span>}
          name="oldPassword"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password size="large" className="rounded-2xl bg-white/50 border-white/60 h-12" />
        </Form.Item>

        <Form.Item
          label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Mật khẩu mới</span>}
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' }
          ]}
        >
          <Input.Password size="large" className="rounded-2xl bg-white/50 border-white/60 h-12" />
        </Form.Item>

        <Form.Item
          label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Xác nhận mật khẩu</span>}
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
          <Input.Password size="large" className="rounded-2xl bg-white/50 border-white/60 h-12" />
        </Form.Item>

        <Button
          type="primary"
          size="large"
          className="rounded-full w-full mt-6 bg-primary border-none font-bold tracking-widest text-xs h-14 shadow-lg shadow-primary/20"
          htmlType="submit"
          loading={loading}
        >
          CẬP NHẬT MẬT KHẨU
        </Button>
      </Form>
    </div>
  );

  const renderAddresses = () => (
    <div className="p-8 glass-panel bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60">
      <div className="flex justify-between items-center mb-8">
        <Title level={4} className="!m-0 !font-serif !font-normal tracking-tight">Địa chỉ giao hàng</Title>
        <Button
          type="primary"
          className="rounded-full bg-primary border-none font-bold text-xs shadow-lg"
          onClick={() => setIsAddressModalOpen(true)}
        >
          THÊM ĐỊA CHỈ
        </Button>
      </div>

      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr, index) => (
            <div key={addr._id} className="glass-card p-6 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/80 shadow-sm hover:shadow-xl transition-all relative group h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif text-lg text-text">{addr.receiverName}</span>
                    {addr.isDefault && (
                      <Tag className="m-0 bg-primary/10 text-primary border-none rounded-full px-3 font-bold text-[10px] uppercase tracking-wider">MẶC ĐỊNH</Tag>
                    )}
                  </div>
                  <div className="text-text/40 text-xs font-bold uppercase tracking-widest">ĐỊA CHỈ {index + 1}</div>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteAddress(addr._id!)}
                  className="hover:bg-cta/10 text-cta rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              <div className="flex items-start gap-3 mb-4 flex-1">
                <EnvironmentOutlined className="text-primary mt-1" />
                <Text className="text-text/60 font-light leading-relaxed">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`}</Text>
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <div className="flex items-center gap-3">
                  <span className="text-text/30 text-[10px] font-bold uppercase tracking-widest shrink-0">HOTLINE</span>
                  <Text className="font-bold text-text tracking-tight">{addr.phoneNumber}</Text>
                </div>

                {!addr.isDefault && (
                  <Button
                    type="link"
                    className="p-0 h-auto text-primary hover:text-primary/70 font-bold text-xs tracking-widest text-left"
                    onClick={() => handleSetDefaultAddress(addr._id!)}
                  >
                    THIẾT LẬP MẶC ĐỊNH
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-text/5 rounded-full flex items-center justify-center text-3xl text-text/20 mb-6">
            <EnvironmentOutlined />
          </div>
          <p className="text-text/40 font-serif italic text-xl mb-8">Hành trình trải nghiệm mới bắt đầu từ đây</p>
          <Button
            type="primary"
            size="large"
            className="rounded-full bg-primary border-none font-bold tracking-widest text-xs h-14 px-10 shadow-lg"
            onClick={() => setIsAddressModalOpen(true)}
          >
            KHỞI TẠO ĐỊA CHỈ
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-16 px-4 relative overflow-hidden font-sans">
      {/* Background Orbs for Liquid Glass */}
      <div className="absolute top-[5%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-multiply"></div>
      <div className="absolute bottom-[15%] left-[-5%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none opacity-50 mix-blend-multiply"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <Row gutter={[32, 32]}>
          {/* Cột trái: Profile Summary */}
          <Col xs={24} lg={8}>
            <div className="glass-panel p-8 rounded-[3rem] border border-white/60 shadow-2xl overflow-hidden sticky top-32">
              <div className="h-40 bg-gradient-to-br from-primary to-secondary -mx-10 -mt-10 mb-20 relative">
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                  <div className="relative group">
                    <Spin spinning={avatarLoading}>
                      <Avatar
                        size={140}
                        src={getAvatarUrl(userData?.avatarUrl) || undefined}
                        icon={<UserOutlined />}
                        className="border-4 border-white/80 shadow-2xl bg-white backdrop-blur-md"
                      />
                    </Spin>
                    <Upload
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleAvatarChange}
                      className="absolute bottom-2 right-2"
                    >
                      <Button
                        shape="circle"
                        icon={<CameraOutlined />}
                        className="shadow-lg bg-white border-none hover:scale-110 transition-all flex items-center justify-center p-0"
                        style={{ width: 40, height: 40 }}
                      />
                    </Upload>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <Title level={3} className="!mb-1 !font-serif !font-normal tracking-tight">{userData?.fullName}</Title>
                <Tag className="px-3 rounded-full font-bold bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest">
                  {(userData?.role as any)?.name || 'THÀNH VIÊN'}
                </Tag>

                <Divider className="my-8 opacity-40 border-text/10" />

                <div className="space-y-5 px-4 text-left">
                  <div className="flex items-center gap-3 text-text/60">
                    <UserOutlined className="text-primary" />
                    <span className="font-medium">@{userData?.username}</span>
                  </div>
                  <div className="flex items-center gap-3 text-text/60">
                    <EnvironmentOutlined className="text-primary" />
                    <span className="font-medium">{userData?.addresses?.[0]?.city || 'Chưa cập nhật địa chỉ'}</span>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-3xl py-4 flex flex-col items-center shadow-sm">
                    <Text className="text-primary text-xl font-serif">0</Text>
                    <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">Đơn hàng</Text>
                  </div>
                  <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-3xl py-4 flex flex-col items-center shadow-sm">
                    <Text className="text-primary text-xl font-serif">0</Text>
                    <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">Voucher</Text>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={16}>
            <div className="glass-panel rounded-[3rem] p-6 md:p-10 border border-white/60 shadow-2xl h-full min-h-[700px]">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="premium-tabs-system"
                size="large"
                items={[
                  {
                    key: '1',
                    label: (
                      <span className="flex items-center gap-2 px-6 py-2 font-serif text-lg tracking-tight">
                        THÔNG TIN
                      </span>
                    ),
                    children: renderPersonalInfo()
                  },
                  {
                    key: '2',
                    label: (
                      <span className="flex items-center gap-2 px-6 py-2 font-serif text-lg tracking-tight">
                        BẢO MẬT
                      </span>
                    ),
                    children: renderChangePassword()
                  },
                  {
                    key: '3',
                    label: (
                      <span className="flex items-center gap-2 px-6 py-2 font-serif text-lg tracking-tight">
                        ĐỊA CHỈ
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
          <div className="flex flex-col border-b border-text/10 pb-6 mb-8">
            <span className="font-serif text-2xl text-text tracking-tight">Thêm địa chỉ mới</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">GIAO HÀNG TẬN TÂM</span>
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
        width={550}
        className="premium-modal"
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleAddAddress}
          initialValues={{ isDefault: false }}
          requiredMark={false}
        >
          <Form.Item
            label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Người nhận</span>}
            name="receiverName"
            rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
          >
            <Input size="large" placeholder="Họ và tên khách hàng" className="rounded-2xl h-12 border-text/10" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Liên hệ</span>}
            name="phoneNumber"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]+$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input size="large" placeholder="Số điện thoại di động" className="rounded-2xl h-12 border-text/10" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Tỉnh/Thành</span>}
                name="city"
                rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành' }]}
              >
                <Select
                  showSearch
                  size="large"
                  placeholder="Chọn Tỉnh"
                  className="rounded-2xl w-full"
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
                label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Quận/Huyện</span>}
                name="district"
                rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện' }]}
              >
                <Select
                  showSearch
                  size="large"
                  placeholder="Chọn Huyện"
                  className="rounded-2xl w-full"
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
            label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Phường/Xã</span>}
            name="ward"
            rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã' }]}
          >
            <Select
              showSearch
              size="large"
              placeholder="Chọn Xã"
              className="rounded-2xl w-full"
              disabled={!wards.length}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={wards.map(w => ({ label: w.name, value: w.name }))}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-text/40 text-[10px] uppercase tracking-widest pl-2">Chi tiết</span>}
            name="street"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}
          >
            <Input.TextArea rows={2} placeholder="Số nhà, tên đường..." className="rounded-2xl border-text/10" />
          </Form.Item>

          <Form.Item
            name="isDefault"
            valuePropName="checked"
            className="mb-8"
          >
            <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10 w-fit">
              <Switch />
              <span className="text-text/60 text-xs font-bold uppercase tracking-wider">Đặt làm mặc định</span>
            </div>
          </Form.Item>

          <div className="flex gap-4">
            <Button
              className="flex-1 h-16 rounded-2xl border-text/10 text-text/60 font-bold tracking-widest text-xs"
              onClick={() => {
                setIsAddressModalOpen(false);
                addressForm.resetFields();
              }}
            >
              HỦY BỎ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="flex-1 h-16 rounded-2xl bg-primary border-none font-bold tracking-widest text-xs shadow-lg shadow-primary/20"
              loading={loading}
            >
              LƯU ĐỊA CHỈ
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
