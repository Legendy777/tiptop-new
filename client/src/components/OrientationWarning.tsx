import { useEffect, useState } from "react";
import {useTranslation} from "react-i18next";

const OrientationWarning = () => {
    const [isLandscape, setIsLandscape] = useState(false);

    const { t } = useTranslation();

    const checkOrientation = () => {
        const inTelegram = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
        if (inTelegram) {
            setIsLandscape(false);
            return;
        }
        const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(orientation: landscape)') : null;
        if (mq) {
            setIsLandscape(mq.matches);
        } else {
            setIsLandscape(window.innerWidth > window.innerHeight);
        }
    };

    useEffect(() => {
        checkOrientation();
        window.addEventListener("resize", checkOrientation);
        window.addEventListener("orientationchange", checkOrientation);
        return () => {
            window.removeEventListener("resize", checkOrientation);
            window.removeEventListener("orientationchange", checkOrientation);
        };
    }, []);

    if (!isLandscape) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#000",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            fontSize: "20px",
            textAlign: "center"
        }}>
            {t('orientationWarning.text')}
        </div>
    );
};

export default OrientationWarning;
