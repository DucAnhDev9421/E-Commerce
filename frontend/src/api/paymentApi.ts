import axiosClient from './axiosClient';

export interface Payment {
  _id?: string;
  order?: string;
  user?: string;
  method: 'COD' | 'VNPAY';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  vnpayData?: any;
  transactionRef?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
}

const paymentApi = {
  getMyPayments: (params?: { page?: number; limit?: number; status?: string }): Promise<any> => {
    const url = '/payments/me';
    return axiosClient.get(url, { params });
  },

  getAllPayments: (params?: { page?: number; limit?: number; status?: string; method?: string }): Promise<any> => {
    const url = '/payments';
    return axiosClient.get(url, { params });
  },

  getPaymentById: (id: string): Promise<Payment> => {
    const url = `/payments/${id}`;
    return axiosClient.get(url);
  },

  getPaymentStats: (): Promise<PaymentStats> => {
    const url = '/payments/stats';
    return axiosClient.get(url);
  },

  updatePaymentStatus: (id: string, status: string): Promise<any> => {
    const url = `/payments/${id}/status`;
    return axiosClient.patch(url, { status });
  }
};

export default paymentApi;