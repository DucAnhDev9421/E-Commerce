import axiosClient from './axiosClient';

const cartApi = {
  getCart: (): Promise<any> => {
    const url = '/carts';
    return axiosClient.get(url);
  },

  addItem: (productId: string, quantity: number): Promise<any> => {
    const url = '/carts/items';
    return axiosClient.post(url, { productId, quantity });
  },

  updateQuantity: (productId: string, quantity: number): Promise<any> => {
    const url = `/carts/items/${productId}`;
    return axiosClient.patch(url, { quantity });
  },

  removeItem: (productId: string): Promise<any> => {
    const url = `/carts/items/${productId}`;
    return axiosClient.delete(url);
  },

  clearCart: (): Promise<any> => {
    const url = '/carts/clear';
    return axiosClient.delete(url);
  }
};

export default cartApi;
