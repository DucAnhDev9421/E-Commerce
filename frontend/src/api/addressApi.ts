import axiosClient from './axiosClient';
import type { Address } from '../types/auth';

/**
 * Address API service for managing shipping addresses.
 * Uses axiosClient which is pre-configured to return response.data directly.
 */
const addressApi = {
  /**
   * Fetch all addresses for the current user.
   */
  getAll: (): Promise<Address[]> => {
    return axiosClient.get('/addresses');
  },

  /**
   * Fetch details of a single address by ID.
   * @param id - Identifer of the address to fetch.
   */
  getById: (id: string): Promise<Address> => {
    return axiosClient.get(`/addresses/${id}`);
  },

  /**
   * Create a new address entry.
   * @param data - Partial address data for creation.
   */
  create: (data: Partial<Address>): Promise<Address> => {
    return axiosClient.post('/addresses', data);
  },

  /**
   * Update an existing address by its ID.
   * @param id - Identifier of the address to update.
   * @param data - Updated address fields.
   */
  update: (id: string, data: Partial<Address>): Promise<Address> => {
    return axiosClient.put(`/addresses/${id}`, data);
  },

  /**
   * Delete an address entry from the system.
   * @param id - Identifier of the address to delete.
   */
  delete: (id: string): Promise<any> => {
    return axiosClient.delete(`/addresses/${id}`);
  },

  /**
   * Set a specific address as the default shipping address.
   * (Helper method for common UI actions)
   */
  setDefault: (id: string): Promise<Address> => {
    return axiosClient.patch(`/addresses/${id}/set-default`);
  }
};

export default addressApi;
