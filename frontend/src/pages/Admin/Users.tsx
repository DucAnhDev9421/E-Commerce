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
  Upload
} from 'antd';
import { 
  UserOutlined,
  PlusOutlined,
  LoadingOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import userApi from '../../api/userApi';
import roleApi from '../../api/roleApi';
import uploadApi from '../../api/uploadApi';
import type { User, Role } from '../../types/auth';
import { getAvatarUrl, BASE_URL } from '../../utils/imageUtils';

const { Title } = Typography;
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
        message: 'Lỗi tải danh sách người dùng',
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
      // Assuming response path is format: { data: "/uploads/abc.jpg" } or { path: "/uploads/abc.jpg" }
      // Check message summary for expected format. Backend generally returns { success: true, data: "/path" }
      const photoPath = response.avatarUrl;
      
      const fullUrl = `${BASE_URL}${photoPath}`;
      setImageUrl(fullUrl);
      form.setFieldsValue({ avatarUrl: photoPath });
      
      notification.success({ message: 'Tải ảnh lên thành công' });
      if (onSuccess) onSuccess("ok");
    } catch (error: any) {
      notification.error({ message: 'Tải ảnh lên thất bại' });
      if (onError) onError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.delete(id);
      notification.success({ message: 'Xóa người dùng thành công' });
      fetchUsers();
    } catch (error: any) {
      notification.error({
        message: 'Xóa người dùng thất bại',
        description: error.response?.data?.message || 'Vui lòng thử lại sau',
      });
    }
  };

  const handleToggleLock = async (user: User) => {
    const isLocked = user.lockTime && new Date(user.lockTime).getTime() > Date.now();
    // Use clear lockTime or set it 100 years ahead
    const newLockTime = isLocked ? null : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    
    try {
      await userApi.update(user._id, { lockTime: newLockTime });
      notification.success({ 
        message: isLocked ? 'Mở khóa người dùng thành công' : 'Khóa người dùng thành công' 
      });
      fetchUsers();
    } catch (error: any) {
      notification.error({
        message: 'Thao tác thất bại',
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
      notification.success({ message: 'Cập nhật người dùng thành công' });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      notification.error({
        message: 'Cập nhật thất bại',
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
      notification.success({ message: 'Thêm người dùng mới thành công' });
      setIsAddModalOpen(false);
      addForm.resetFields();
      setImageUrl(null);
      fetchUsers();
    } catch (error: any) {
      notification.error({
        message: 'Thêm người dùng thất bại',
        description: error.response?.data?.message || 'Vui lòng thử lại sau',
      });
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Avatar',
      dataIndex: 'avatarUrl',
      key: 'avatar',
      width: 80,
      render: (url, record) => (
        <Avatar 
          src={getAvatarUrl(url) || undefined} 
          icon={<UserOutlined />} 
          className="bg-blue-500 shadow-sm"
        >
          {record.fullName.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Username / Email',
      key: 'username_email',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.username}</span>
          <span className="text-xs text-gray-500">{record.email}</span>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Quyền',
      dataIndex: 'role',
      key: 'role',
      render: (role: Role | string) => {
        if (typeof role === 'object' && role !== null) {
          return <Tag color="blue">{role.name.toUpperCase()}</Tag>;
        }
        return <Tag color="default">{String(role).toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const isLocked = record.lockTime && new Date(record.lockTime).getTime() > Date.now();
        if (isLocked) {
          return <Tag color="red">Bị khóa</Tag>;
        }
        if (record.isDeleted) {
          return <Tag color="default">Đã xóa</Tag>;
        }
        return <Tag color="green">Đang hoạt động</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const isLocked = record.lockTime && new Date(record.lockTime).getTime() > Date.now();
        return (
          <Space size="middle">
            <Tooltip title="Chỉnh sửa">
              <Button 
                type="text" 
                icon={<EditOutlined className="text-blue-500 hover:text-blue-600" />} 
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            
            <Tooltip title={isLocked ? "Mở khóa" : "Khóa"}>
              <Button 
                type="text" 
                icon={isLocked ? <UnlockOutlined className="text-orange-500" /> : <LockOutlined className="text-yellow-500" />} 
                onClick={() => handleToggleLock(record)}
              />
            </Tooltip>

            <Popconfirm
              title="Xác nhận xóa người dùng?"
              description="Hành động này sẽ ẩn người dùng khỏi hệ thống."
              onConfirm={() => handleDelete(record._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button 
                  type="text" 
                  icon={<DeleteOutlined className="text-red-500 hover:text-red-600" />} 
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Title level={3} className="!m-0">Quản lý Người dùng</Title>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            placeholder="Tìm theo tên/email..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full sm:w-64 border-gray-200 rounded-lg"
            value={searchText}
            onChange={handleSearch}
            allowClear
          />
          <Select
            placeholder="Lọc theo quyền"
            className="w-full sm:w-48"
            onChange={handleFilterRole}
            allowClear
          >
            {roles.map(role => (
              <Option key={role._id} value={role._id}>
                {role.name}
              </Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            onClick={fetchUsers}
            className="md:w-auto w-full"
          >
            Làm mới
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setImageUrl(null);
              addForm.resetFields();
              setIsAddModalOpen(true);
            }}
            className="md:w-auto w-full bg-green-600 hover:bg-green-700 !border-none"
          >
            Thêm người dùng
          </Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredUsers} 
        rowKey="_id" 
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        className="border border-gray-100 rounded-lg"
      />

      <Modal
        title={
          <div className="flex items-center gap-2 border-b pb-3">
            <EditOutlined className="text-blue-600" />
            <span>Chỉnh sửa Người dùng</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={onFinishEdit}
          className="mt-4"
        >
          <div className="flex flex-col items-center mb-6">
            <Form.Item name="avatarUrl" hidden>
              <Input />
            </Form.Item>
            <Upload
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              customRequest={(options) => handleUpload(options, editForm)}
              accept="image/*"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="avatar" style={{ width: '100%', borderRadius: '8px' }} />
              ) : (
                <div className="flex flex-col items-center">
                  {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>Avatar</div>
                </div>
              )}
            </Upload>
            <p className="text-xs text-gray-400 mt-2">Ảnh đại diện người dùng</p>
          </div>

          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên đầy đủ" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Vai trò (Quyền)"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn quyền">
              {roles.map(role => (
                <Option key={role._id} value={role._id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8">
            <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600 px-6">
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2 border-b pb-3 text-blue-600">
            <PlusOutlined />
            <span className="font-semibold text-gray-800">Thêm người dùng mới</span>
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={onFinishAdd}
          className="mt-6"
          requiredMark="optional"
        >
          <div className="flex flex-col items-center mb-8">
            <Form.Item name="avatarUrl" hidden>
              <Input />
            </Form.Item>
            <Upload
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              customRequest={(options) => handleUpload(options, addForm)}
              accept="image/*"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="avatar" style={{ width: '100%', borderRadius: '8px' }} />
              ) : (
                <div className="flex flex-col items-center">
                  {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
            <p className="text-xs text-gray-400 mt-2 font-medium">Click để upload ảnh đại diện</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item
              name="fullName"
              label={<span className="font-medium">Họ và Tên</span>}
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nguyễn Văn A" className="rounded-md" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="font-medium">Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không đúng định dạng' }
              ]}
            >
              <Input placeholder="example@gmail.com" className="rounded-md" />
            </Form.Item>

            <Form.Item
              name="phone"
              label={<span className="font-medium">Số điện thoại</span>}
              rules={[
                { pattern: /^[0-9]+$/, message: 'Số điện thoại chỉ được chứa số' }
              ]}
            >
              <Input placeholder="0123456789" className="rounded-md" />
            </Form.Item>

            <Form.Item
              name="username"
              label={<span className="font-medium">Tên đăng nhập</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
              <Input placeholder="username123" className="rounded-md" />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="font-medium">Mật khẩu</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
              ]}
            >
              <Input.Password placeholder="••••••" className="rounded-md" />
            </Form.Item>

            <Form.Item
              name="roleId"
              label={<span className="font-medium">Vai trò</span>}
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select placeholder="Chọn quyền" className="rounded-md">
                {roles.map(role => (
                  <Option key={role._id} value={role._id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 mt-10">
            <Button 
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-md px-6 hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="bg-blue-600 hover:bg-blue-700 px-8 rounded-md shadow-md border-none"
            >
              Tạo người dùng
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
