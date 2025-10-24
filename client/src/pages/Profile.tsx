import { ChevronRight, Copy, Gem } from "lucide-react";
import type { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchReferralsCountByReferId } from "../store/features/referralsSlice.ts";
import { fetchTransactionsByReferId } from "../store/features/transactionsSlice.ts";
import {useTranslation} from "react-i18next";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {t} = useTranslation();

  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  const user = useSelector((state: RootState) => state.user.user);
   const transactionsCount = useSelector((state: RootState) => state.transactions.transactions.length);
  const referralsCount = useSelector((state: RootState) => state.referrals.referralsCount);

  useEffect(() => {
    if (!user?._id) return;

    dispatch(fetchTransactionsByReferId());
    dispatch(fetchReferralsCountByReferId());
  }, [dispatch, user?._id]);

  const referralLink = `https://t.me/TipTop999_bot?start=${user?._id || ""}`;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col max-w-[28rem] w-full h-full overflow-y-auto py-3 px-2">
      {/* User Info Section */}
      <div className="flex gap-4 justify-between items-end w-full text-[14px] box-border rounded-lg bg-[#1a1b1e] border  border-[#27282C]">
        <div className="flex items-center gap-1">
          <div className="flex items-center w-[75px] h-[75px]">
            <img className="h-full w-full rounded-lg" src={user.avatarUrl || ""} alt="profile photo" />
          </div>
          <div className="flex flex-col items-start gap-0">
            <span className="text-white">{user.username}</span>
            <span className="text-[#979EAA]">ID: {user._id}</span>
            <span className="flex items-center gap-1">
              <span className="text-[#b9f2ff]">{user.referralPercent}% - </span>
              {Array.from({ length: user.referralPercent || 0 }, (_, i) => (
                <Gem key={i} className="text-[#b9f2ff]" size={18} />
              ))}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate("/referral-info")} className="flex items-center gap-2 bg-[#252629] rounded-lg px-2 py-1 mb-1.5 mr-1.5 border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer">
            <span className="text-[#8F96A3]">{t('profile.detailsBtn')}</span>
            <ChevronRight className="w-[18px] h-[18px] text-[#8F96A3]" />
          </button>
        </div>
      </div>

      {/*shadow-[0_0_10px_rgba(0,163,255,0.3)]*/}

      {/* Text */}
      <div className="space-y-6 mb-2 bg-[#1a1b1e] border border-[#27282C] rounded-lg p-2 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ракета-4uqIvLXI9GOpvgCowfLDs6BxX71mJK.gif"
              alt="Rocket"
              className="w-7 h-7"
            />
          </div>
          <p className="text-[#8F96A3] text-[15px] text-base max-[350px]:text-sm flex-1">
            {t('profile.desc')}
          </p>
        </div>
      </div>

      {/* Link */}
      <div className="mb-2 p-2 rounded-lg bg-[#1a1b1e] border border-[#27282C]">
        <div className="flex items-center gap-2 mb-2">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Скрепка-rQgbCH2HgqS5Yg1bMkjeqq89xyyPTz.gif"
            alt="Link"
            className="w-5 h-5"
          />
          <h2 className="text-[#8F96A3] text-sm">{t('profile.linkText')}</h2>
        </div>
        <div className="flex flex-nowrap items-center gap-2 relative">
          <div className="bg-[#252629] flex-1 p-2 rounded-lg">
            <div className="text-[#8F96A3] text-[12px] truncate whitespace-break-spaces">
              {referralLink}
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(referralLink)}
            className="h-8 w-8 bg-[#252629] rounded-lg flex items-center justify-center relative border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer"
          >
            <Copy className="h-4 w-4 text-[#8F96A3]" />
            {showCopyTooltip && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#252629] rounded text-xs whitespace-nowrap">
                Скопировано!
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between mb-2 p-2 rounded-lg bg-[#1a1b1e] border border-[#27282C]">
        <div className="flex items-center gap-3">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Баланс-qapBAab88WemJOjXjXkYQE04Qi7oan.gif"
            alt="Balance"
            className="w-7 h-7"
          />
          <div>
            <div className="text-[#8F96A3] text-sm">{t('profile.balance')}</div>
            <div className="text-xl font-bold text-white">{user?.balanceUSDT + "$"}</div>
          </div>
        </div>
        <button
          className="bg-[#252629] text-[#8F96A3] max-[350px]:text-sm rounded-lg px-4 py-2 border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer"
          onClick={() => navigate('/withdrawals')}
        >
          {t('profile.withdrawalBtn')}
        </button>
      </div>

      {/* Statistics Section */}
      <div className="space-y-2 rounded-lg p-2 bg-[#1a1b1e] border border-[#27282C]">
        <button
          className="w-full bg-[#252629] text-[#fff] mb-4 text-lg max-[350px]:text-base rounded-lg px-4 py-2 flex items-center justify-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer"
          onClick={() => navigate('/statistics')}
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Статистика-YhivudarfVdH5nrWjCGb22Dzi0bV69.gif"
            alt="Statistics"
            className="w-7 h-7 mr-2"
          />
          <span className="text-shadow-[0_0_5px_rgba(0,163,255,0.5)] transition-all duration-300 hover:text-shadow-[0_0_10px_rgba(0,163,255,0.7)] text-white">
            {t('profile.statisticsBtn')}
          </span>
        </button>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#252629] p-3 rounded-lg text-center flex flex-col items-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)]">
            <div className="text-lg font-bold flex items-center justify-center gap-3 text-white mb-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Люди-r51OhufSUCgXxG5rZX5E7K5d5TpfAB.gif"
                alt="Referrals"
                className="w-7 h-7"
              />
              <span>{referralsCount}</span>
            </div>
            <div className="text-[13px] text-[#8F96A3]">{t('profile.referrals')}</div>
          </div>
          <div className="bg-[#252629] p-3 rounded-lg text-center flex flex-col items-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)]">
            <div className="text-lg font-bold flex items-center justify-center gap-3 text-white mb-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Покупок-WRzItxdECelB09wDBDbapS7JN4nqAR.gif"
                alt="Purchases"
                className="w-7 h-7"
              />
              <span>{transactionsCount}</span>
            </div>
            <div className="text-[13px] text-[#8F96A3]">{t('profile.purchases')}</div>
          </div>
          <div className="bg-[#252629] p-3 rounded-lg text-center flex flex-col items-center border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)]">
            <div className="text-lg font-bold flex items-center justify-center gap-3 text-white mb-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Доход-Wj6IqY7LjQWdgWAiYijUlRNkY32Sxp.gif"
                alt="Income"
                className="w-7 h-7"
              />
              <span>{(user?.balanceUSDT ?? 0) > 0 ? (user?.balanceUSDT ?? 0).toFixed(1) : '0'}</span>
            </div>
            <div className="text-[13px] text-[#8F96A3]">{t('profile.income')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
