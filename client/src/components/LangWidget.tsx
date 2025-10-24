import React from 'react';
import type {RefObject} from 'react';
import { useTranslation } from 'react-i18next';
import { forwardRef } from 'react';

interface LangWidgetProps {
  onSelect: (lang: 'ru' | 'en') => void;
  ref: RefObject<HTMLDivElement | null>;
}

const LangWidget: React.FC<LangWidgetProps> = forwardRef<HTMLDivElement, LangWidgetProps>(({ onSelect }, ref) => {
  const {t} = useTranslation();

  return (
    <div ref={ref} className="absolute top-[60px] right-[10px] bg-[#1A1B1E] text-white p-4 rounded-lg border  border-[#27282C]">
      <h3 className="mb-2 text-sm font-medium text-[#8F96A3]">{t('langWidget.title')}</h3>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 text-sm text-[#8F96A3] rounded-lg border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer"
          onClick={() => onSelect('ru')}
        >
          {t('langWidget.ru')}
        </button>
        <button
          className="px-4 py-2 text-sm text-[#8F96A3] rounded-lg border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer"
          onClick={() => onSelect('en')}
        >
          {t('langWidget.en')}
        </button>
      </div>
    </div>
  );
});

export default LangWidget;