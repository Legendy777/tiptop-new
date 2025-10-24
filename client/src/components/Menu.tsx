import { ChevronRight, Gem } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { forwardRef } from "react";

const Menu = forwardRef<HTMLDivElement, any>(({ visible }, ref) => {
  const user = useSelector((state: RootState) => state.user.user);
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!user || !visible) return null;

  return (
      <div
          ref={ref}
          className="flex flex-col justify-start absolute left-[8px] bottom-[58px] h-fit w-fit bg-[#1A1B1E] text-white items-center rounded-lg border border-[#27282C] z-50"
      >
        <div onClick={() => navigate("/profile")} className="flex gap-4 max-[350px]:gap-2 justify-between w-full text-[14px] py-2 px-2 box-border">
          <div className="flex items-center gap-1">
            <div className="w-[50px] h-[50px]">
              <img className="rounded" src={user.avatarUrl || ""} alt="profile photo" />
            </div>
            <div className="flex flex-col items-start gap-0">
              <span>{user.username}</span>
              <span className="text-[#979EAA]">ID: {user._id}</span>
              <span className="flex items-center gap-1">
              <span className="text-[#b9f2ff]">{user.referralPercent}% - </span>
                {Array.from({ length: user.referralPercent || 0 }, (_, i) => (
                    <Gem key={i} className="text-[#b9f2ff]" size={18} />
                ))}
            </span>
            </div>
          </div>
          <div className="flex items-center gap-1 cursor-pointer">
            <div className="flex flex-col items-center gap-0 bg-[#1E1F23] rounded-[10px] px-2 py-2 border border-[#27282C]">
              <span className="text-[16px]">{user.balanceUSDT}$</span>
              <span className="text-[#979EAA] text-[12px]">{t('menu.balance')}</span>
            </div>
            <div>
              <ChevronRight className="w-[18px] h-[18px] text-[#fff]" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full px-2 py-2 box-border">
          <div onClick={() => navigate("/orders")} className="flex items-center justify-between gap-2 bg-[#1E1F23] rounded-lg px-2 py-2 border border-[#27282C] cursor-pointer">
            <div className="flex items-center gap-2">
              <img className="w-[18px] h-[18px]" src="/Purchases.gif" alt="orders" />
              <span className="text-[14px]">{t('menu.orders')}</span>
            </div>
            <span className="text-[14px]">{user.ordersCount}</span>
          </div>
          <div onClick={() => navigate("/reviews")} className="flex items-center justify-start gap-2 bg-[#1E1F23] rounded-lg px-2 py-2 border border-[#27282C] cursor-pointer">
            <div className="flex items-center gap-2">
              <img className="w-[18px] h-[18px]" src="/Completed.gif" alt="reviews" />
              <span className="text-[14px]">{t('menu.reviews')}</span>
            </div>
          </div>
          <div onClick={() => navigate("/chat")} className="flex items-center justify-start gap-2 bg-[#1E1F23] rounded-lg px-2 py-2 border border-[#27282C] cursor-pointer">
            <div className="flex items-center gap-2">
              <img className="w-[18px] h-[18px]" src="/Chat.gif" alt="support" />
              <span className="text-[14px]">{t('menu.support')}</span>
            </div>
          </div>
          <div onClick={() => navigate("/about")} className="flex items-center justify-start gap-2 bg-[#1E1F23] rounded-lg px-2 py-2 border border-[#27282C] cursor-pointer">
            <div className="flex items-center gap-2">
              <img className="w-[18px] h-[18px]" src="/Info.gif" alt="about us" />
              <span className="text-[14px]">{t('menu.aboutUs')}</span>
            </div>
          </div>
        </div>
      </div>
  );
});

export default Menu;
