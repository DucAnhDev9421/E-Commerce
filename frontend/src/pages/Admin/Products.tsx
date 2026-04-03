import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, notification,
  Popconfirm, Typography, Tag, Select, Tooltip, InputNumber,
  Upload, Image, Row, Col, Empty, Drawer, Divider
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, ShoppingOutlined,
  SearchOutlined, ReloadOutlined, EyeOutlined,
  CheckCircleOutlined, StopOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';

const { Title, Text, Paragraph } = Typography;

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
  const outStockCount = products.filter(p => p.status === 'out_of_stock').length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

  const columns = [
    {
      title: '#',
      key: 'index', width: 60,
      render: (_: any, __: any, idx: number) => <Text className="text-text/30 font-mono font-bold">{idx + 1}</Text>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'name', key: 'name',
      render: (text: string, record: any) => (
        <Space size="middle" className="py-2">
          <div className="relative shrink-0 group">
            {record.images?.[0] ? (
              <img
                src={getImageUrl(record.images[0])}
                alt={text}
                className="w-16 h-16 object-contain rounded-2xl bg-white p-2 border border-emerald-50 shadow-sm transition-transform group-hover:scale-110"
                onError={(e: any) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/50 border border-white flex items-center justify-center">
                <PictureOutlined className="text-text/10 text-2xl" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <Text strong className="text-base tracking-tight leading-tight mb-1">{text}</Text>
            <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{record.categoryId?.name || 'KHÔNG CÓ DANH MỤC'}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Giá bán',
      dataIndex: 'price', key: 'price',
      width: 150,
      render: (price: number) => (
        <div className="flex flex-col">
          <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">ĐƠN GIÁ</Text>
          <Text strong className="text-emerald-600 text-lg">
            {price?.toLocaleString('vi-VN')}₫
          </Text>
        </div>
      ),
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: 'Kho hàng',
      dataIndex: 'stock', key: 'stock', width: 120,
      render: (stock: number) => (
        <div className="flex flex-col">
            <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">TỒN KHO</Text>
            <div className={`mt-1 inline-flex items-center gap-2 font-bold ${stock > 10 ? 'text-emerald-600' : stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                {stock} <Text className="text-[10px] font-light text-text/40">SẢN PHẨM</Text>
            </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.stock - b.stock,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status', key: 'status', width: 150,
      render: (status: string) => {
        const cfg = statusConfig[status] || statusConfig.in_stock;
        return (
          <div className={`px-4 py-1.5 rounded-full inline-flex items-center gap-2 border ${
            status === 'in_stock' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
            status === 'out_of_stock' ? 'bg-red-50 border-red-100 text-red-600' : 
            'bg-gray-50 border-gray-100 text-gray-600'
          }`}>
             <div className="w-1.5 h-1.5 rounded-full bg-current" />
             <Text strong className="text-[10px] uppercase tracking-widest text-current">{cfg.label}</Text>
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action', width: 180,
      render: (_: any, record: any) => (
        <Space size={8}>
          <Tooltip title="Xem chi tiết">
            <Button 
                shape="circle" 
                icon={<EyeOutlined />} 
                onClick={() => handleView(record)}
                className="bg-blue-50 text-blue-600 border-none hover:bg-blue-100 transition-colors" 
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
                shape="circle" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
                className="bg-emerald-50 text-emerald-600 border-none hover:bg-emerald-100 transition-colors" 
            />
          </Tooltip>
          <Popconfirm
            title="Xóa sản phẩm này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa" cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button 
                shape="circle" 
                danger 
                icon={<DeleteOutlined />} 
                className="bg-red-50 text-red-600 border-none hover:bg-red-100 transition-colors" 
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Stats Island */}
      <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-8 border border-white/60 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <Title level={2} className="!m-0 !font-serif tracking-tight">Quản lý Sản phẩm</Title>
            <Text className="text-text/30 font-bold uppercase tracking-[0.3em] text-[10px]">TOTAL INVENTORY & CATALOG CONTROL</Text>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'Sản phẩm', value: products.length, icon: <ShoppingOutlined />, color: '#059669' },
                { label: 'Hết hàng', value: outStockCount, icon: <ThunderboltOutlined />, color: '#ef4444' },
                { label: 'Giá trị', value: (Math.round(totalValue / 1000000)) + 'M₫', icon: <RiseOutlined />, color: '#7c3aed' },
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
            onClick={handleAdd}
            className="h-16 px-10 rounded-[2rem] bg-emerald-600 border-none font-bold tracking-widest text-xs uppercase shadow-xl shadow-emerald-200 hover:scale-105 transition-all"
          >
            THÊM SẢN PHẨM MỚI
          </Button>
        </div>
      </div>

      {/* Main Table - Premium Glass */}
      <div className="bg-white/40 backdrop-blur-md rounded-[3.5rem] border border-white/80 shadow-2xl overflow-hidden glass-panel relative">
        {/* Toolbar */}
        <div className="p-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Input
                    prefix={<SearchOutlined className="text-emerald-600" />}
                    placeholder="Tìm kiếm theo tên sản phẩm..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                    className="h-12 w-full md:w-80 rounded-2xl border-none bg-white/60 shadow-sm focus:bg-white transition-all pl-4"
                />
                <Select
                    placeholder="Lọc danh mục"
                    allowClear 
                    className="h-12 w-full md:w-60 custom-glass-select"
                    onChange={v => setFilterCategory(v || '')}
                    value={filterCategory || undefined}
                >
                    {categories.map(c => (
                    <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
                    ))}
                </Select>
            </div>
            
            <div className="flex items-center gap-3">
                <Tooltip title="Làm mới dữ liệu">
                    <Button 
                        shape="circle" 
                        icon={<ReloadOutlined />} 
                        onClick={fetchData} 
                        loading={loading}
                        className="bg-white/60 text-emerald-600 border-none shadow-sm hover:scale-110"
                    />
                </Tooltip>
                <div className="h-6 w-px bg-text/10" />
                <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">SẮP XẾP MỚI NHẤT</Text>
            </div>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          className="premium-admin-table"
          pagination={{
            pageSize: 10, 
            showSizeChanger: true,
            showTotal: (total) => <Text className="font-bold text-text/30 text-xs">TỔNG CỘNG {total} SẢN PHẨM</Text>,
            className: "px-8 py-6"
          }}
          locale={{ emptyText: <Empty description="Chưa có sản phẩm nào" className="p-20" /> }}
        />
      </div>

      {/* Product Drawer (View) */}
      <Drawer
        title={<Title level={3} className="!m-0 !font-serif">Chi tiết sản phẩm</Title>}
        placement="right"
        width={560}
        onClose={() => setIsViewOpen(false)}
        open={isViewOpen}
        className="glass-panel"
        extra={
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => { setIsViewOpen(false); if (viewProduct) handleEdit(viewProduct); }}
            className="h-12 px-6 rounded-2xl bg-emerald-600 border-none font-bold text-xs tracking-widest uppercase shadow-xl"
          >
            SỬA NGAY
          </Button>
        }
      >
        {viewProduct && (
          <div className="space-y-10">
            {/* Image Gallery */}
            <div className="bg-white/40 rounded-[2.5rem] p-6 border border-white/60">
                {viewProduct.images?.length > 0 ? (
                    <Image.PreviewGroup>
                    <div className="grid grid-cols-3 gap-4">
                        {viewProduct.images.map((url: string, i: number) => (
                        <Image
                            key={i}
                            src={getImageUrl(url)}
                            className="w-full aspect-square object-contain rounded-2xl bg-white border border-emerald-50 p-2 shadow-sm"
                        />
                        ))}
                    </div>
                    </Image.PreviewGroup>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-text/20">
                        <PictureOutlined className="text-5xl mb-4" />
                        <Text strong>Chưa có hình ảnh</Text>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em]">MÃ SẢN PHẨM: {viewProduct._id}</Text>
                <Title level={2} className="!m-0 !font-serif">{viewProduct.name}</Title>
                <Text italic className="text-text/40 block">Slug: /{viewProduct.slug}</Text>
            </div>

            <Divider className="border-white/20" />

            <div className="grid grid-cols-2 gap-8">
                 <div className="bg-white/40 p-6 rounded-3xl border border-white">
                      <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest block mb-1">GIÁ BÁN HIỆN TẠI</Text>
                      <Title level={3} className="!m-0 !text-emerald-700">{(viewProduct.price).toLocaleString('vi-VN')}₫</Title>
                 </div>
                 <div className="bg-white/40 p-6 rounded-3xl border border-white">
                      <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest block mb-1">SỐ LƯỢNG TRONG KHO</Text>
                      <Title level={3} className="!m-0 !text-blue-700">{viewProduct.stock} Sp</Title>
                 </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-white/40 border border-white space-y-6">
                <div className="flex justify-between items-center">
                    <Text className="font-bold text-text/40 uppercase text-xs tracking-widest">DANH MỤC</Text>
                    <Tag color="blue" className="rounded-full px-4 border-none font-bold uppercase text-[10px] tracking-widest">{viewProduct.categoryId?.name}</Tag>
                </div>
                <div className="flex justify-between items-center">
                    <Text className="font-bold text-text/40 uppercase text-xs tracking-widest">TRẠNG THÁI</Text>
                    <Tag color={viewProduct.status === 'in_stock' ? 'success' : 'error'} className="rounded-full px-4 border-none font-bold uppercase text-[10px] tracking-widest">
                        {statusConfig[viewProduct.status]?.label}
                    </Tag>
                </div>
                <div>
                     <Text className="font-bold text-text/40 uppercase text-xs tracking-widest block mb-2">MÔ TẢ CHI TIẾT</Text>
                     <Paragraph className="text-text/60 leading-relaxed italic">
                        {viewProduct.description || "Sản phẩm chưa có mô tả chi tiết."}
                     </Paragraph>
                </div>
            </div>
            
            <div className="flex items-center gap-4 text-text/30 text-[10px] font-bold uppercase tracking-widest justify-center">
                 <HistoryOutlined /> NGÀY TẠO: {new Date(viewProduct.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
        )}
      </Drawer>

      {/* Add/Edit Modal - Premium Glass */}
      <Modal
        title={<Title level={4} className="!m-0 !font-serif">{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</Title>}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="LƯU THÔNG TIN"
        cancelText="HỦY BỎ"
        confirmLoading={saving}
        className="premium-admin-modal"
        centered
        width={800}
      >
        <Form
          form={form} layout="vertical"
          className="mt-8"
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
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="name" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Tên sản phẩm</Text>}
                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
              >
                <Input placeholder="Ví dụ: iPhone 15 Pro Max" className="h-12 rounded-2xl bg-white/60 border-none shadow-sm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="slug" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Đường dẫn (Slug)</Text>}
                rules={[{ required: true }]}
              >
                <Input placeholder="iphone-15-pro-max" addonBefore="/" className="h-12 rounded-2xl overflow-hidden border-none" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="price" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Giá bán (VNĐ)</Text>}
                rules={[{ required: true }]}
              >
                <InputNumber
                  className="w-full h-12 rounded-2xl bg-white/60 border-none pt-1" 
                  min={0}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v!.replace(/,/g, '') as any}
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="stock" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Tồn kho</Text>}
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full h-12 rounded-2xl bg-white/60 border-none pt-1" min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="categoryId" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Danh mục</Text>}
                rules={[{ required: true }]}
              >
                <Select className="h-12 custom-glass-select" placeholder="Chọn...">
                  {categories.map(cat => (
                    <Select.Option key={cat._id} value={cat._id}>{cat.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Mô tả sản phẩm</Text>}>
            <Input.TextArea rows={4} className="rounded-3xl bg-white/60 border-none p-4" placeholder="Môt tả ngắn gọn..." />
          </Form.Item>

          <Form.Item name="status" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Trạng thái kinh doanh</Text>}>
            <Select className="h-12 custom-glass-select">
              <Select.Option value="in_stock">✅ Còn hàng</Select.Option>
              <Select.Option value="out_of_stock">❌ Hết hàng</Select.Option>
              <Select.Option value="discontinued">🚫 Ngừng kinh doanh</Select.Option>
            </Select>
          </Form.Item>

          <Divider orientation={"left" as any} className="border-white/20">
            <Space><PictureOutlined className="text-emerald-600" /><Text className="font-bold text-[11px] uppercase tracking-widest">Album hình ảnh (Tối đa 8)</Text></Space>
          </Divider>

          <Form.Item>
            <Upload
              customRequest={handleUpload}
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newList }) => setFileList(newList)}
              accept="image/*"
              className="glass-uploader"
              multiple
            >
              {fileList.length >= 8 ? null : (
                <div className="flex flex-col items-center">
                  <PlusOutlined className="text-xl mb-2" />
                  <Text className="text-[10px] font-bold text-text/30">UPLOAD</Text>
                </div>
              )}
            </Upload>
          </Form.Item>
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
        .glass-uploader .ant-upload-list-item {
            border-radius: 1.5rem !important;
            border: 2px dashed rgba(5, 150, 105, 0.1) !important;
        }
        .glass-uploader .ant-upload-select {
            border-radius: 1.5rem !important;
            border: 2px dashed rgba(5, 150, 105, 0.2) !important;
            background: rgba(5, 150, 105, 0.02) !important;
        }
      `}</style>
    </div>
  );
};

export default Products;
