import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, notification, Popconfirm, Card, Typography, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import roleApi from '../../api/roleApi';
import type { Role } from '../../types/auth';

const { Title, Text } = Typography;

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response: any = await roleApi.getAll();
      setRoles(response);
    } catch (error: any) {
      notification.error({
        message: 'Lỗi tải danh sách quyền',
        description: error?.message || 'Có lỗi xảy ra',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

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
      notification.success({ message: 'Xóa quyền thành công' });
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
        notification.success({ message: 'Cập nhật quyền thành công' });
      } else {
        await roleApi.create(values);
        notification.success({ message: 'Thêm quyền mới thành công' });
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (error: any) {
      if (error.name !== 'ValidationError') {
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
          <SafetyCertificateOutlined className="text-blue-500" />
          <span className="font-bold">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      render: (isDeleted: boolean) => (
        <Tag color={isDeleted ? 'red' : 'green'}>
          {isDeleted ? 'Đã xóa' : 'Đang hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Role) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa quyền này không?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý Quyền (Roles)</Title>
          <Text type="secondary">Tạo và phân quyền cho người dùng hệ thống</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={handleAdd}
          className="rounded-lg shadow-sm"
        >
          Thêm Quyền Mới
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Table 
          columns={columns} 
          dataSource={roles} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingRole ? 'Chỉnh sửa Quyền' : 'Thêm Quyền Mới'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="name"
            label="Tên Quyền (ROLE_NAME)"
            rules={[
              { required: true, message: 'Vui lòng nhập tên quyền!' },
              { pattern: /^[A-Z_]+$/, message: 'Tên quyền nên là chữ in hoa (Ví dụ: ADMIN, MANAGER)!' }
            ]}
          >
            <Input placeholder="Ví dụ: MANAGER" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả của quyền này..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Roles;
