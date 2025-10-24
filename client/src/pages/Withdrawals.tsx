import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store.ts";
import { useEffect, useMemo } from "react";
import { createWithdrawal, fetchWithdrawalsByMe } from "../store/features/withdrawalsSlice.ts";
import { Gem } from "lucide-react";
import {fetchUser} from "../store/features/userSlice.ts";
import {useTranslation} from "react-i18next";

const Withdrawals = () => {
  const dispatch = useDispatch<AppDispatch>();
  const withdrawals = useSelector((state: RootState) => state.withdrawals.withdrawals);
  const user = useSelector((state: RootState) => state.user.user);

  const {t} = useTranslation();

  useEffect(() => {
    dispatch(fetchWithdrawalsByMe());
  }, [dispatch]);

  const hasActiveRequest = useMemo(() => {
    return withdrawals.some(w => w.status === 'pending');
  }, [withdrawals]);

  if (!user) return null;

  const currentBalance = user.balanceUSDT;

  const handleNewWithdrawal = async () => {
    if (currentBalance) {
      const newWithdrawal = {
        amount: currentBalance
      };

      await dispatch(createWithdrawal(newWithdrawal));
      await dispatch(fetchWithdrawalsByMe());
      await dispatch(fetchUser());
    }
  };

  return (
      <div className="flex flex-col max-w-[28rem] w-full h-full overflow-y-auto py-3 px-2">
        {/* User Info */}
        <div className="rounded-lg border bg-[#1a1b1e] border-[#27282C] mb-2">
          <div className="flex items-center gap-1">
            <div className="w-[75px] h-[75px] bg-[#252629] rounded-lg flex items-center justify-center border border-[#27282C] overflow-hidden">
              <img
                  src={user.avatarUrl || ""}
                  alt="Profile"
                  className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h2 className="text-base font-normal mb-0.5 text-white">{user.username}</h2>
              <div className="text-sm font-normal text-white">ID: {user._id}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm font-normal text-white">{user.referralPercent}%</span>
                <div className="flex text-[#4a9eff]">
                  {Array.from({ length: user.referralPercent || 0 }, (_, i) => (
                      <Gem key={i} className="text-[#b9f2ff]" size={18} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Info */}
        <div className="rounded-lg border bg-[#1a1b1e] border-[#27282C] p-2 mb-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤖</span>
            <h2 className="text-base font-medium text-white">{t('withdrawals.title')}</h2>
          </div>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>⏰</span>
              <span>{t('withdrawals.text1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📌</span>
              <span>{t('withdrawals.text2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🚀</span>
              <span>{t('withdrawals.text3')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💬</span>
              <span>{t('withdrawals.text4')}</span>
            </div>
          </div>
        </div>

        {/* Balance and Withdraw Button */}
        <div className="rounded-lg border bg-[#1a1b1e] border-[#27282C] p-2 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <div>
                <div className="text-sm text-gray-400">{t('withdrawals.balance')}:</div>
                <div className="text-xl max-[350px]:text-base font-bold text-white">{currentBalance?.toFixed(2)}$</div>
              </div>
            </div>
            <button
                className="bg-[#252629] text-[#8F96A3] max-[350px]:text-sm px-6 py-2 rounded-md font-medium disabled:opacity-60 border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer"
                disabled={hasActiveRequest || (currentBalance ?? 0) < 1}
                onClick={handleNewWithdrawal}
            >
              {t('withdrawals.btn')}
            </button>
          </div>
        </div>

        {/* Current Request */}
        {/*{hasActiveRequest && (*/}
        {/*    <div className="rounded-lg border bg-[#1a1b1e] border-[#27282C] p-2 mb-2">*/}
        {/*      <h3 className="text-base font-medium text-[#FFB800] mb-2">Текущая заявка в обработке</h3>*/}
        {/*      <div className="space-y-1 text-sm">*/}
        {/*        <div className="flex items-center gap-2">*/}
        {/*          <span className="text-gray-400">Сумма:</span>*/}
        {/*          <span className="text-white">${currentBalance}</span>*/}
        {/*        </div>*/}
        {/*        <div className="flex items-center gap-2">*/}
        {/*          <span className="text-gray-400">Дата:</span>*/}
        {/*          <span className="text-white">27.12.2024, 15:59:18</span>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*)}*/}

        {/* Withdrawal History */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2">
            <span className="text-xl">📄</span>
            <h2 className="text-lg font-medium text-white">{t('withdrawals.historyTitle')}</h2>
          </div>
          {withdrawals.map((withdrawal, index) => (
              <div
                  key={index}
                  className="rounded-lg border bg-[#1a1b1e] border-[#27282C] p-2"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-lg max-[350px]:text-base font-medium text-white">${withdrawal.amount.toFixed(2)}</span>
                  <span
                      className={`text-sm ${
                          withdrawal.status === 'completed' ? 'text-green-500' : 'text-[#FFB800]'
                      }`}
                  >
                {withdrawal.status === 'completed' ? t('withdrawals.completed') : withdrawal.status === 'pending' ? t('withdrawals.pending') : t('withdrawals.failed')}
              </span>
                </div>
                <div className="text-sm text-gray-400">{t('withdrawals.date')}: {withdrawal.createdAt.toString()}</div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default Withdrawals;
