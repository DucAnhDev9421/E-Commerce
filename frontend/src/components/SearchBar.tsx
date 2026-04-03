import React, { useState } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const SearchBar: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSearch = (value: string) => {
    if (value.trim()) {
      setLoading(true);
      // Redirect to home or a dedicated search page with search query
      navigate(`/?search=${encodeURIComponent(value)}`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Search
        placeholder="Tìm kiếm sản phẩm..."
        allowClear
        enterButton={<Button icon={<SearchOutlined />} type="primary">Tìm kiếm</Button>}
        size="large"
        onSearch={onSearch}
        loading={loading}
        className="rounded-lg overflow-hidden border-0 shadow-sm"
      />
    </div>
  );
};

// Custom Button for Search input
const Button = ({ icon, type, children, ...props }: any) => (
  <button
    {...props}
    className={`px-4 py-2 bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 transition-colors h-full`}
  >
    {icon}
    {children}
  </button>
);

export default SearchBar;
