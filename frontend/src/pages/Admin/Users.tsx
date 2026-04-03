import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Input, 
  Select, 
  Modal, 
  Form, 
  Avatar, 
  Typography, 
  notification, 
  Popconfirm,
  Tooltip,
  Upload,
  Row,
  Col,
  Badge,
  Divider,
  Empty
} from 'antd';
import { 
  UserOutlined,
  PlusOutlined,
  LoadingOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  StopOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import userApi from '../../api/userApi';
import roleApi from '../../api/roleApi';
import uploadApi from '../../api/uploadApi';
import type { User, Role } from '../../types/auth';
import { getAvatarUrl, BASE_URL } from '../../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAll();
      setUsers(response as any);
    } catch (error: any) {
      notification.error({
        title: 'Lỗi tải danh sách người dùng',
        description: error.response?.data?.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleApi.getAll();
      setRoles(response as any);
    } catch (error) {
      console.error('Lỗi tải danh sách quyền:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleFilterRole = (value: string | null) => {
    setFilterRole(value);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase());
    
    const roleId = (user.role && typeof user.role === 'object') ? user.role._id : user.role;
    const matchesRole = filterRole ? roleId === filterRole : true;
    
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const roleId = (user.role && typeof user.role === 'object') ? user.role._id : user.role;
    setImageUrl(user.avatarUrl ? `${BASE_URL}${user.avatarUrl}` : null);
    editForm.setFieldsValue({
      fullName: user.fullName,
      phone: user.phone,
      roleId: roleId,
      avatarUrl: user.avatarUrl
    });
    setIsEditModalOpen(true);
  };

  const handleUpload = async (options: any, form: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const response: any = await uploadApi.uploadImage(file as File);
      const photoPath = response.avatarUrl;
      const fullUrl = `${BASE_URL}${photoPath}`;
      setImageUrl(fullUrl);
      form.setFieldsValue({ avatarUrl: photoPath });
      notification.success({ title: 'Tải ảnh lên thành công' });
      if (onSuccess) onSuccess("ok");
    } catch (error: any) {
      notification.error({ title: 'Tải ảnh lên thất bại' });
      if (onError) onError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.delete(id);
      notification.success({ title: 'Xóa người dùng thành công' });
      fetchUsers();
    } catch (error: any) {
      notification.error({
        title: 'Xóa người dùng thất bại',
        description: error.response?.data?.message || 'Vui lòng thử lại sau',
      });
    }
  };

  const handleToggleLock = async (user: User) => {
    const isLocked = user.lockTime && new Date(user.lockTime).getTime() > Date.now();
    const newLockTime = isLocked ? null : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    
    try {
      await userApi.update(user._id, { lockTime: newLockTime });
      notification.success({ 
        title: isLocked ? 'Mở khóa người dùng thành công' : 'Khóa người dùng thành công' 
      });
      fetchUsers();
    } catch (error: any) {
      notification.error({
        title: 'Thao tác thất bại',
        description: error.response?.data?.message || 'Vui lòng thử lại sau',
      });
    }
  };

  const onFinishEdit = async (values: any) => {
    if (!editingUser) return;
    try {
      await userApi.update(editingUser._id, {
        fullName: values.fullName,
        phone: values.phone,
        role: values.roleId,
        avatarUrl: values.avatarUrl
      });
      notification.success({ title: 'Cập nhật người dùng thành công' });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      notification.error({
        title: 'Cập nhật thất bại',
        description: error.response?.data?.message || 'Vui lòng thử lại sau',
      });
    }
  };

  const onFinishAdd = async (values: any) => {
    try {
      await userApi.create({
        ...values,
        role: values.roleId,
        avatarUrl: values.avatarUrl
      });
      notification.success({ title: 'Thêm người dùng mới thành công' });
      setIsAddModalOpen(false);
      addForm.resetFields();
      setImageUrl(null);
      fetchUsers();
    } catch (error: any) {
      notification.error({
        title: 'Thêm người dùng thất bại',
        description: error.response?.data?.message || 'Vui lòng thử lại sau',
      });
    }
  };

  const lockedCount = users.filter(user => user.lockTime && new Date(user.lockTime).getTime() > Date.now()).length;

  const columns: ColumnsType<User> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <Text className="text-text/30 font-mono font-bold">{index + 1}</Text>
      ),
    },
    {
      title: 'Thành viên',
      key: 'user',
      render: (_, record) => (
        <Space size="middle" className="py-2">
            <div className="relative group">
                <Avatar 
                    src={getAvatarUrl(record.avatarUrl) || undefined} 
                    icon={<UserOutlined />} 
                    className="bg-emerald-600 shadow-md ring-2 ring-white group-hover:scale-110 transition-transform"
                    size={48}
                >
                    {record.fullName.charAt(0)}
                </Avatar>
                {record.lockTime && new Date(record.lockTime).getTime() > Date.now() && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <LockOutlined className="text-white text-[10px]" />
                    </div>
                )}
            </div>
            <div className="flex flex-col">
                <Text strong className="text-base tracking-tight leading-tight">{record.fullName}</Text>
                <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">ID: {record._id.slice(-6)}</Text>
            </div>
        </Space>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
              <MailOutlined className="text-text/20 text-[10px]" />
              <Text className="text-xs font-bold text-text/60">{record.email}</Text>
          </div>
          <div className="flex items-center gap-2">
              <PhoneOutlined className="text-text/20 text-[10px]" />
              <Text className="text-xs text-text/40">{record.phone || 'Chưa cập nhật'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Quyền hạn',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: Role | string) => {
        const name = (typeof role === 'object' && role !== null) ? role.name : String(role);
        return (
          <div className={`px-4 py-1.5 rounded-full inline-flex items-center gap-2 border ${
              name.toUpperCase() === 'ADMIN' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-600'
          }`}>
               <SafetyCertificateOutlined className="text-[10px]" />
               <Text strong className="text-[10px] uppercase tracking-widest text-current">{name}</Text>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 160,
      render: (_, record) => {
        const isLocked = record.lockTime && new Date(record.lockTime).getTime() > Date.now();
        if (isLocked) {
          return (
            <div className="px-4 py-1.5 rounded-full inline-flex items-center gap-2 border bg-red-50 border-red-100 text-red-600">
                 <StopOutlined className="text-[10px]" />
                 <Text strong className="text-[10px] uppercase tracking-widest text-current">Bị khóa</Text>
            </div>
          );
        }
        return (
            <div className="px-4 py-1.5 rounded-full inline-flex items-center gap-2 border bg-emerald-50 border-emerald-100 text-emerald-600">
                 <CheckCircleOutlined className="text-[10px]" />
                 <Text strong className="text-[10px] uppercase tracking-widest text-current">Hoạt động</Text>
            </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => {
        const isLocked = record.lockTime && new Date(record.lockTime).getTime() > Date.now();
        return (
          <Space size={8}>
            <Tooltip title="Chỉnh sửa">
              <Button 
                shape="circle" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
                className="bg-emerald-50 text-emerald-600 border-none hover:bg-emerald-100 transition-colors" 
              />
            </Tooltip>
            
            <Tooltip title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}>
              <Button 
                shape="circle" 
                icon={isLocked ? <UnlockOutlined /> : <LockOutlined />} 
                onClick={() => handleToggleLock(record)}
                className={isLocked ? "bg-amber-50 text-amber-600 border-none hover:bg-amber-100" : "bg-red-50 text-red-600 border-none hover:bg-red-100"}
              />
            </Tooltip>

            <Popconfirm
              title="Xác nhận xóa?"
              description="Thành viên sẽ được đưa vào thùng rác."
              onConfirm={() => handleDelete(record._id)}
              okText="Xóa" cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa vĩnh viễn">
                <Button 
                  shape="circle" 
                  danger 
                  icon={<DeleteOutlined />} 
                  className="bg-red-50 text-red-600 border-none hover:bg-red-100 transition-colors" 
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Stats Island */}
      <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-8 border border-white/60 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <Title level={2} className="!m-0 !font-serif tracking-tight">Quản lý Người dùng</Title>
            <Text className="text-text/30 font-bold uppercase tracking-[0.3em] text-[10px]">USER PERMISSIONS & ACCESS CONTROL</Text>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'Tổng số', value: users.length, icon: <UserOutlined />, color: '#059669' },
                { label: 'Vai trò', value: roles.length, icon: <SafetyCertificateOutlined />, color: '#3b82f6' },
                { label: 'Bị khóa', value: lockedCount, icon: <LockOutlined />, color: '#ef4444' },
              ].map((stat, i) => (
                <div key={i} className="px-6 py-3 bg-white/60 rounded-[2rem] border border-white shadow-sm flex items-center gap-4 min-w-[160px]">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg" style={{ background: stat.color }}>
                        {stat.icon}
                    </div>
                    <div>
                        <Title level={4} className="!m-0 !font-black !leading-none">{stat.value}</Title>
                        <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">{stat.label}</Text>
                    </div>
                </div>
              ))}
          </div>

          <Button
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setImageUrl(null);
              addForm.resetFields();
              setIsAddModalOpen(true);
            }}
            className="h-16 px-10 rounded-[2rem] bg-emerald-600 border-none font-bold tracking-widest text-xs uppercase shadow-xl shadow-emerald-200 hover:scale-105 transition-all"
          >
            THÊM NGƯỜI DÙNG MỚI
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white/40 backdrop-blur-md rounded-[3.5rem] border border-white/80 shadow-2xl overflow-hidden glass-panel relative">
        {/* Toolbar */}
        <div className="p-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Input
                    prefix={<SearchOutlined className="text-emerald-600" />}
                    placeholder="Tìm kiếm theo tên/email/username..."
                    value={searchText}
                    onChange={handleSearch}
                    allowClear
                    className="h-12 w-full md:w-96 rounded-2xl border-none bg-white/60 shadow-sm focus:bg-white transition-all pl-4"
                />
                <Select
                    placeholder="Lọc theo quyền"
                    allowClear 
                    className="h-12 w-full md:w-56 custom-glass-select"
                    onChange={handleFilterRole}
                    value={filterRole}
                >
                    {roles.map(role => (
                        <Option key={role._id} value={role._id}>
                            {role.name.toUpperCase()}
                        </Option>
                    ))}
                </Select>
            </div>
            
            <div className="flex items-center gap-3">
                <Tooltip title="Làm mới dữ liệu">
                    <Button 
                        shape="circle" 
                        icon={<ReloadOutlined />} 
                        onClick={fetchUsers} 
                        loading={loading}
                        className="bg-white/60 text-emerald-600 border-none shadow-sm hover:scale-110"
                    />
                </Tooltip>
                <div className="h-6 w-px bg-text/10" />
                <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">TRỰC TUYẾN 24/7</Text>
            </div>
        </div>

        <Table 
            columns={columns} 
            dataSource={filteredUsers} 
            rowKey="_id" 
            loading={loading}
            className="premium-admin-table"
            pagination={{ 
                pageSize: 10, 
                showSizeChanger: true,
                showTotal: (total) => <Text className="font-bold text-text/30 text-xs">TỔNG CỘNG {total} THÀNH VIÊN</Text>,
                className: "px-8 py-6"
            }}
            locale={{ emptyText: <Empty description="Chưa có người dùng nào" className="p-20" /> }}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        title={<Title level={4} className="!m-0 !font-serif">Chỉnh sửa thông tin thành viên</Title>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        okText="CẬP NHẬT THÔNG TIN"
        cancelText="BỎ QUA"
        className="premium-admin-modal"
        centered
        width={560}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={onFinishEdit}
          className="mt-8"
        >
          <div className="flex flex-col items-center mb-8">
            <Form.Item name="avatarUrl" hidden>
              <Input />
            </Form.Item>
            <Upload
              name="image"
              listType="picture-card"
              className="glass-uploader-avatar"
              showUploadList={false}
              customRequest={(options) => handleUpload(options, editForm)}
              accept="image/*"
            >
              {imageUrl ? (
                <div className="relative group w-full h-full">
                    <img src={imageUrl} alt="avatar" className="w-full h-full object-cover rounded-[1.5rem]" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-[1.5rem] flex items-center justify-center transition-opacity">
                         <Text className="text-white text-[10px] font-bold">THAY ĐỔI</Text>
                    </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {uploading ? <LoadingOutlined /> : <PlusOutlined className="text-xl mb-2" />}
                  <Text className="text-[10px] font-bold text-text/30">AVATAR</Text>
                </div>
              )}
            </Upload>
          </div>

          <Form.Item
            name="fullName"
            label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Họ và tên đầy đủ</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên..." className="h-12 rounded-2xl bg-white/60 border-none shadow-sm" />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Số điện thoại liên hệ</Text>}
          >
            <Input placeholder="Nhập số điện thoại..." className="h-12 rounded-2xl bg-white/60 border-none shadow-sm" />
          </Form.Item>

          <Form.Item
            name="roleId"
            label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Phân quyền hệ thống</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn quyền" className="h-12 custom-glass-select">
              {roles.map(role => (
                <Option key={role._id} value={role._id}>
                  {role.name.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Modal */}
      <Modal
        title={<Title level={4} className="!m-0 !font-serif">Khởi tạo người dùng hệ thống</Title>}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => addForm.submit()}
        okText="TẠO THÀNH VIÊN"
        cancelText="HỦY BỎ"
        className="premium-admin-modal"
        centered
        width={700}
        destroyOnClose
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={onFinishAdd}
          className="mt-8"
        >
          <div className="flex flex-col items-center mb-8">
            <Form.Item name="avatarUrl" hidden>
              <Input />
            </Form.Item>
            <Upload
              name="image"
              listType="picture-card"
              className="glass-uploader-avatar"
              showUploadList={false}
              customRequest={(options) => handleUpload(options, addForm)}
              accept="image/*"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="avatar" className="w-full h-full object-cover rounded-[1.5rem]" />
              ) : (
                <div className="flex flex-col items-center">
                  {uploading ? <LoadingOutlined /> : <PlusOutlined className="text-xl mb-2" />}
                  <Text className="text-[10px] font-bold text-text/30">UPLOAD</Text>
                </div>
              )}
            </Upload>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <Form.Item
              name="fullName"
              label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Họ và Tên</Text>}
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nguyễn Văn A" className="h-12 rounded-2xl bg-white/60 border-none shadow-sm" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Địa chỉ Email</Text>}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không đúng định dạng' }
              ]}
            >
              <Input placeholder="example@gmail.com" className="h-12 rounded-2xl bg-white/60 border-none shadow-sm" />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Số điện thoại</Text>}
            >
              <Input placeholder="0123456789" className="h-12 rounded-2xl bg-white/60 border-none shadow-sm" />
            </Form.Item>

            <Form.Item
              name="username"
              label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Tên đăng nhập</Text>}
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
              <Input placeholder="username123" className="h-12 rounded-2xl bg-white/60 border-none shadow-sm" />
            </Form.Item>

            <Form.Item
              name="password"
              label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Mật khẩu khởi tạo</Text>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
              ]}
            >
              <Input.Password placeholder="••••••" className="h-12 rounded-2xl bg-white/60 border-none shadow-sm" />
            </Form.Item>

            <Form.Item
              name="roleId"
              label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Vai trò người dùng</Text>}
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select placeholder="Chọn quyền" className="h-12 custom-glass-select">
                {roles.map(role => (
                  <Option key={role._id} value={role._id}>
                    {role.name.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <div className="flex items-center gap-4 text-text/30 text-[10px] font-bold uppercase tracking-widest justify-center mt-6">
                <HistoryOutlined /> AUTO-GENERATED CREDENTIALS WILL BE SECURELY STORED
          </div>
        </Form>
      </Modal>

      <style>{`
        .premium-admin-table .ant-table {
            background: transparent !important;
        }
        .premium-admin-table .ant-table-thead > tr > th {
            background: rgba(0, 0, 0, 0.02) !important;
            border-bottom: 2px solid rgba(255, 255, 255, 0.4) !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
            color: #94a3b8 !important;
            padding: 24px !important;
        }
        .premium-admin-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
            padding: 20px 24px !important;
            transition: all 0.3s ease;
        }
        .premium-admin-table .ant-table-tbody > tr:hover > td {
            background: rgba(5, 150, 105, 0.03) !important;
        }
        .custom-glass-select .ant-select-selector {
            height: 48px !important;
            border-radius: 1rem !important;
            border: none !important;
            background: rgba(255, 255, 255, 0.6) !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03) !important;
            display: flex !important;
            align-items: center !important;
            padding: 0 16px !important;
        }
        .premium-admin-modal .ant-modal-content {
            border-radius: 3rem !important;
            background: rgba(255, 255, 255, 0.8) !important;
            backdrop-filter: blur(20px) !important;
            border: 1px solid white !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
            padding: 40px !important;
        }
        .premium-admin-modal .ant-modal-header {
            background: transparent !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
            padding-bottom: 24px !important;
        }
        .premium-admin-modal .ant-modal-footer {
            border-top: none !important;
            margin-top: 32px !important;
            display: flex;
            justify-content: center;
            gap: 16px;
        }
        .premium-admin-modal .ant-modal-footer .ant-btn {
            height: 56px !important;
            padding: 0 40px !important;
            border-radius: 2rem !important;
            font-weight: 700 !important;
            font-size: 12px !important;
            letter-spacing: 0.1em !important;
        }
        .glass-uploader-avatar .ant-upload-list-item {
            border-radius: 2rem !important;
            border: 2px dashed rgba(5, 150, 105, 0.1) !important;
            width: 120px !important;
            height: 120px !important;
            padding: 0 !important;
        }
        .glass-uploader-avatar .ant-upload-select {
            border-radius: 2rem !important;
            border: 2px dashed rgba(5, 150, 105, 0.2) !important;
            background: rgba(5, 150, 105, 0.02) !important;
            width: 120px !important;
            height: 120px !important;
        }
      `}</style>
    </div>
  );
};

export default Users;
