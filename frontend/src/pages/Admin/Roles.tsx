import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, notification,
  Popconfirm, Typography, Tag, Tooltip, Row, Col, Empty, Card
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, SafetyCertificateOutlined,
  SearchOutlined, ReloadOutlined, CheckCircleOutlined,
  StopOutlined, KeyOutlined, SolutionOutlined
} from '@ant-design/icons';
import roleApi from '../../api/roleApi';
import type { Role } from '../../types/auth';

const { Title, Text } = Typography;

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filtered, setFiltered] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await roleApi.getAll();
      setRoles(response);
      setFiltered(response);
    } catch (error: any) {
      notification.error({
        message: 'Lỗi tải danh sách quyền',
        description: error?.message || 'Có lỗi xảy ra',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Search filter
  useEffect(() => {
    if (!searchText.trim()) {
      setFiltered(roles);
    } else {
      const q = searchText.toLowerCase();
      setFiltered(roles.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      ));
    }
  }, [searchText, roles]);

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Role) => {
    setEditingRole(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await roleApi.delete(id);
      notification.success({ message: '✅ Xóa quyền thành công' });
      fetchRoles();
    } catch (error: any) {
      notification.error({
        message: 'Lỗi xóa quyền',
        description: error?.message,
      });
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await roleApi.update(editingRole._id, values);
        notification.success({ message: '✅ Cập nhật quyền thành công' });
      } else {
        await roleApi.create(values);
        notification.success({ message: '✅ Thêm quyền mới thành công' });
      }
      setIsModalOpen(false);
      fetchRoles();
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
      title: 'Tên Quyền',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <SafetyCertificateOutlined style={{ color: 'white', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>Định danh hệ thống</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: 14 }}>{text || '—'}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      render: (isDeleted: boolean) => (
        <Tag
          icon={!isDeleted ? <CheckCircleOutlined /> : <StopOutlined />}
          color={!isDeleted ? 'success' : 'error'}
          style={{ borderRadius: 20, padding: '2px 12px', fontWeight: 600 }}
        >
          {!isDeleted ? 'Đang hoạt động' : 'Đã xóa'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: Role) => (
        <Space size={8}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ borderRadius: 8 }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa quyền này?"
            description="Lưu ý: Bạn nên cẩn thận khi xóa các quyền hệ thống quan trọng."
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
            <Title level={2} style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              <SolutionOutlined style={{ color: '#2563eb', marginRight: 12 }} />
              Phân quyền ứng dụng
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Quản trị và thiết lập các vai trò người dùng trong hệ thống
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleAdd}
            style={{
              height: 48,
              borderRadius: 12,
              paddingInline: 24,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
            }}
          >
            THÊM QUYỀN MỚI
          </Button>
        </div>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={8}>
            <Card style={{ borderRadius: 20, border: 'none', background: '#eff6ff' }} bodyStyle={{ padding: 20 }}>
              <div style={{ fontSize: 14, color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                 <KeyOutlined /> TỔNG VAI TRÒ
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1e40af', marginTop: 8 }}>{roles.length}</div>
            </Card>
          </Col>
        </Row>
      </div>

      <Card
        style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm kiếm theo tên quyền hoặc mô tả..."
            style={{ maxWidth: 350, height: 44, borderRadius: 12, border: '1px solid #e2e8f0' }}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <Tooltip title="Làm mới dữ liệu">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchRoles}
              style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
          locale={{
            emptyText: <Empty description="Chưa có vai trò nào" style={{ padding: '60px 0' }} />
          }}
        />
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <SafetyCertificateOutlined style={{ color: '#2563eb', fontSize: 20 }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18 }}>
              {editingRole ? 'CHỈNH SỬA QUYỀN' : 'THÊM QUYỀN MỚI'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="XÁC NHẬN"
        cancelText="HỦY BỎ"
        destroyOnClose
        width={500}
        okButtonProps={{
          style: { height: 44, borderRadius: 12, fontWeight: 700, paddingInline: 24 }
        }}
        cancelButtonProps={{
          style: { height: 44, borderRadius: 12 }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 12 }}
        >
          <Form.Item
            name="name"
            label={<b style={{ color: '#64748b' }}>TÊN QUYỀN (VÍ DỤ: ADMIN, CUSTOMER)</b>}
            rules={[
              { required: true, message: 'Vui lòng nhập tên quyền!' },
              { pattern: /^[A-Z_]+$/, message: 'Tên quyền nên là chữ in hoa và dấu gạch dưới!' }
            ]}
          >
            <Input 
              placeholder="VÍ_DỤ: MODERATOR" 
              style={{ height: 48, borderRadius: 12 }} 
            />
          </Form.Item>
          <Form.Item
            name="description"
            label={<b style={{ color: '#64748b' }}>MÔ TẢ CỦA QUYỀN</b>}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập chi tiết về quyền hạn này..." 
              style={{ borderRadius: 12 }} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Roles;
