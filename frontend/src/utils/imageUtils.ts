export const BASE_URL = 'http://localhost:5000';

export const getAvatarUrl = (url?: string | null) => {
  if (!url || url.trim() === "") return null;
  if (url.startsWith('http')) return url;
  if (!url.startsWith('/')) return `${BASE_URL}/uploads/${url}`;
  return `${BASE_URL}${url}`;
};
