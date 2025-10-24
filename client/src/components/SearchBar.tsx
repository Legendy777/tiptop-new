import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const {t} = useTranslation();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          inputRef.current?.blur();
      }
  };

  return (
    <div className="flex flex-1 box-border px-2 items-center h-[40px] max-[350px]:h-[35px] gap-2 rounded-md border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)]">
      <Search className="text-[#8F96A3] max-[350px]:w-[16px] max-[350px]:h-[16px]" size={18} />
      <input
        type="text"
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={t('header.searchPlaceholder')}
        className="flex-1 text-[14px] w-[110px] border-none focus:outline-none bg-transparent placeholder-[#8F96A3]"
      />
    </div>
  );
};

export default SearchBar;