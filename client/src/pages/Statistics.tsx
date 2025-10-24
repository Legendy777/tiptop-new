import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { fetchTransactionsByReferId } from "../store/features/transactionsSlice.ts";
import type { ITransaction } from "../store/features/transactionsSlice.ts";
import { fetchReferralsCountByReferId } from "../store/features/referralsSlice.ts";
import {useTranslation} from "react-i18next";



const Statistics = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {t} = useTranslation();

  const user = useSelector((state: RootState) => state.user.user);
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const referralsCount = useSelector((state: RootState) => state.referrals.referralsCount);

  useEffect(() => {
    dispatch(fetchTransactionsByReferId());
    dispatch(fetchReferralsCountByReferId());
  }, [dispatch]);

  return (
    <div className="flex flex-col max-w-[28rem] w-full h-full overflow-y-auto py-3 px-2">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className={`rounded-lg bg-[#1a1b1e] p-4 border  border-[#27282C]`}
        >
          <div className="text-[22px] max-[350px]:text-lg font-bold text-white flex items-center justify-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Люди-r51OhufSUCgXxG5rZX5E7K5d5TpfAB.gif"
              alt="Referrals"
              className="w-7 h-7 max-[350px]:w-5 max-[350px]:h-5"
            />
            <span className="text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)] text-white">{referralsCount}</span>
          </div>
          <div className="text-[#8F96A3] text-sm text-center text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]">{t('statistics.referrals')}</div>
        </div>
        <div
          className={`rounded-lg bg-[#1a1b1e] p-4 border  border-[#27282C]`}
        >
          <div className="text-[22px] max-[350px]:text-lg font-bold text-white flex items-center justify-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Покупок-WRzItxdECelB09wDBDbapS7JN4nqAR.gif"
              alt="Purchases"
              className="w-7 h-7 max-[350px]:w-5 max-[350px]:h-5"
            />
            <span className="text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)] text-white">{transactions.length}</span>
          </div>
          <div className="text-[#8F96A3] text-sm text-center text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]">{t('statistics.purchases')}</div>
        </div>
        <div className="rounded-lg bg-[#1a1b1e] p-4 border  border-[#27282C]">
          <div className="text-[22px] max-[350px]:text-lg font-bold text-white flex items-center justify-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Доход-Wj6IqY7LjQWdgWAiYijUlRNkY32Sxp.gif"
              alt="Income"
              className="w-7 h-7 max-[350px]:w-5 max-[350px]:h-5"
            />
            <span className="text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)] text-white">{(user?.balanceUSDT ?? 0) > 0 ? (user?.balanceUSDT ?? 0).toFixed(1) : '0'}</span>
          </div>
          <div className="text-[#8F96A3] text-sm text-center text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]">{t('statistics.income')}</div>
        </div>
      </div>

      {/* Purchases List */}
      <div className="space-y-2 mt-2">
        {transactions.map((transaction: ITransaction) => (
          <div key={transaction._id} className="rounded-lg border bg-[#1a1b1e] border-[#27282C] p-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[#8F96A3] text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]">👤 Пользователь:</span>
                <a
                  href={`https://t.me/${transaction.username}`}
                  className="text-[#8F96A3] hover:underline text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]"
                  target="_blank" rel="noopener noreferrer"
                >
                  {transaction.username}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8F96A3] text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]">💰 {t('statistics.sum')}:</span>
                <span className="text-white text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]">${transaction.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8F96A3] text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]">🕒 {t('statistics.date')}:</span>
                <span className="text-white text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]">{transaction.createdAt.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8F96A3] text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]">🎁 {t('statistics.accrual')}:</span>
                <span className="text-green-500 text-shadow-[0_0_10px_rgba(0,163,255,0.3)] transition-all duration-300 hover:text-shadow-[0_0_15px_rgba(0,163,255,0.5)]">
                  ${(transaction.earned ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Statistics;
