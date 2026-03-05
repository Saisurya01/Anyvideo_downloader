import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getVideoInfo = async (url) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/video-info`, { url });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    if (error.response) {
      const contentType = error.response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const data = typeof error.response.data === 'string' 
          ? JSON.parse(error.response.data) 
          : error.response.data;
        throw new Error(data.error || 'Unknown error occurred');
      }
      throw new Error(error.response.statusText || 'Server error');
    }
    if (error.request) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

export const downloadVideo = async (url, format) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/download`, {
      params: { url, format },
      responseType: 'blob',
    });
    
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'video.mp4';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (match) filename = match[1];
    }
    
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Download Error:', error);
    if (error.response) {
      const contentType = error.response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const data = typeof error.response.data === 'string' 
          ? JSON.parse(error.response.data) 
          : error.response.data;
        throw new Error(data.error || 'Download failed');
      }
      throw new Error(error.response.statusText || 'Download failed');
    }
    if (error.request) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

export default axios;
