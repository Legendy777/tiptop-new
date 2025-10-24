import {useTranslation} from "react-i18next";


const ReferralInfo = () => {
  const {t} = useTranslation();

  return (
    <div className="flex flex-col max-w-[28rem] w-full h-full overflow-y-auto py-2 px-2">
      {/* Main Title Section */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🤝</span>
        <h2 className="text-xl font-medium text-white">{t('referralsDetails.title')}</h2>
      </div>

      {/* Description */}
      <div className="bg-[#1a1b1e] p-2 mb-2 rounded-lg border  border-[#27282C]">
        <p className="text-[#8F96A3] text-sm leading-relaxed">
          {t('referralsDetails.desc')}
        </p>
      </div>

      {/* Benefits Section */}
      <div className="bg-[#1a1b1e] p-2 mb-2 rounded-lg border  border-[#27282C]">
        <h3 className="text-white text-base font-medium mb-3">{t('referralsDetails.advantagesTitle')}</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-[#8F96A3] text-sm">
            <span className="text-white">•</span>
            <span>{t('referralsDetails.advantagesText1')}</span>
          </li>
          <li className="flex items-center gap-2 text-[#8F96A3] text-sm">
            <span className="text-white">•</span>
            <span>{t('referralsDetails.advantagesText2')}</span>
          </li>
          <li className="flex items-center gap-2 text-[#8F96A3] text-sm">
            <span className="text-white">•</span>
            <span>{t('referralsDetails.advantagesText3')}</span>
          </li>
        </ul>
      </div>

      {/* Reward Levels */}
      <div className="bg-[#1a1b1e] p-2 mb-2 rounded-lg border  border-[#27282C]">
        <h3 className="text-white text-base font-medium mb-3">{t('referralsDetails.levelsTitle')}</h3>
        <p className="text-[#8F96A3] text-sm mb-3">
          {t('referralsDetails.levelsDesc')}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#8F96A3] text-sm">1lvl</span>
              <span>💎</span>
            </div>
            <span className="text-[#8F96A3] text-sm">1% - 1 👥</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#8F96A3] text-sm">2lvl</span>
              <span>💎💎</span>
            </div>
            <span className="text-[#8F96A3] text-sm">2% - 3 👥</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#8F96A3] text-sm">3lvl</span>
              <span>💎💎💎</span>
            </div>
            <span className="text-[#8F96A3] text-sm">3% - 6 👥</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#8F96A3] text-sm">4lvl</span>
              <span>💎💎💎💎</span>
            </div>
            <span className="text-[#8F96A3] text-sm">4% - 10 👥</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#8F96A3] text-sm">5lvl</span>
              <span>💎💎💎💎💎</span>
            </div>
            <span className="text-[#8F96A3] text-sm">5% - 15 👥</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-[#1a1b1e] p-2 rounded-lg border  border-[#27282C]">
        <h3 className="text-white text-base font-medium mb-3">{t('referralsDetails.conditionsTitle')}</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-[#8F96A3] text-sm">
            <span className="text-white">•</span>
            <span>{t('referralsDetails.conditionsText1')}</span>
          </li>
          <li className="flex items-center gap-2 text-[#8F96A3] text-sm">
            <span className="text-white">•</span>
            <span>{t('referralsDetails.conditionsText2')}</span>
          </li>
          <li className="flex items-center gap-2 text-[#8F96A3] text-sm">
            <span className="text-white">•</span>
            <span>{t('referralsDetails.conditionsText3')}</span>
          </li>
          <li className="flex items-center gap-2 text-[#8F96A3] text-sm">
            <span className="text-white">•</span>
            <span>{t('referralsDetails.conditionsText4')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReferralInfo;
