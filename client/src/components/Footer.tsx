import { CircleFadingArrowUp, Menu, MessageCircleMore, SquareArrowOutUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MenuComp from './Menu';
import { useState, useRef, useEffect } from 'react';
import LinksWidget from "./LinksWidget.tsx";
import { useLocation } from 'react-router-dom';


const Footer = () => {
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const [linksVisible, setLinksVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const handleMenuToggle = () => setMenuVisible(!menuVisible);
  const handleLinksToggle = () => setLinksVisible(!linksVisible);

  const handleScrollAllToTop = () => {
    const scrollableElements = document.querySelectorAll<HTMLElement>('*');
    scrollableElements.forEach((el) => {
      const overflowY = getComputedStyle(el).overflowY;
      const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
      if (isScrollable) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  useEffect(() => {
    setMenuVisible(false);
    setLinksVisible(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false);
      }

      if (linksRef.current && !linksRef.current.contains(event.target as Node)) {
        setLinksVisible(false);
      }
    };

    if (menuVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    if (linksVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuVisible, linksVisible]);

  return (
      <footer className='flex justify-center bg-[#1A1B1E] text-white items-center py-[10px] border-t border-[#00CCCC33]'>
        <div className='relative flex gap-2 max-[350px]:gap-1 max-w-[28rem] w-full items-center gap-1.5 px-2'>
          <MenuComp ref={menuRef} visible={menuVisible} handleMenuToggle={handleMenuToggle} />
          <button onClick={handleMenuToggle} className='flex items-center w-[40px] h-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg justify-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer'>
            <Menu className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20}/>
          </button>
          <button onClick={() => navigate("/chat")} className='cursor-pointer flex items-center w-[40px] h-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg justify-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)]'>
            <MessageCircleMore className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20} />
          </button>
          <div onClick={() => navigate("/")} className="h-[40px] max-[350px]:h-[35px] px-2 rounded-3xl flex flex-1 content-center justify-center items-center gap-2 border-l-2 border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)]">
            {/*<Gem className="text-[#b9f2ff]" size={18} />*/}
            <h1 className='max-[350px]:text-[16px] font-bold text-lg text-[#8F96A3] cursor-pointer'>💎 TipTop 💎</h1>
            {/*<Gem className="text-[#b9f2ff]" size={18} />*/}
          </div>
          <button onClick={handleScrollAllToTop} className='flex items-center w-[40px] h-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg justify-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer'>
            <CircleFadingArrowUp className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20} />
          </button>
          <button onClick={handleLinksToggle} className='flex items-center w-[40px] h-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg justify-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer'>
            <SquareArrowOutUpRight className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20} />
          </button>
          {linksVisible && <LinksWidget ref={linksRef} />}
        </div>
      </footer>
  );
};

export default Footer;
