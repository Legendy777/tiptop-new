import { Globe, Grid, List } from 'lucide-react';
import SearchBar from './SearchBar';
import { useState, useRef, useEffect } from 'react';
import GridWidget from './GridWidget';
import LangWidget from './LangWidget';
import CategoriesWidget from "./CategoriesWidget.tsx";
import { searchGames } from '../store/features/gamesSlice.ts';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onChangeCardsPerRow: (count: number) => void;
  onChangeLanguage: (lang: 'ru' | 'en') => void;
}

const Header: React.FC<HeaderProps> = ({ onChangeCardsPerRow, onChangeLanguage }) => {
  const [showGridWidget, setShowGridWidget] = useState(false);
  const [showLangWidget, setShowLangWidget] = useState(false);
  const [categoriesVisible, setCategoriesVisible] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = (query: string) => {
    dispatch(searchGames(query));
  };

  const handleCategoriesClick = () => {
    setCategoriesVisible((prev) => !prev);
    setShowGridWidget(false);
    setShowLangWidget(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
          !categoriesRef.current?.contains(target) &&
          !gridRef.current?.contains(target) &&
          !langRef.current?.contains(target)
      ) {
        setCategoriesVisible(false);
        setShowGridWidget(false);
        setShowLangWidget(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCategoriesVisible(false);
    setShowGridWidget(false);
    setShowLangWidget(false);
  }, [location]);

  return (
      <header className={`flex justify-center bg-[#1A1B1E] text-white items-center py-[10px] border-b border-[#00CCCC33]`}>
        <div className='flex relative max-w-[28rem] w-full items-center gap-2 px-2'>
          {categoriesVisible && (
              <CategoriesWidget ref={categoriesRef} setCategoriesVisible={setCategoriesVisible} />
          )}
          <button onClick={handleCategoriesClick} className='flex items-center w-[40px] h-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg justify-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer'>
            <List className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20} />
          </button>
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <button
              className='flex items-center w-[40px] h-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg justify-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer'
              onClick={() => {
                setShowGridWidget((prev) => !prev);
                setCategoriesVisible(false);
                setShowLangWidget(false);
              }}
          >
            <Grid className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20} />
          </button>
          <button
              className='flex items-center w-[40px] h-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg justify-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer'
              onClick={() => {
                setShowLangWidget((prev) => !prev);
                setCategoriesVisible(false);
                setShowGridWidget(false);
              }}
          >
            <Globe className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20} />
          </button>
          {showGridWidget && (
              <GridWidget
                  ref={gridRef}
                  onSelect={(count) => {
                    onChangeCardsPerRow(count);
                    setShowGridWidget(false);
                  }}
              />
          )}
          {showLangWidget && (
              <LangWidget
                  ref={langRef}
                  onSelect={(lang) => {
                    onChangeLanguage(lang);
                    setShowLangWidget(false);
                  }}
              />
          )}
        </div>
      </header>
  );
};

export default Header;
