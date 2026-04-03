import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, notification,
  Popconfirm, Typography, Tooltip, Empty
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, SafetyCertificateOutlined,
  SearchOutlined, ReloadOutlined, KeyOutlined,
  HistoryOutlined
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
        title: 'Lỗi tải danh sách quyền',
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
      notification.success({ title: '✅ Xóa quyền thành công' });
      fetchRoles();
    } catch (error: any) {
      notification.error({
        title: 'Lỗi xóa quyền',
        description: error?.message,
      });
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await roleApi.update(editingRole._id, values);
        notification.success({ title: '✅ Cập nhật quyền thành công' });
      } else {
        await roleApi.create(values);
        notification.success({ title: '✅ Thêm quyền mới thành công' });
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (error: any) {
      if (error?.name !== 'ValidationError') {
        notification.error({
          title: 'Lỗi lưu thông tin',
          description: error?.message,
        });
      }
    }
  };

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
      title: 'Quyền Hạn',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space size="middle" className="py-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
            <SafetyCertificateOutlined className="text-white text-xl" />
          </div>
          <div>
            <Text strong className="text-base tracking-tight leading-tight">{text}</Text>
            <Text className="text-[10px] font-bold text-text/30 uppercase tracking-[0.2em] block">HỆ THỐNG ĐỊNH DANH</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Mô tả chi tiết',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <div className="flex flex-col">
            <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest block mb-1">PHẠM VI TRUY CẬP</Text>
            <Text className="text-xs text-text/60 italic leading-tight">{text || 'Không có mô tả chi tiết cho quyền này'}</Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      width: 180,
      render: (isDeleted: boolean) => (
        <div className={`px-4 py-1.5 rounded-full inline-flex items-center gap-2 border ${
            !isDeleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
             <div className="w-1.5 h-1.5 rounded-full bg-current" />
             <Text strong className="text-[10px] uppercase tracking-widest text-current">{!isDeleted ? 'Hoạt động' : 'Vô hiệu hóa'}</Text>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: any, record: Role) => (
        <Space size={8}>
          <Tooltip title="Chỉnh sửa quyền">
            <Button 
                shape="circle" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
                className="bg-emerald-50 text-emerald-600 border-none hover:bg-emerald-100 transition-colors" 
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa quyền?"
            description="Lưu ý quan trọng: Việc xóa quyền hệ thống có thể gây lỗi truy cập cho người dùng đang gán quyền này."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa" cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa quyền">
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
            <Title level={2} className="!m-0 !font-serif tracking-tight">Phân quyền Hệ thống</Title>
            <Text className="text-text/30 font-bold uppercase tracking-[0.3em] text-[10px]">SECURITY ROLE & PERMISSION ENGINE</Text>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
              <div className="px-8 py-4 bg-blue-600/5 rounded-[2rem] border border-blue-600/10 flex items-center gap-4 min-w-[200px]">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                      <KeyOutlined />
                  </div>
                  <div>
                      <Title level={3} className="!m-0 !font-black !leading-none text-blue-800">{roles.length}</Title>
                      <Text className="text-[10px] font-bold text-blue-600/50 uppercase tracking-widest block mt-1">TỔNG VAI TRÒ</Text>
                  </div>
              </div>
          </div>

          <Button
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="h-16 px-10 rounded-[2rem] bg-blue-600 border-none font-bold tracking-widest text-xs uppercase shadow-xl shadow-blue-200 hover:scale-105 transition-all"
          >
            KHỞI TẠO QUYỀN MỚI
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white/40 backdrop-blur-md rounded-[3.5rem] border border-white/80 shadow-2xl overflow-hidden glass-panel relative">
        {/* Toolbar */}
        <div className="p-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <Input
                    prefix={<SearchOutlined className="text-blue-600" />}
                    placeholder="Tìm kiếm theo tên quyền..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                    className="h-12 w-full md:w-96 rounded-2xl border-none bg-white/60 shadow-sm focus:bg-white transition-all pl-4"
                />
            </div>
            
            <div className="flex items-center gap-3">
                <Tooltip title="Làm mới dữ liệu">
                    <Button 
                        shape="circle" 
                        icon={<ReloadOutlined />} 
                        onClick={fetchRoles} 
                        loading={loading}
                        className="bg-white/60 text-blue-600 border-none shadow-sm hover:scale-110"
                    />
                </Tooltip>
                <div className="h-6 w-px bg-text/10" />
                <Text className="text-[10px] font-bold text-text/30 uppercase tracking-widest">SẮP XẾP ƯU TIÊN</Text>
            </div>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          className="premium-admin-table-blue"
          pagination={{
            pageSize: 10,
            showTotal: (total) => <Text className="font-bold text-text/30 text-xs">TỔNG CỘNG {total} QUYỀN HỆ THỐNG</Text>,
            className: "px-8 py-6"
          }}
          locale={{ emptyText: <Empty description="Chưa có vai trò nào trong hệ thống" className="p-20" /> }}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={<Title level={4} className="!m-0 !font-serif text-blue-900">{editingRole ? 'Chỉnh sửa định danh quyền' : 'Thiết lập quyền hạn mới'}</Title>}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="XÁC NHẬN LƯU"
        cancelText="BỎ QUA"
        className="premium-admin-modal-blue"
        centered
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-8"
        >
          <Form.Item
            name="name"
            label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Định danh (VÍ DỤ: MANAGER, EDITOR)</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập định danh!' },
              { pattern: /^[A-Z_]+$/, message: 'Khuyến nghị: Viết HOA và dùng dấu gạch dưới' }
            ]}
          >
            <Input placeholder="VÍ DỤ: TECH_SUPPORT" className="h-12 rounded-2xl bg-white/60 border-none shadow-sm" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text className="font-bold text-[11px] uppercase tracking-widest ml-2">Mô tả phạm vi quyền hạn</Text>}
          >
            <Input.TextArea rows={4} className="rounded-3xl bg-white/60 border-none p-4" placeholder="Ví dụ: Có quyền can thiệp vào kho hàng và sản phẩm..." />
          </Form.Item>
          
          <div className="flex items-center gap-4 text-text/30 text-[10px] font-bold uppercase tracking-widest justify-center mt-4">
                <HistoryOutlined /> CHANGES WILL BE LOGGED IN SYSTEM AUDIT TRAIL
          </div>
        </Form>
      </Modal>

      <style>{`
        .premium-admin-table-blue .ant-table {
            background: transparent !important;
        }
        .premium-admin-table-blue .ant-table-thead > tr > th {
            background: rgba(0, 0, 0, 0.02) !important;
            border-bottom: 2px solid rgba(255, 255, 255, 0.4) !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
            color: #94a3b8 !important;
            padding: 24px !important;
        }
        .premium-admin-table-blue .ant-table-tbody > tr > td {
            border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
            padding: 20px 24px !important;
            transition: all 0.3s ease;
        }
        .premium-admin-table-blue .ant-table-tbody > tr:hover > td {
            background: rgba(37, 99, 235, 0.03) !important;
        }
        .premium-admin-modal-blue .ant-modal-content {
            border-radius: 3rem !important;
            background: rgba(239, 246, 255, 0.8) !important;
            backdrop-filter: blur(20px) !important;
            border: 1px solid white !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
            padding: 40px !important;
        }
        .premium-admin-modal-blue .ant-modal-header {
            background: transparent !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
            padding-bottom: 24px !important;
        }
        .premium-admin-modal-blue .ant-modal-footer {
            border-top: none !important;
            margin-top: 32px !important;
            display: flex;
            justify-content: center;
            gap: 16px;
        }
        .premium-admin-modal-blue .ant-modal-footer .ant-btn {
            height: 56px !important;
            padding: 0 40px !important;
            border-radius: 2rem !important;
            font-weight: 700 !important;
            font-size: 12px !important;
            letter-spacing: 0.1em !important;
        }
        .premium-admin-modal-blue .ant-btn-primary {
            background: #2563eb !important;
            box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default Roles;
