import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../store/store";
import {fetchOffer, fetchOffers} from "../store/features/offersSlice.ts";
import { useTranslation } from "react-i18next";
import { createCryptoPayment } from "../store/features/paymentsSlice.ts";
import {fetchGame} from "../store/features/gamesSlice.ts";

const Order = () => {
  const { gameId, offerId } = useParams<{ gameId: string, offerId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const offers = useSelector((state: RootState) => state.offers);
  const game = useSelector((state: RootState) => state.games.game);

  useEffect(() => {
    dispatch(fetchGame(Number(gameId)))
    dispatch(fetchOffers({gameId: Number(gameId), isEnabled: true}))
    dispatch(fetchOffer(Number(offerId)));
  }, [dispatch, offerId]);

  if (offers?.loading) return <p>Loading...</p>;
  if (offers?.error) return <p>Error: {offers.error}</p>;
  if (!offers?.offer) return <p>No offer data available</p>;

  const handleOrder = async () => {
    const paymentData = {
      gameName: game?.title ?? "Unknown Game",
      offerName: offers?.offer?.title ?? "Unknown Offer",
      price: offers?.offer?.priceUSDT ?? 0,
    };

    const response = await dispatch(createCryptoPayment(paymentData));

    if (createCryptoPayment.fulfilled.match(response)) {
      window.open(response.payload.invoice.miniAppInvoiceUrl, "_blank");
    } else {
      console.error("Payment creation failed", response);
    }
  };

  const handleRubOrder = async () => {
    const paymentData = {
      gameName: game?.title ?? "Unknown Game",
      offerName: offers?.offer?.title ?? "Unknown Offer",
      price: offers?.offer?.priceRUB ?? 0,
    };

    const response = await dispatch(createCryptoPayment(paymentData));

    if (createCryptoPayment.fulfilled.match(response)) {
      window.open(response.payload.invoice.payUrl, "_blank");
    } else {
      console.error("Payment creation failed", response);
    }
  };

  return (
    <div className="text-white flex flex-col gap-1 max-w-[28rem] w-full h-full overflow-hidden pt-2">
      <div className="flex flex-col w-full items-center justify-start px-2">
        <h1 className="text-lg max-[350px]:text-base font-bold pb-2 max-[350px]:pb-1">{offers.offer.title}</h1>
        <img className="w-fit max-h-[160px] object-contain rounded-[10px]" src={offers.offer.imageUrl} alt={offers.offer.title} />
      </div>
      <div className="flex flex-col flex-1 gap-2.5 justify-start items-center px-2 h-[200px]">
        {/*<p>{t('order.text')}</p>*/}
        <div className="flex flex-col pt-2 max-[350px]:pt-1 gap-2 max-[350px]:gap-1.5 w-full">
          <div className="flex flex-row gap-2 max-[350px]:gap-1.5 w-full">
            <button onClick={handleOrder} className="flex flex-row w-full gap-2 justify-between px-4 py-2 max-[350px]:py-1.5 rounded-lg bg-[#1A1B1E] border  border-[#27282C] cursor-pointer">
              <div className="flex flex-row gap-2">
                <img src="/USDT.png" alt="usd" className="w-[20px] max-[350px]:w-[18px] object-contain rounded-[10px] text-[#8F96A3]" />
                <span className="max-[350px]:text-sm">{offers.offer.priceUSDT}</span>
              </div>
              <span className="max-[350px]:text-sm">USDT</span>
            </button>
          </div>
          <div className="flex flex-row gap-2 justify-center px-4 py-2 max-[350px]:py-1.5 rounded-lg bg-[#1A1B1E] border  border-[#27282C] cursor-pointer">
            <button className="cursor-pointer max-[350px]:text-sm" onClick={() => navigate(-1)}>{t('order.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Order
