import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, notification,
  Popconfirm, Typography, Tag, Select, Tooltip, InputNumber,
  Upload, Image, Row, Col, Empty, Drawer, Divider, Badge
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, ShoppingOutlined,
  SearchOutlined, ReloadOutlined, EyeOutlined,
  CheckCircleOutlined, StopOutlined,
  PictureOutlined
} from '@ant-design/icons';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';

const { Title, Text } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  in_stock: { label: 'Còn hàng', color: 'success', icon: <CheckCircleOutlined /> },
  out_of_stock: { label: 'Hết hàng', color: 'error', icon: <StopOutlined /> },
  discontinued: { label: 'Ngừng KD', color: 'default', icon: <StopOutlined /> },
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [viewProduct, setViewProduct] = useState<any | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productRes, categoryRes]: any = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
      ]);
      const productList = productRes.items || [];
      setProducts(productList);
      setFiltered(productList);
      setCategories(categoryRes);
    } catch (error: any) {
      notification.error({ title: 'Lỗi tải dữ liệu', description: error?.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Client-side filter
  useEffect(() => {
    let result = [...products];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    if (filterCategory) {
      result = result.filter(p => p.categoryId?._id === filterCategory);
    }
    setFiltered(result);
  }, [searchText, filterCategory, products]);

  const handleAdd = () => {
    setEditingProduct(null);
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({ status: 'in_stock', stock: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingProduct(record);
    form.setFieldsValue({ ...record, categoryId: record.categoryId?._id });
    const imgs = (record.images || []).map((url: string, i: number) => ({
      uid: String(i),
      name: `image-${i}`,
      status: 'done',
      url: getImageUrl(url),
      response: { avatarUrl: url },
    }));
    setFileList(imgs);
    setIsModalOpen(true);
  };

  const handleView = (record: any) => {
    setViewProduct(record);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await productApi.delete(id);
      notification.success({ title: '✅ Xóa sản phẩm thành công' });
      fetchData();
    } catch (error: any) {
      notification.error({ title: 'Lỗi xóa', description: error?.message });
    }
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
      notification.error({ title: 'Lỗi tải ảnh', description: 'Không thể upload ảnh lên server' });
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const imageUrls = fileList
        .filter(f => f.status === 'done')
        .map(f => f.response?.avatarUrl || f.url);
      const data = { ...values, images: imageUrls };
      if (editingProduct) {
        await productApi.update(editingProduct._id, data);
        notification.success({ title: '✅ Cập nhật sản phẩm thành công' });
      } else {
        await productApi.create(data);
        notification.success({ title: '✅ Thêm sản phẩm mới thành công' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      if (error?.name !== 'ValidationError' && error?.name !== 'Error') {
        notification.error({ title: 'Lỗi lưu', description: error?.message });
      }
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const inStockCount = products.filter(p => p.status === 'in_stock').length;
  const outStockCount = products.filter(p => p.status === 'out_of_stock').length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock || 0), 0);

  const columns = [
    {
      title: '#',
      key: 'index', width: 50,
      render: (_: any, __: any, idx: number) => <Text type="secondary" style={{ fontSize: 13 }}>{idx + 1}</Text>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'name', key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {record.images?.[0] ? (
              <img
                src={getImageUrl(record.images[0])}
                alt={text}
                style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 10, border: '2px solid #f1f5f9' }}
                onError={(e: any) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: 10, background: '#f8fafc',
                border: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <PictureOutlined style={{ color: '#cbd5e1', fontSize: 20 }} />
              </div>
            )}
            {record.images?.length > 1 && (
              <div style={{
                position: 'absolute', bottom: -4, right: -4, background: '#3b82f6',
                color: 'white', borderRadius: 10, fontSize: 10, padding: '1px 5px', fontWeight: 700
              }}>
                +{record.images.length - 1}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{record.categoryId?.name || '—'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Giá bán',
      dataIndex: 'price', key: 'price',
      render: (price: number) => (
        <Text strong style={{ color: '#2563eb', fontSize: 14 }}>
          {price?.toLocaleString('vi-VN')}₫
        </Text>
      ),
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: 'Kho',
      dataIndex: 'stock', key: 'stock', width: 90,
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'blue' : stock > 0 ? 'warning' : 'error'} style={{ borderRadius: 20, fontWeight: 600 }}>
          {stock}
        </Tag>
      ),
      sorter: (a: any, b: any) => a.stock - b.stock,
    },
    {
      title: 'Ảnh',
      key: 'images', width: 80,
      render: (_: any, record: any) => (
        <Badge count={record.images?.length || 0} color="#3b82f6">
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default'
          }}>
            <PictureOutlined style={{ color: '#3b82f6' }} />
          </div>
        </Badge>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status', key: 'status', width: 130,
      render: (status: string) => {
        const cfg = statusConfig[status] || statusConfig.in_stock;
        return (
          <Tag icon={cfg.icon} color={cfg.color} style={{ borderRadius: 20, padding: '2px 10px', fontWeight: 500 }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action', width: 160,
      render: (_: any, record: any) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)}
              style={{ color: '#6366f1', borderRadius: 8 }} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleEdit(record)}
              style={{ borderRadius: 8 }} />
          </Tooltip>
          <Popconfirm
            title="Xóa sản phẩm này?"
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
              <ShoppingOutlined style={{ color: '#3b82f6', marginRight: 10 }} />
              Quản lý Sản Phẩm
            </Title>
            <Text type="secondary">Quản lý toàn bộ sản phẩm và hình ảnh</Text>
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
            Thêm Sản Phẩm
          </Button>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          {[
            { label: 'Tổng sản phẩm', value: products.length, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Còn hàng', value: inStockCount, color: '#10b981', bg: '#f0fdf4' },
            { label: 'Hết hàng', value: outStockCount, color: '#ef4444', bg: '#fef2f2' },
            { label: 'Tổng giá trị kho', value: totalValue.toLocaleString('vi-VN') + '₫', color: '#f59e0b', bg: '#fffbeb', isText: true },
          ].map((stat, i) => (
            <Col key={i} xs={12} sm={6} md={6}>
              <div style={{ background: stat.bg, borderRadius: 12, padding: '14px 18px', border: `1px solid ${stat.color}22` }}>
                <div style={{ fontSize: stat.isText ? 16 : 24, fontWeight: 700, color: stat.color, lineHeight: 1.3 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{stat.label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Table Card */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'
        }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 280, borderRadius: 8 }}
          />
          <Select
            placeholder="Lọc theo danh mục"
            allowClear style={{ width: 200, borderRadius: 8 }}
            onChange={v => setFilterCategory(v || '')}
            value={filterCategory || undefined}
          >
            {categories.map(c => (
              <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
            ))}
          </Select>
          <Tooltip title="Làm mới">
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading} style={{ borderRadius: 8 }} />
          </Tooltip>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10, showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
            style: { padding: '16px 20px' }
          }}
          locale={{ emptyText: <Empty description="Chưa có sản phẩm nào" style={{ padding: '40px 0' }} /> }}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {editingProduct ? <EditOutlined style={{ color: 'white' }} /> : <PlusOutlined style={{ color: 'white' }} />}
            </div>
            <span style={{ fontWeight: 700 }}>{editingProduct ? 'Chỉnh sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu lại" cancelText="Hủy bỏ"
        confirmLoading={saving}
        okButtonProps={{ style: { borderRadius: 8, background: '#3b82f6', border: 'none', fontWeight: 600 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
        destroyOnClose
        width={720}
      >
        <Form
          form={form} layout="vertical"
          style={{ marginTop: 16 }}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label={<b>Tên Sản Phẩm</b>}
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
              >
                <Input placeholder="iPhone 15 Pro Max..." size="large" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="slug" label={<b>Slug (tự động)</b>}
                rules={[{ required: true, message: 'Slug không được trống!' }]}
              >
                <Input placeholder="iphone-15-pro-max" size="large" style={{ borderRadius: 8 }} addonBefore="/" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="price" label={<b>Giá bán (VNĐ)</b>}
                rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
              >
                <InputNumber
                  className="w-full" style={{ width: '100%', borderRadius: 8 }}
                  min={0} size="large"
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v!.replace(/,/g, '') as any}
                  placeholder="32,000,000"
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="stock" label={<b>Số lượng kho</b>}
                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
              >
                <InputNumber style={{ width: '100%', borderRadius: 8 }} min={0} size="large" placeholder="100" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="categoryId" label={<b>Danh mục</b>}
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select placeholder="Chọn danh mục" size="large" style={{ borderRadius: 8 }}>
                  {categories.map(cat => (
                    <Select.Option key={cat._id} value={cat._id}>{cat.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label={<b>Mô tả sản phẩm</b>}>
            <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết về sản phẩm..." style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="status" label={<b>Trạng thái</b>} initialValue="in_stock">
            <Select size="large" style={{ borderRadius: 8 }}>
              <Select.Option value="in_stock">✅ Còn hàng</Select.Option>
              <Select.Option value="out_of_stock">❌ Hết hàng</Select.Option>
              <Select.Option value="discontinued">🚫 Ngừng kinh doanh</Select.Option>
            </Select>
          </Form.Item>

          {/* Image Upload Section */}
          <Divider orientation={"left" as any}>
            <Space><PictureOutlined /><b>Hình ảnh sản phẩm</b></Space>
          </Divider>

          <Form.Item>
            <Upload
              customRequest={handleUpload}
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newList }) => setFileList(newList)}
              accept="image/*"
              multiple
            >
              {fileList.length >= 8 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8, fontSize: 12 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hỗ trợ JPG, PNG, WebP. Tối đa 8 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.
            </Text>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Product Drawer */}
      <Drawer
        title="Chi tiết Sản Phẩm"
        placement="right"
        width={480}
        onClose={() => setIsViewOpen(false)}
        open={isViewOpen}
        extra={
          <Button type="primary" icon={<EditOutlined />}
            onClick={() => { setIsViewOpen(false); if (viewProduct) handleEdit(viewProduct); }}
            style={{ borderRadius: 8 }}
          >
            Chỉnh sửa
          </Button>
        }
      >
        {viewProduct && (
          <div>
            {/* Images Gallery */}
            {viewProduct.images?.length > 0 ? (
              <div style={{ marginBottom: 20 }}>
                <Image.PreviewGroup>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {viewProduct.images.map((url: string, i: number) => (
                      <Image
                        key={i}
                        src={getImageUrl(url)}
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsEAAA7BAbiRa+0AAAANSURBVBhXYzAAAQEABQABMjKGgAAAABJRU5ErkJggg=="
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            ) : (
              <div style={{
                height: 160, background: '#f8fafc', borderRadius: 12, marginBottom: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8
              }}>
                <PictureOutlined style={{ fontSize: 32, color: '#cbd5e1' }} />
                <Text type="secondary">Chưa có hình ảnh</Text>
              </div>
            )}

            <Title level={4} style={{ margin: '0 0 4px' }}>{viewProduct.name}</Title>
            <Text type="secondary" style={{ fontSize: 13 }}>/{viewProduct.slug}</Text>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Danh mục', value: viewProduct.categoryId?.name || '—' },
                { label: 'Giá bán', value: `${viewProduct.price?.toLocaleString('vi-VN')}₫`, bold: true, color: '#2563eb' },
                { label: 'Tồn kho', value: `${viewProduct.stock} sản phẩm` },
                { label: 'Số ảnh', value: `${viewProduct.images?.length || 0} ảnh` },
                { label: 'Mô tả', value: viewProduct.description || '(Không có mô tả)' },
                { label: 'Ngày tạo', value: new Date(viewProduct.createdAt).toLocaleString('vi-VN') },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <Text type="secondary" style={{ fontSize: 13, minWidth: 90 }}>{item.label}</Text>
                  <Text strong={item.bold} style={{ color: item.color, textAlign: 'right', maxWidth: 260 }}>{item.value}</Text>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>Trạng thái</Text>
                <Tag
                  icon={statusConfig[viewProduct.status]?.icon}
                  color={statusConfig[viewProduct.status]?.color}
                  style={{ borderRadius: 20, padding: '2px 10px', fontWeight: 500 }}
                >
                  {statusConfig[viewProduct.status]?.label}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Products;
