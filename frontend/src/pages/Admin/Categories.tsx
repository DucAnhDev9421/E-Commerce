import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, notification,
  Popconfirm, Typography, Tag, Select, Tooltip, Badge, Drawer,
  Statistic, Row, Col, Empty, Spin, Switch, Upload, Image
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, UnorderedListOutlined,
  SearchOutlined, ReloadOutlined, EyeOutlined, TagsOutlined,
  CheckCircleOutlined, StopOutlined, InfoCircleOutlined, PictureOutlined
} from '@ant-design/icons';
import categoryApi from '../../api/categoryApi';
import productApi from '../../api/productApi';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

const { Title, Text } = Typography;

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [viewCategory, setViewCategory] = useState<any | null>(null);
  const [searchText, setSearchText] = useState('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await categoryApi.getAll();
      setCategories(response);
      setFiltered(response);
    } catch (error: any) {
      notification.error({ message: 'Lỗi', description: error?.message || 'Không thể tải danh mục' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Search filter
  useEffect(() => {
    if (!searchText.trim()) {
      setFiltered(categories);
    } else {
      const q = searchText.toLowerCase();
      setFiltered(categories.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      ));
    }
  }, [searchText, categories]);

  const handleAdd = () => {
    setEditingCategory(null);
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    if (record.image) {
      setFileList([{
        uid: '1',
        name: 'image.png',
        status: 'done',
        url: getImageUrl(record.image),
        response: { avatarUrl: record.image }
      }]);
    } else {
      setFileList([]);
    }
    setIsModalOpen(true);
  };

  const handleUpload = async (options: any) => {
    const { onSuccess, onError, file } = options;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res: any = await productApi.uploadImage(formData);
      onSuccess(res);
    } catch (err: any) {
      onError(err);
      notification.error({ message: 'Lỗi tải ảnh', description: 'Không thể upload ảnh lên server' });
    }
  };

  const handleView = (record: any) => {
    setViewCategory(record);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryApi.delete(id);
      notification.success({ message: '✅ Xóa danh mục thành công' });
      fetchCategories();
    } catch (error: any) {
      notification.error({ message: 'Lỗi xóa', description: error?.message });
    }
  };

  const handleModalOk = async () => {
    try {
      const formValues = await form.validateFields();
      const imageUrls = fileList
        .filter(f => f.status === 'done')
        .map(f => f.response?.avatarUrl || f.url);
      const values = { ...formValues, image: imageUrls.length > 0 ? imageUrls[0] : '' };

      if (editingCategory) {
        await categoryApi.update(editingCategory._id, values);
        notification.success({ message: '✅ Cập nhật danh mục thành công' });
      } else {
        await categoryApi.create(values);
        notification.success({ message: '✅ Thêm danh mục mới thành công' });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      if (error?.name !== 'ValidationError' && error?.name !== 'Error') {
        notification.error({ message: 'Lỗi lưu', description: error?.message });
      }
    }
  };

  // Stats
  const activeCount = categories.filter(c => c.status === 'active').length;
  const inactiveCount = categories.filter(c => c.status !== 'active').length;

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <Text type="secondary" style={{ fontSize: 13 }}>{index + 1}</Text>
      ),
    },
    {
      title: 'Danh Mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {record.image ? (
              <img
                src={getImageUrl(record.image)}
                alt={text}
                style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '2px solid #f1f5f9' }}
                onError={(e: any) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{
                width: 44, height: 44, borderRadius: 8,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <TagsOutlined style={{ color: 'white', fontSize: 20 }} />
              </div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>/{record.slug}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>{text || '—'}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => (
        <Tag
          icon={status === 'active' ? <CheckCircleOutlined /> : <StopOutlined />}
          color={status === 'active' ? 'success' : 'error'}
          style={{ borderRadius: 20, padding: '2px 10px', fontWeight: 500 }}
        >
          {status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {date ? new Date(date).toLocaleDateString('vi-VN') : '—'}
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 160,
      render: (_: any, record: any) => (
        <Space size={6}>
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
            title="Xóa danh mục này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa" cancelText="Hủy"
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
    <div style={{ padding: '0 4px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              <TagsOutlined style={{ color: '#3b82f6', marginRight: 10 }} />
              Quản lý Danh Mục
            </Title>
            <Text type="secondary">Quản lý các nhóm sản phẩm trong hệ thống</Text>
          </div>
          <Button
            type="primary" icon={<PlusOutlined />} size="large"
            onClick={handleAdd}
            style={{
              borderRadius: 10, height: 44, paddingInline: 24, fontWeight: 600,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none', boxShadow: '0 4px 15px rgba(59,130,246,0.4)'
            }}
          >
            Thêm Danh Mục
          </Button>
        </div>

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          {[
            { label: 'Tổng danh mục', value: categories.length, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Đang hoạt động', value: activeCount, color: '#10b981', bg: '#f0fdf4' },
            { label: 'Tạm dừng', value: inactiveCount, color: '#ef4444', bg: '#fef2f2' },
          ].map((stat, i) => (
            <Col key={i} xs={8} sm={8} md={8}>
              <div style={{
                background: stat.bg, borderRadius: 12, padding: '16px 20px',
                border: `1px solid ${stat.color}22`
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{stat.label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Table Card */}
      <div style={{
        background: 'white', borderRadius: 16, boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}>
        {/* Toolbar */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap'
        }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm kiếm danh mục..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 300, borderRadius: 8 }}
          />
          <Tooltip title="Làm mới">
            <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loading} style={{ borderRadius: 8 }} />
          </Tooltip>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} danh mục`,
            style: { padding: '16px 20px' }
          }}
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          locale={{ emptyText: <Empty description="Chưa có danh mục nào" style={{ padding: '40px 0' }} /> }}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {editingCategory ? <EditOutlined style={{ color: 'white' }} /> : <PlusOutlined style={{ color: 'white' }} />}
            </div>
            <span style={{ fontWeight: 700 }}>{editingCategory ? 'Chỉnh sửa Danh Mục' : 'Thêm Danh Mục Mới'}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu lại" cancelText="Hủy bỏ"
        okButtonProps={{ style: { borderRadius: 8, background: '#3b82f6', border: 'none', fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        destroyOnClose
        width={520}
      >
        <Form
          form={form} layout="vertical"
          style={{ marginTop: 20 }}
          onValuesChange={(changed) => {
            if (changed.name) {
              const slug = changed.name
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^\w ]+/g, '').replace(/ +/g, '-');
              form.setFieldsValue({ slug });
            }
          }}
        >
          <Form.Item name="name" label={<b>Tên Danh Mục</b>}
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Ví dụ: Điện thoại, Laptop..." size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="slug" label={<b>Slug (tự động)</b>}
            rules={[{ required: true, message: 'Slug không được để trống!' }]}
          >
            <Input placeholder="dien-thoai" size="large" style={{ borderRadius: 8 }} addonBefore="/" />
          </Form.Item>

          <Form.Item name="description" label={<b>Mô tả</b>}>
            <Input.TextArea rows={3} placeholder="Nhập mô tả ngắn về danh mục..." style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="status" label={<b>Trạng thái</b>} initialValue="active">
            <Select size="large" style={{ borderRadius: 8 }}>
              <Select.Option value="active">✅ Hoạt động</Select.Option>
              <Select.Option value="inactive">⏸️ Tạm dừng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={<b>Ảnh minh họa</b>}>
            <Upload
              customRequest={handleUpload}
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newList }) => setFileList(newList)}
              accept="image/*"
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8, fontSize: 12 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Detail Drawer */}
      <Drawer
        title="Chi tiết Danh Mục"
        placement="right"
        width={400}
        onClose={() => setIsViewOpen(false)}
        open={isViewOpen}
      >
        {viewCategory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
              borderRadius: 12, padding: 20, textAlign: 'center'
            }}>
              {viewCategory.image ? (
                <div style={{ margin: '0 auto 12px', display: 'flex', justifyContent: 'center' }}>
                  <Image
                    src={getImageUrl(viewCategory.image)}
                    style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 16, border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </div>
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: 16, margin: '0 auto 12px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <TagsOutlined style={{ color: 'white', fontSize: 28 }} />
                </div>
              )}
              <Title level={4} style={{ margin: 0 }}>{viewCategory.name}</Title>
              <Text type="secondary">/{viewCategory.slug}</Text>
            </div>

            {[
              { label: 'Mô tả', value: viewCategory.description || '(Không có)' },
              { label: 'Trạng thái', value: viewCategory.status === 'active' ? '✅ Hoạt động' : '⏸️ Tạm dừng' },
              { label: 'Ngày tạo', value: new Date(viewCategory.createdAt).toLocaleString('vi-VN') },
              { label: 'Cập nhật', value: new Date(viewCategory.updatedAt).toLocaleString('vi-VN') },
            ].map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{item.label}</Text>
                <Text strong>{item.value}</Text>
              </div>
            ))}

            <Space style={{ width: '100%' }}>
              <Button type="primary" icon={<EditOutlined />} block
                onClick={() => { setIsViewOpen(false); handleEdit(viewCategory); }}
                style={{ borderRadius: 8, flex: 1 }}
              >
                Chỉnh sửa
              </Button>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Categories;
