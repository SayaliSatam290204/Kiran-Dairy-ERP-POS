import axiosInstance from './axiosInstance.js';

export const uploadApi = {
  uploadProductImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);

    return axiosInstance.post('/api/upload/product-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
