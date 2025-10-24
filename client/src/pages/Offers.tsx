import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../store/store";
import { fetchOffers } from "../store/features/offersSlice.ts";
import { useTranslation } from "react-i18next";
import { fetchGame } from "../store/features/gamesSlice.ts";
import MarqueeTitle from "../components/MarqueeTitle.tsx";

const Offer = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); // Use useNavigate instead of redirect
  const { offers, loading, error } = useSelector((state: RootState) => state.offers);
  const gameData = useSelector((state: RootState) => state.games);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchOffers({ gameId: Number(gameId), isEnabled: true }));

    if ((!gameData && gameId) || gameData?.game?._id !== Number(gameId)) {
      // Fetch game data if not already available
      dispatch(fetchGame(Number(gameId)));
    }
  }, [gameId, dispatch]);

  if (loading) return <p>{t('offers.loading')}</p>;
  if (error) return <p>{t('offers.error', { error: error })}</p>;
  // if (!offers || offers.length === 0) return <p className='text-white pt-1'>{t('offers.noProducts')}</p>;

  if (gameData?.loading) return <p>{t('home.loading')}</p>;
  if (gameData?.error) return <p>{t('home.error', { error: error })}</p>;
  if (!gameData?.game) return <p className='text-white pt-1'>{t('home.noGame')}</p>;

  const redirectToAppStore = () => {
    window.open(gameData?.game?.appleStoreUrl, "_blank");
  }

  const redirectToGooglePlay = () => {
    window.open(gameData?.game?.googlePlayUrl, "_blank");
  }

  return (
    <div className="flex flex-col max-w-[28rem] w-full h-full overflow-hidden pt-2">
      <div className="flex flex-col justify-between px-2 h-[210px] max-[350px]:h-[200px]">
        {/* Trailer block */}
        <div className="w-full flex items-start justify-center">
          <iframe
            className="w-full flex-1 h-fit rounded-[10px]"
            src={gameData?.game?.trailerUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>

        {/* Buttons block */}
        <div className="w-full grid grid-cols-2 gap-2.5 pb-1.5 pt-1.5">
          <button onClick={redirectToAppStore} className="flex justify-center items-center gap-1 px-4 max-[350px]:px-1 py-2 max-[350px]:py-1 bg-[#1A1B1E] text-white rounded-lg cursor-pointer border  border-[#27282C]">
            <img src="/AppStore.png" alt="appstore" className="w-[26px] max-[350px]:w-[24px] object-contain rounded-[10px]" />
            <span className="max-[350px]:text-sm">App Store</span>
          </button>
          <button onClick={redirectToGooglePlay} className="flex justify-center items-center gap-1 px-4 max-[350px]:px-1 py-2 max-[350px]:py-1 bg-[#1A1B1E] text-white rounded-lg cursor-pointer border  border-[#27282C]">
            <img src="/GooglePlay.png" alt="googleplay" className="w-[28px] max-[350px]:w-[26px] mt-0.5 object-contain rounded-[10px]" />
            <span className="max-[350px]:text-sm">Google Play</span>
          </button>
        </div>
      </div>

      {/* Offers block */}
      <div className="px-2 pb-2 flex-1 overflow-y-auto">
        <div className="">
          <div className="grid grid-cols-2 gap-2.5 w-full text-white">
            {offers.map((offer, index) => (
                <div onClick={() => navigate(`/games/${gameId}/offers/${offer._id}/order`)} key={index} className="bg-gray-800 rounded-lg shadow-md box-border cursor-pointer border-2  border-[#27282C]">
                  <img src={offer.imageUrl} alt={offer.title} className="w-[100%] aspect-square object-center object-cover rounded-tl-[8px] rounded-tr-[8px]" />
                  <div className="flex flex-col items-center justify-between gap-2 gap-y-0 flex-wrap bg-[#1A1B1E] py-1 px-2 rounded-bl-lg rounded-br-lg">
                    <h2 className="text-sm pb-0.5 pl-1 max-w-full pr-0.5 font-normal text-[#fff] whitespace-nowrap overflow-hidden">
                      <MarqueeTitle text={offer.title} />
                    </h2>
                    <div className="flex flex-row items-center justify-between gap-2 w-full">
                      <p className="text-sm text-green-400">{offer.priceUSDT + "$"}</p>
                      <p className="text-sm text-green-400">{offer.priceRUB + "₽"}</p>
                    </div>
                  </div>
                </div>
            ))}
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-2 mt-2">
            <div className="flex gap-2">
              <p className="text-white text-base">{t('offers.footerText')}</p>
              <img src="/question.png" alt="question" className="w-[16px] object-contain rounded-[10px]" />
            </div>
            <button onClick={() => navigate("/chat")} className="bg-[#1A1B1E] text-[#fff] border border-[#27282C] rounded-lg px-4 py-2 cursor-pointer">{t('offers.footerBtn')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
