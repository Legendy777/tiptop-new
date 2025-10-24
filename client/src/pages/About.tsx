import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function About() {
    const { t } = useTranslation();
    const [activeMainTab, setActiveMainTab] = useState<'about' | 'info'>('about');
    const [activeInfoTab, setActiveInfoTab] = useState<'agreement' | 'privacy'>('agreement');

    return (
        <div className="flex flex-col max-w-[28rem] mb-2 px-2 w-full text-white">
            {/* Main Navigation */}
            <div className="w-full bg-[#1a1b1e] p-2 mt-2 rounded-lg border  border-[#27282C]">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        className={`py-2 px-3 max-[350px]:text-sm max-[350px]:px-0 rounded-lg flex items-center justify-center cursor-pointer gap-2 ${
                            activeMainTab === 'about' ? 'bg-[#252629] text-white' : 'text-[#8F96A3] hover:bg-[#252629]'
                        }`}
                        onClick={() => setActiveMainTab('about')}
                    >
                        <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/О нас-qEHO7DLhT0EnUUme9mFMSVcUXfg5JS.gif"
                            alt={t('about.tabs.about')}
                            className="w-5 h-5"
                        />
                        <span>{t('about.tabs.about')}</span>
                    </button>
                    <button
                        className={`py-2 px-3 max-[350px]:text-sm max-[350px]:px-0 rounded-lg flex items-center cursor-pointer justify-center gap-2 ${
                            activeMainTab === 'info' ? 'bg-[#252629] text-white' : 'text-[#8F96A3] hover:bg-[#252629]'
                        }`}
                        onClick={() => setActiveMainTab('info')}
                    >
                        <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Инфо-rdnciHLjX0w1qpNN5CAH9oMFKxwH5z.gif"
                            alt={t('about.tabs.info')}
                            className="w-5 h-5"
                        />
                        <span>{t('about.tabs.info')}</span>
                    </button>
                </div>
            </div>

            {/* Info Sub-Navigation */}
            {activeMainTab === 'info' && (
                <div className="w-full bg-[#1a1b1e] p-2 mt-2 rounded-lg border  border-[#27282C]">
                    <div className="flex flex-row max-[350px]:flex-col gap-2">
                        <button
                            className={`py-2 px-3 max-[350px]:text-sm max-[350px]:whitespace-break-spaces rounded-lg flex items-center cursor-pointer justify-center gap-2 ${
                                activeInfoTab === 'agreement' ? 'bg-[#252629] text-white' : 'text-[#8F96A3] hover:bg-[#252629]'
                            }`}
                            onClick={() => setActiveInfoTab('agreement')}
                        >
                            <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Стрелка вниз-8B47YSRXaMqxptvSDC0qIn20wONJg3.gif"
                                alt={t('about.tabs.agreement')}
                                className="w-5 h-5"
                            />
                            {t('about.tabs.agreement')}
                        </button>
                        <button
                            className={`py-2 px-3 max-[350px]:text-sm max-[350px]:whitespace-break-spaces rounded-lg flex cursor-pointer items-center justify-center gap-2 ${
                                activeInfoTab === 'privacy' ? 'bg-[#252629] text-white' : 'text-[#8F96A3] hover:bg-[#252629]'
                            }`}
                            onClick={() => setActiveInfoTab('privacy')}
                        >
                            <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Стрелка вниз-8B47YSRXaMqxptvSDC0qIn20wONJg3.gif"
                                alt={t('about.tabs.privacy')}
                                className="w-5 h-5"
                            />
                            {t('about.tabs.privacy')}
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="w-full flex-1 mt-2 overflow-y-auto">
                {activeMainTab === 'about' && (
                    <div>
                        <div className="w-full bg-[#1a1b1e] p-2 text-[#8F96A3] rounded-lg border  border-[#27282C]">
                            <h2 className="text-xl max-[350px]:text-base font-medium text-white mb-2">{t('about.content.greetingTitle')}</h2>
                            <p className="max-[350px]:text-sm">{t('about.content.greetingText')}</p>
                        </div>
                        <div className="w-full bg-[#1a1b1e] p-2 mt-2 text-[#8F96A3] rounded-lg border  border-[#27282C]">
                            <h2 className="text-xl max-[350px]:text-base font-medium text-white mb-2">{t('about.content.shopTitle')}</h2>
                            <p className="max-[350px]:text-sm">{t('about.content.shopText')}</p>
                        </div>
                        <div className="w-full bg-[#1a1b1e] p-2 mt-2 text-[#8F96A3] rounded-lg border  border-[#27282C]">
                            <h2 className="text-xl max-[350px]:text-base font-medium text-white mb-2">{t('about.content.advantagesTitle')}</h2>
                            <p className="max-[350px]:text-sm">• {t('about.content.advantage1')}</p>
                            <p className="max-[350px]:text-sm">• {t('about.content.advantage2')}</p>
                            <p className="max-[350px]:text-sm">• {t('about.content.advantage3')}</p>
                            <p className="max-[350px]:text-sm">• {t('about.content.advantage4')}</p>
                        </div>
                        <div className="w-full bg-[#1a1b1e] p-2 mt-2 text-[#8F96A3] rounded-lg border  border-[#27282C]">
                            <h2 className="text-xl max-[350px]:text-base font-medium text-white mb-2">{t('about.content.securityTitle')}</h2>
                            <p className="max-[350px]:text-sm">{t('about.content.securityText')}</p>
                        </div>
                        <div className="w-full bg-[#1a1b1e] p-2 mt-2 text-[#8F96A3] rounded-lg border  border-[#27282C]">
                            <h2 className="text-xl max-[350px]:text-base font-medium text-white mb-2">{t('about.content.supportTitle')}</h2>
                            <p className="max-[350px]:text-sm">{t('about.content.supportText')}</p>
                        </div>
                    </div>
                )}

                {activeMainTab === 'info' && activeInfoTab === 'agreement' && (
                    <div className="bg-[#1a1b1e] rounded-lg p-2 text-[#8F96A3] border  border-[#27282C]">
                        <h2 className="text-xl max-[350px]:text-base font-medium text-white mb-2">{t('about.agreement.title')}</h2>
                        <p className="max-[350px]:text-sm">{t('about.agreement.date')}</p>
                        <p className="max-[350px]:text-sm">{t('about.agreement.intro')}</p>
                        <h3>{t('about.agreement.acceptanceTitle')}</h3>
                        <p className="max-[350px]:text-sm">{t('about.agreement.acceptanceText')}</p>
                        <h3>{t('about.agreement.servicesTitle')}</h3>
                        <p className="max-[350px]:text-sm">{t('about.agreement.servicesText')}</p>
                        <h3>{t('about.agreement.liabilityTitle')}</h3>
                        <p className="max-[350px]:text-sm">{t('about.agreement.liabilityText')}</p>
                    </div>
                )}

                {activeMainTab === 'info' && activeInfoTab === 'privacy' && (
                    <div className="bg-[#1a1b1e] rounded-lg p-2 text-[#8F96A3] border  border-[#27282C]">
                        <h2 className="text-xl max-[350px]:text-base font-medium text-white mb-2">{t('about.privacy.title')}</h2>
                        <p className="max-[350px]:text-sm">{t('about.privacy.date')}</p>
                        <p className="max-[350px]:text-sm">{t('about.privacy.intro')}</p>
                        <h3>{t('about.privacy.collectTitle')}</h3>
                        <p className="max-[350px]:text-sm">{t('about.privacy.collectText')}</p>
                        <h3>{t('about.privacy.useTitle')}</h3>
                        <p className="max-[350px]:text-sm">{t('about.privacy.useText')}</p>
                        <h3>{t('about.privacy.securityTitle')}</h3>
                        <p className="max-[350px]:text-sm">{t('about.privacy.securityText')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
