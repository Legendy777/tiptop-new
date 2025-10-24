import {useTranslation} from "react-i18next";
import {forwardRef} from "react";

const LinksWidget = forwardRef<HTMLDivElement>((_, ref) => {
    const {t} = useTranslation();

    return (
        <div ref={ref} className="flex flex-col justify-start absolute right-[8px] bottom-[58px] h-fill w-fill bg-[#1A1B1E] text-white items-center rounded-lg border  border-[#27282C]">
            <div className="flex flex-col gap-2 w-full px-2 py-2 box-border">
                <a href="https://t.me/TipTop999_catalog" target="_blank" className="flex items-center justify-start gap-2 bg-[#1E1F23] rounded-lg px-2 py-2 border  border-[#27282C] cursor-pointer">
                    <div className="flex items-center gap-2">
                        <img className="w-[18px] h-[18px]" src="/Catalog.gif" alt="reviews" />
                        <span className="text-[14px] text-[#8F96A3]">{t('linksWidget.catalog')}</span>
                    </div>
                </a>
                <a href="https://t.me/TipTop999_news" target="_blank" className="flex items-center justify-start gap-2 bg-[#1E1F23] rounded-lg px-2 py-2 border  border-[#27282C] cursor-pointer">
                    <div className="flex items-center gap-2">
                        <img className="w-[18px] h-[18px]" src="/News.gif" alt="support" />
                        <span className="text-[14px] text-[#8F96A3]">{t('linksWidget.news')}</span>
                    </div>
                </a>
                <a href="https://t.me/TipTop999_bot" target="_blank" className="flex items-center justify-start gap-2 bg-[#1E1F23] rounded-lg px-2 py-2 border  border-[#27282C] cursor-pointer">
                    <div className="flex items-center gap-2">
                        <img className="w-[18px] h-[18px]" src="/Bot.gif" alt="about us" />
                        <span className="text-[14px] text-[#8F96A3]">{t('linksWidget.bot')}</span>
                    </div>
                </a>
            </div>
        </div>
    );
});

export default LinksWidget;
