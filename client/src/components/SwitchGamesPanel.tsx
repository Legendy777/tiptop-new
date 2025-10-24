import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import {ChevronLeft, StepBack, StepForward} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchGame, fetchGames } from "../store/features/gamesSlice.ts";
import { useEffect } from "react";
import {useTranslation} from "react-i18next";
import {fetchOffer, fetchOffers} from "../store/features/offersSlice.ts";

// @ts-ignore
// @ts-ignore
const SwitchGamesPanel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate(); // Use useNavigate instead of redirect
  const path = location.pathname.split("/").filter(Boolean);
  const {t} = useTranslation();

  const gameId = useSelector((state: RootState) => state.offers.offer?.gameId);
  const gamesCount = useSelector((state: RootState) => state.games.gamesCount);
  // const offersCount = useSelector((state: RootState) => state.offers.offers).length;
  const offers = useSelector((state: RootState) => state.offers.offers)

  useEffect(() => {
    if (path[0] === "offers") {
      dispatch(fetchGames());
    }

    if (path[0] === "order" && gameId) {
      dispatch(fetchGame(Number(gameId)));

      const data = {
        gameId: Number(gameId),
        isEnabled: true
      };

      dispatch(fetchOffers(data));
    }
  }, [path[0], path[1], gameId]);

  const game = useSelector((state: RootState) => state.games.game);

  if (path[0] === "offers" || path[0] === "order") {
      if (!game) return null;
  }

  const getNextOfferId = () => {
    const currentOfferId = Number(path[3]);
    const sortedOffers = [...offers]
        .map(o => o._id)
        .filter(id => id > currentOfferId)
        .sort((a, b) => a - b);

    return sortedOffers[0] ?? null;
  };

  const getPrevOfferId = () => {
    const currentOfferId = Number(path[3]);
    const sortedOffers = [...offers]
        .map(o => o._id)
        .filter(id => id < currentOfferId)
        .sort((a, b) => b - a);

    return sortedOffers[0] ?? null;
  };

  const getMinOfferId = () => {
    return offers.length > 0 ? Math.min(...offers.map(o => o._id)) : null;
  };

  const getMaxOfferId = () => {
    return offers.length > 0 ? Math.max(...offers.map(o => o._id)) : null;
  };

  const nextGame = async () => {
    if (path[0] === "offers") {
      const nextGameId = Number(path[1]) + 1;

      if (nextGameId > gamesCount) {
        const response = await dispatch(fetchGame(1));

        if (response.meta.requestStatus === "fulfilled") {
          navigate(`/offers/${1}`);
        } else {
          console.warn("Next game or its offers do not exist.");
        }

        return;
      }

      const response = await dispatch(fetchGame(nextGameId));

      if (response.meta.requestStatus === "fulfilled") {
        navigate(`/offers/${nextGameId}`);
      } else {
        console.warn("Next game or its offers do not exist.");
      }
    } else if (path[0] === "games" && path[2] === "offers" && path[4] === "order") {
      const nextOfferId = getNextOfferId();

      if (nextOfferId === null) {
        const response = await dispatch(fetchOffer(getMinOfferId() || -1));

        if (response.meta.requestStatus === "fulfilled") {
          navigate(`/games/${gameId}/offers/${getMinOfferId()}/order`);
        } else {
          console.warn("Next game or its offers do not exist.");
        }

        return;
      }

      const response = await dispatch(fetchOffer(nextOfferId));

      if (response.meta.requestStatus === "fulfilled") {
        navigate(`/games/${gameId}/offers/${nextOfferId}/order`);
      } else {
        console.warn("Next game or its offers do not exist.");
      }
    }
  };

  const prevGame = async () => {
    if (path[0] === "offers") {
      const prevGameId = Number(path[1]) - 1;

      if (prevGameId <= 0) {
        const response = await dispatch(fetchGame(gamesCount));

        if (response.meta.requestStatus === "fulfilled") {
          navigate(`/offers/${gamesCount}`);
        } else {
          console.warn("Previous game or its offers do not exist.");
        }

        return;
      }

      const response = await dispatch(fetchGame(prevGameId));

      if (response.meta.requestStatus === "fulfilled") {
        navigate(`/offers/${prevGameId}`);
      } else {
        console.warn("Previous game or its offers do not exist.");
      }
    } else if (path[0] === "games" && path[2] === "offers" && path[4] === "order") {
      const prevOfferId = getPrevOfferId();

      if (prevOfferId === null) {
        const response = await dispatch(fetchOffer(getMaxOfferId() || -1));

        if (response.meta.requestStatus === "fulfilled") {
          navigate(`/games/${gameId}/offers/${getMaxOfferId()}/order`);
        } else {
          console.warn("Previous game or its offers do not exist.");
        }

        return;
      }

      const response = await dispatch(fetchOffer(prevOfferId));

      if (response.meta.requestStatus === "fulfilled") {
        navigate(`/games/${gameId}/offers/${prevOfferId}/order`);
      } else {
        console.warn("Previous game or its offers do not exist.");
      }
    }
  };

  let title;

  if (path[0] === "offers") {
    title = game?.title;
  } else if (path[0] === "games" && path[2] === "offers" && path[4] === "order") {
    title = game?.title;
  } else if (path[0] === "orders") {
    title = t('switchGamesPanel.history');
  } else if (path[0] === "profile") {
    title = t('switchGamesPanel.referral');
  } else if (path[0] === "referral-info") {
    title = t('switchGamesPanel.rules');
  } else if (path[0] == "statistics") {
    title = t('switchGamesPanel.statistics');
  } else if (path[0] === "withdrawals") {
    title = t('switchGamesPanel.withdrawal');
  } else if (path[0] === "reviews") {
    title = t('switchGamesPanel.reviews');
  } else if (path[0] === "purchase-form") {
    title = t('switchGamesPanel.entry');
  } else if (path[0] === "about") {
    title = t('switchGamesPanel.about');
  } else if (path[0] === "chat") {
    title = t('switchGamesPanel.support');
  } else if (path[0] === "review") {
    title = t('switchGamesPanel.review');
  }

  const handleBack = () => {
    window.history.back();
  };

  return (
    <header className='flex justify-center bg-[#1A1B1E] text-white items-center py-[10px] border-b  border-[#27282C]'>
      <div className='flex gap-1 max-w-[28rem] w-full items-center gap-1.5 px-2'>
        <div style={path[0] !== "offers" && path[4] !== "order" ? {display: "flex"} : {display: "none"}} onClick={handleBack} className="flex items-center justify-center h-[40px] w-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer">
          <ChevronLeft className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20} />
        </div>
        <div style={path[0] === "orders" || path[0] === "profile" || path[0] === "referral-info" || path[0] === "statistics" || path[0] === "withdrawals" || path[0] === "reviews" || path[0] === "purchase-form" || path[0] === "about" || path[0] === "chat" || path[0] === "review" ? {display: "none"} : {display: "flex"}} onClick={prevGame} className="flex items-center justify-center h-[40px] w-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer">
          <StepBack className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20} />
        </div>
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <h1 onClick={() => navigate("/")} className='text-lg max-[350px]:text-base text-[#fff] font-medium overflow-hidden text-ellipsis whitespace-nowrap'>{title}</h1>
        </div>
        <div style={path[0] === "orders" || path[0] === "profile" || path[0] === "referral-info" || path[0] === "statistics" || path[0] === "withdrawals" || path[0] === "reviews" || path[0] === "purchase-form" || path[0] === "about" || path[0] === "chat" || path[0] === "review" ? {display: "none"} : {display: "flex"}} onClick={nextGame} className="flex items-center justify-center h-[40px] w-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer">
          <StepForward className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20} />
        </div>
        <div style={path[0] !== "offers" && path[4] !== "order" ? {display: "flex"} : {display: "none"}} className="flex items-center justify-center h-[40px] w-[40px] max-[350px]:w-[35px] max-[350px]:h-[35px] rounded-lg border border-[#00CCCC33] shadow-[0_0_10px_rgba(0,204,204,0.2)] cursor-pointer invisible">
          <ChevronLeft className="text-[#8F96A3] max-[350px]:w-[18px] max-[350px]:h-[18px]" size={20} />
        </div>
      </div>
    </header>
  );
};

export default SwitchGamesPanel;
