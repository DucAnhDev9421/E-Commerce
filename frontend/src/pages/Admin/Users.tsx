import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, notification,
  Popconfirm, Typography, Tag, Tooltip, Avatar, Row, Col, Card,
  Empty, Select, Badge, Drawer, Divider
} from 'antd';
import {
  EditOutlined, DeleteOutlined, UserOutlined,
  SearchOutlined, ReloadOutlined, EyeOutlined, MailOutlined,
  PhoneOutlined, UserAddOutlined, TeamOutlined, FilterOutlined
} from '@ant-design/icons';
import userApi from '../../api/userApi';
import roleApi from '../../api/roleApi';

const { Title, Text } = Typography;

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, roleRes]: any = await Promise.all([
        userApi.getAll(),
        roleApi.getAll()
      ]);
      setUsers(userRes);
      setFiltered(userRes);
      setRoles(roleRes);
    } catch (error: any) {
      notification.error({
        message: 'Lỗi tải danh sách người dùng',
        description: error?.message || 'Có lỗi xảy ra',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Search and filter
  useEffect(() => {
    let result = [...users];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(u =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q)
      );
    }
    if (filterRole) {
      result = result.filter(u => 
        (typeof u.role === 'object' ? u.role?._id : u.role) === filterRole
      );
    }
    setFiltered(result);
  }, [searchText, filterRole, users]);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingUser(record);
    form.setFieldsValue({
        ...record,
        role: typeof record.role === 'object' ? record.role?._id : record.role
    });
    setIsModalOpen(true);
  };

  const handleView = (record: any) => {
    setViewUser(record);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.delete(id);
      notification.success({ message: '✅ Xóa người dùng thành công' });
      fetchData();
    } catch (error: any) {
      notification.error({
        message: 'Lỗi xóa người dùng',
        description: error?.message,
      });
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userApi.update(editingUser._id, values);
        notification.success({ message: '✅ Cập nhật người dùng thành công' });
      } else {
        await userApi.create(values);
        notification.success({ message: '✅ Thêm người dùng mới thành công' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      if (error?.name !== 'ValidationError') {
        notification.error({
          message: 'Lỗi lưu thông tin',
          description: error?.message,
        });
      }
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'fullName',
      key: 'name',
      render: (text: string, record: any) => (
        <Space size="middle">
          <Avatar 
            src={record.avatarUrl} 
            icon={<UserOutlined />} 
            size={48}
            style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                boxShadow: '0 4px 10px rgba(59,130,246,0.2)'
            }} 
          />
          <div>
            <Title level={5} style={{ margin: 0, fontSize: 15 }}>{text || 'Chưa cập nhật'}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>@{record.username}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Space><MailOutlined style={{ fontSize: 12, color: '#94a3b8' }} /> <Text style={{ fontSize: 13 }}>{record.email}</Text></Space>
          <Space><PhoneOutlined style={{ fontSize: 12, color: '#94a3b8' }} /> <Text style={{ fontSize: 13 }}>{record.phone || '—'}</Text></Space>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: any) => {
        const roleName = typeof role === 'object' ? role?.name : role;
        const color = roleName === 'ADMIN' ? 'volcano' : roleName === 'MANAGER' ? 'purple' : 'blue';
        return (
          <Tag color={color} style={{ borderRadius: 20, fontWeight: 700, padding: '2px 12px' }}>
            {roleName || 'CUSTOMER'}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'status',
      render: (isDeleted: boolean) => (
        <Badge status={!isDeleted ? 'success' : 'error'} text={!isDeleted ? 'Hoạt động' : 'Tạm khóa'} />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space size={8}>
          <Tooltip title="Xem chi tiết">
            <Button 
                type="text" icon={<EyeOutlined />} 
                onClick={() => handleView(record)}
                style={{ color: '#6366f1', borderRadius: 8 }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
                type="primary" ghost icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
                style={{ borderRadius: 8 }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa người dùng này?"
            description="Hành động này sẽ thực hiện vô hiệu hóa tài khoản (Soft Delete)."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button danger ghost icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '4px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase' }}>
              <TeamOutlined style={{ color: '#2563eb', marginRight: 12 }} />
              Quản lý người dùng
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Tra cứu, phân quyền và quản trị thông tin tài khoản hệ thống
            </Text>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            size="large"
            onClick={handleAdd}
            style={{
              height: 48, borderRadius: 12, paddingInline: 24, fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none', boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
            }}
          >
            THÊM NGƯỜI DÙNG
          </Button>
        </div>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col xs={24} md={8}>
            <Card style={{ borderRadius: 20, border: 'none', background: '#eff6ff', marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
              <div style={{ fontSize: 14, color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                 <UserOutlined /> TỔNG ACCOUNT
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1e40af', marginTop: 8 }}>{users.length}</div>
            </Card>
          </Col>
        </Row>
      </div>

      <Card
        style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <Space size={12} className="flex-1">
            <Input
                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Tìm tên, email, username..."
                style={{ width: 300, height: 44, borderRadius: 12 }}
                onChange={e => setSearchText(e.target.value)}
                allowClear
            />
            <Select
                placeholder="Lọc theo quyền"
                style={{ width: 180, height: 44 }}
                onChange={v => setFilterRole(v)}
                allowClear
                suffixIcon={<FilterOutlined />}
                dropdownStyle={{ borderRadius: 12 }}
            >
                {roles.map(r => (
                    <Select.Option key={r._id} value={r._id}>{r.name}</Select.Option>
                ))}
            </Select>
          </Space>
          <Tooltip title="Làm mới">
            <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchData} 
                className="h-11 w-11 flex items-center justify-center rounded-xl"
            />
          </Tooltip>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            style: { padding: '24px' }
          }}
          locale={{ emptyText: <Empty description="Chức năng đang được cập nhật dữ liệu" /> }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div style={{ paddingBottom: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 18 }}>
              {editingUser ? 'CẬP NHẬT NGƯỜI DÙNG' : 'TẠO TÀI KHOẢN MỚI'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="XÁC NHẬN"
        cancelText="HỦY BỎ"
        destroyOnClose
        width={600}
        okButtonProps={{ style: { height: 44, borderRadius: 12, fontWeight: 700 } }}
        cancelButtonProps={{ style: { height: 44, borderRadius: 12 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label={<b>Họ và tên</b>} rules={[{ required: true }]}>
                <Input placeholder="Nguyễn Văn A" style={{ height: 48, borderRadius: 12 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="username" label={<b>Username</b>} rules={[{ required: true }]}>
                <Input placeholder="username123" style={{ height: 48, borderRadius: 12 }} disabled={!!editingUser} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label={<b>Email</b>} rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="user@gmail.com" style={{ height: 48, borderRadius: 12 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={<b>Số điện thoại</b>}>
                <Input placeholder="09xxxxxxx" style={{ height: 48, borderRadius: 12 }} />
              </Form.Item>
            </Col>
          </Row>
          {!editingUser && (
            <Form.Item name="password" label={<b>Mật khẩu đăng nhập</b>} rules={[{ required: true }]}>
              <Input.Password placeholder="******" style={{ height: 48, borderRadius: 12 }} />
            </Form.Item>
          )}
          <Form.Item name="role" label={<b>Gán vai trò hệ thống</b>} rules={[{ required: true }]}>
            <Select placeholder="Chọn quyền truy cập" size="large" style={{ width: '100%', borderRadius: 12 }}>
              {roles.map(r => (
                <Select.Option key={r._id} value={r._id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Details Drawer */}
      <Drawer
        title="Thông tin chi tiết người dùng"
        width={450}
        onClose={() => setIsViewOpen(false)}
        open={isViewOpen}
      >
        {viewUser && (
            <div style={{ textAlign: 'center' }}>
                <Avatar 
                    src={viewUser.avatarUrl} 
                    icon={<UserOutlined />} 
                    size={100} 
                    style={{ background: '#2563eb', marginBottom: 16 }} 
                />
                <Title level={3} style={{ margin: 0 }}>{viewUser.fullName}</Title>
                <Text type="secondary">@{viewUser.username} • {viewUser.role?.name || 'CUSTOMER'}</Text>
                
                <Divider />
                
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>ĐỊA CHỈ EMAIL</Text>
                        <div style={{ fontWeight: 600 }}>{viewUser.email}</div>
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>SỐ ĐIỆN THOẠI</Text>
                        <div style={{ fontWeight: 600 }}>{viewUser.phone || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>NGÀY THAM GIA</Text>
                        <div style={{ fontWeight: 600 }}>{new Date(viewUser.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>TRẠNG THÁI TÀI KHOẢN</Text>
                        <div>
                            <Tag color={!viewUser.isDeleted ? 'green' : 'red'}>
                                {!viewUser.isDeleted ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                            </Tag>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </Drawer>
    </div>
  );
};

export default Users;
