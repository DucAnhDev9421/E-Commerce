import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, notification,
  Popconfirm, Typography, Tag, Select, Tooltip, Badge, Drawer,
  Row, Col, Empty, Spin, Upload, Image, Divider
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  SearchOutlined, ReloadOutlined, EyeOutlined, TagsOutlined,
  CheckCircleOutlined, StopOutlined, PictureOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import categoryApi from '../../api/categoryApi';
import productApi from '../../api/productApi';

const { Title, Text, Paragraph } = Typography;

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      notification.error({ title: 'Lỗi', description: error?.message || 'Không thể tải danh mục' });
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
      notification.success({ title: '✅ Xóa danh mục thành công' });
      fetchCategories();
    } catch (error: any) {
      notification.error({ title: 'Lỗi khi xóa', description: error?.message });
    }
  };

  const handleModalOk = async () => {
    try {
      const formValues = await form.validateFields();
      setSaving(true);
      const imageUrls = fileList
        .filter(f => f.status === 'done')
        .map(f => f.response?.avatarUrl || f.url);
      const values = { ...formValues, image: imageUrls.length > 0 ? imageUrls[0] : '' };

      if (editingCategory) {
        await categoryApi.update(editingCategory._id, values);
        notification.success({ title: '✅ Cập nhật danh mục thành công' });
      } else {
        await categoryApi.create(values);
        notification.success({ title: '✅ Thêm danh mục mới thành công' });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      if (error?.name !== 'ValidationError' && error?.name !== 'Error') {
        notification.error({ title: 'Lỗi tải danh mục', description: error?.message });
      }
    } finally {
        setSaving(false);
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
        <Text className="text-text/30 font-mono font-bold">{index + 1}</Text>
      ),
    },
    {
      title: 'Danh Mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space size="middle" className="py-2">
          <div className="relative shrink-0 group">
            {record.image ? (
              <img
                src={getImageUrl(record.image)}
                alt={text}
                className="w-14 h-14 object-cover rounded-2xl bg-white p-1 border border-emerald-50 shadow-sm transition-transform group-hover:scale-110"
                onError={(e: any) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                <TagsOutlined className="text-white text-xl" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <Text strong className="text-base tracking-tight leading-tight mb-1">{text}</Text>
            <Text className="text-[10px] font-bold text-text/30 uppercase tracking-[0.2em]">SLUG: /{record.slug}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Đặc điểm',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <div className="flex flex-col">
            <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest block mb-1">MÔ TẢ</Text>
            <Text className="text-xs text-text/60 italic leading-tight">{text || 'Chưa cập nhật mô tả'}</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => (
        <div className={`px-4 py-1.5 rounded-full inline-flex items-center gap-2 border ${
            status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
             <div className="w-1.5 h-1.5 rounded-full bg-current" />
             <Text strong className="text-[10px] uppercase tracking-widest text-current">{status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</Text>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (
        <div className="flex flex-col">
            <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">NGÀY KHỞI TẠO</Text>
            <Text className="text-xs font-bold text-text/60">
                {date ? new Date(date).toLocaleDateString('vi-VN') : '—'}
            </Text>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
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
            title="Xóa danh mục này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa" cancelText="Hủy"
            okButtonProps={{ danger: true }}
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
      {/* Page Header & Stats Island */}
      <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-8 border border-white/60 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <Title level={2} className="!m-0 !font-serif tracking-tight">Quản lý Danh mục</Title>
            <Text className="text-text/30 font-bold uppercase tracking-[0.3em] text-[10px]">GROUPING & CLASSIFICATION CONTROL</Text>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'Tổng số', value: categories.length, icon: <TagsOutlined />, color: '#059669' },
                { label: 'Hoạt động', value: activeCount, icon: <CheckCircleOutlined />, color: '#10b981' },
                { label: 'Tạm dừng', value: inactiveCount, icon: <StopOutlined />, color: '#ef4444' },
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
            THÊM DANH MỤC MỚI
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
                    placeholder="Tìm kiếm danh mục..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                    className="h-12 w-full md:w-80 rounded-2xl border-none bg-white/60 shadow-sm focus:bg-white transition-all pl-4"
                />
            </div>
            
            <div className="flex items-center gap-3">
                <Tooltip title="Làm mới dữ liệu">
                    <Button 
                        shape="circle" 
                        icon={<ReloadOutlined />} 
                        onClick={fetchCategories} 
                        loading={loading}
                        className="bg-white/60 text-emerald-600 border-none shadow-sm hover:scale-110"
                    />
                </Tooltip>
                <div className="h-6 w-px bg-text/10" />
                <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">SẮP XẾP MẶC ĐỊNH</Text>
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
            showTotal: (total) => <Text className="font-bold text-text/30 text-xs">TỔNG CỘNG {total} DANH MỤC</Text>,
            className: "px-8 py-6"
          }}
          locale={{ emptyText: <Empty description="Chưa có danh mục nào" className="p-20" /> }}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={<Title level={4} className="!m-0 !font-serif">{editingCategory ? 'Chỉnh sửa chuyên mục' : 'Khởi tạo chuyên mục mới'}</Title>}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="GHI NHẬN HỆ THỐNG"
        cancelText="HỦY BỎ"
        confirmLoading={saving}
        className="premium-admin-modal"
        centered
        width={600}
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
          <Form.Item name="name" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Tên danh mục</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Ví dụ: Điện thoại, Laptop..." className="h-12 rounded-2xl bg-white/60 border-none shadow-sm" />
          </Form.Item>

          <Form.Item name="slug" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Đường dẫn nội bộ (Slug)</Text>}
            rules={[{ required: true }]}
          >
            <Input placeholder="dien-thoai" addonBefore="/" className="h-12 rounded-2xl overflow-hidden border-none" />
          </Form.Item>

          <Form.Item name="description" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Mô tả tóm tắt</Text>}>
            <Input.TextArea rows={3} className="rounded-3xl bg-white/60 border-none p-4" placeholder="Thông tin giới thiệu về danh mục..." />
          </Form.Item>

          <Form.Item name="status" label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Trạng thái vận hành</Text>} initialValue="active">
            <Select className="h-12 custom-glass-select">
              <Select.Option value="active">✅ Hoạt động bình thường</Select.Option>
              <Select.Option value="inactive">⏸️ Tạm ngừng hiển thị</Select.Option>
            </Select>
          </Form.Item>

          <Divider orientation="left" className="border-white/20">
             <Space><PictureOutlined className="text-emerald-600" /><Text className="font-bold text-[11px] uppercase tracking-widest">Ảnh đại diện chuyên mục</Text></Space>
          </Divider>

          <Form.Item>
            <Upload
              customRequest={handleUpload}
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newList }) => setFileList(newList)}
              accept="image/*"
              maxCount={1}
              className="glass-uploader-single"
            >
              {fileList.length >= 1 ? null : (
                <div className="flex flex-col items-center">
                  <PlusOutlined className="text-xl mb-2" />
                  <Text className="text-[10px] font-bold text-text/30">UPLOAD</Text>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Drawer */}
      <Drawer
        title={<Title level={3} className="!m-0 !font-serif">Hồ sơ danh mục</Title>}
        placement="right"
        width={480}
        onClose={() => setIsViewOpen(false)}
        open={isViewOpen}
        className="glass-panel"
        extra={
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => { setIsViewOpen(false); handleEdit(viewCategory); }}
              className="h-12 px-6 rounded-2xl bg-emerald-600 border-none font-bold text-xs tracking-widest uppercase shadow-xl"
            >
              CẬP NHẬT
            </Button>
          }
      >
        {viewCategory && (
          <div className="space-y-10">
            <div className="relative group">
                <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-white/40 border border-white/60 p-4 flex items-center justify-center shadow-inner">
                    {viewCategory.image ? (
                        <Image
                            src={getImageUrl(viewCategory.image)}
                            className="h-full w-full object-contain rounded-2xl shadow-2xl"
                        />
                    ) : (
                        <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center text-white text-4xl shadow-2xl shadow-emerald-200">
                             <TagsOutlined />
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-10 py-4 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl text-center min-w-[280px]">
                    <Title level={4} className="!m-0 !font-serif truncate">{viewCategory.name}</Title>
                    <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">SLUG: /{viewCategory.slug}</Text>
                </div>
            </div>

            <div className="pt-8 space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-white/40 border border-white space-y-6">
                    <div>
                        <Text className="font-bold text-text/40 uppercase text-[10px] tracking-widest block mb-1">TRẠNG THÁI HIỆN TẠI</Text>
                        <Tag color={viewCategory.status === 'active' ? 'success' : 'error'} className="rounded-full px-6 border-none font-bold uppercase text-[10px] tracking-widest py-1">
                            {viewCategory.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                        </Tag>
                    </div>
                    
                    <Divider className="!m-0 border-white/20" />

                    <div>
                        <Text className="font-bold text-text/40 uppercase text-[10px] tracking-widest block mb-2">MÔ TẢ GIỚI THIỆU</Text>
                        <Paragraph className="text-text/60 italic leading-relaxed !m-0">
                            {viewCategory.description || "Chuyên mục này chưa có nội dung mô tả chi tiết từ quản trị viên."}
                        </Paragraph>
                    </div>
                    
                    <Divider className="!m-0 border-white/20" />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Text className="font-bold text-text/40 uppercase text-[10px] tracking-widest block mb-1">NGÀY TẠO</Text>
                            <Text strong className="text-xs">{new Date(viewCategory.createdAt).toLocaleString('vi-VN')}</Text>
                        </div>
                        <div>
                            <Text className="font-bold text-text/40 uppercase text-[10px] tracking-widest block mb-1">SỬA LẦN CUỐI</Text>
                            <Text strong className="text-xs">{new Date(viewCategory.updatedAt).toLocaleString('vi-VN')}</Text>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 text-text/30 text-[10px] font-bold uppercase tracking-widest justify-center">
                    <HistoryOutlined /> SYSTEM LOGS: AUDIT TRAIL VERIFIED
                </div>
            </div>
          </div>
        )}
      </Drawer>

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
        .glass-uploader-single .ant-upload-list-item {
            border-radius: 1.5rem !important;
            border: 2px dashed rgba(5, 150, 105, 0.1) !important;
            width: 104px !important;
            height: 104px !important;
        }
        .glass-uploader-single .ant-upload-select {
            border-radius: 1.5rem !important;
            border: 2px dashed rgba(5, 150, 105, 0.2) !important;
            background: rgba(5, 150, 105, 0.02) !important;
            width: 104px !important;
            height: 104px !important;
        }
      `}</style>
    </div>
  );
};

export default Categories;
