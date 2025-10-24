import {useDispatch} from "react-redux";
import type {AppDispatch} from "../store/store.ts";
import {fetchActiveGames, fetchDiscountedGames, fetchGames} from "../store/features/gamesSlice.ts";
import {useTranslation} from "react-i18next";
import { forwardRef } from 'react';

const CategoriesWidget = forwardRef<HTMLDivElement, any>(({setCategoriesVisible}, ref) => {
    const dispatch = useDispatch<AppDispatch>();

    const {t} = useTranslation();

    const fetchAllGames = () => {
        setCategoriesVisible(false);
        dispatch(fetchGames());
    }

    const fetchAllActiveGames = () => {
        setCategoriesVisible(false);
        dispatch(fetchActiveGames());
    }

    const fetchAllGamesWithDiscount = () => {
        setCategoriesVisible(false);
        dispatch(fetchDiscountedGames());
    }

    return (
        <div ref={ref} className="flex z-10 flex-col justify-start absolute top-[60px] left-[10px] h-fill w-fill bg-[#1A1B1E] text-white items-center rounded-lg border  border-[#27282C]">
            <div className="flex flex-col gap-2 w-full px-2 py-2 box-border">
                <div onClick={fetchAllGames} className="flex items-center justify-start gap-2 bg-[#1E1F23] rounded-lg px-2 py-2 border  border-[#27282C] cursor-pointer">
                    <div className="flex items-center gap-2">
                        <img className="w-[18px] h-[18px]" src="/Catalog.gif" alt="reviews" />
                        <span className="text-[14px] text-[#8F96A3]">{t('categoriesWidget.allGames')}</span>
                    </div>
                </div>
                <div onClick={fetchAllActiveGames} className="flex items-center justify-start gap-2 bg-[#1E1F23] rounded-lg px-2 py-2 border  border-[#27282C] cursor-pointer">
                    <div className="flex items-center gap-2">
                        <img className="w-[18px] h-[18px]" src="/News.gif" alt="support" />
                        <span className="text-[14px] text-[#8F96A3]">{t('categoriesWidget.actualGames')}</span>
                    </div>
                </div>
                <div onClick={fetchAllGamesWithDiscount} className="flex items-center justify-start gap-2 bg-[#1E1F23] rounded-lg px-2 py-2 border  border-[#27282C] cursor-pointer">
                    <div className="flex items-center gap-2">
                        <img className="w-[18px] h-[18px]" src="/Bot.gif" alt="about us" />
                        <span className="text-[14px] text-[#8F96A3]">{t('categoriesWidget.discounts')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CategoriesWidget;
