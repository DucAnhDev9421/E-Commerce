import axiosClient from './axiosClient';

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id?: string;
  user?: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: {
    receiverName: string;
    phoneNumber: string;
    street: string;
    city: string;
    district: string;
  };
  paymentMethod: 'COD' | 'VNPAY';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  note?: string;
  createdAt?: string;
}

const orderApi = {
  checkout: (data: { addressId: string; paymentMethod: string; note?: string }): Promise<any> => {
    const url = '/orders/checkout';
    return axiosClient.post(url, data);
  },

  getMyOrders: (params?: { page?: number; limit?: number; status?: string }): Promise<any> => {
    const url = '/orders';
    return axiosClient.get(url, { params });
  },

  getOrderById: (id: string): Promise<Order> => {
    const url = `/orders/${id}`;
    return axiosClient.get(url);
  },

  cancelOrder: (id: string): Promise<any> => {
    const url = `/orders/${id}/cancel`;
    return axiosClient.patch(url);
  }
};

export default orderApi;
