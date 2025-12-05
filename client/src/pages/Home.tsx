import { useSelector, useDispatch } from 'react-redux'
import type { AppDispatch, RootState } from '../store/store'
import { fetchGames } from '../store/features/gamesSlice.ts';
import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MarqueeTitle from "../components/MarqueeTitle.tsx";

const Home = () => {
  const { loading, games, error } = useSelector((state: RootState) => state.games);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { cardsPerRow } = useOutletContext<{ cardsPerRow: number }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch products from API or perform any other side effects here
    dispatch(fetchGames());
  }, [dispatch]);

  if (loading) return <p className='text-white pt-1'>{t('home.loading')}</p>;
  if (error) return <p className='text-white pt-1'>{t('home.error', { error: error })}</p>;
  if (!games || games.length === 0) return <p className='text-white pt-1'>{t('home.noProducts')}</p>;

  const gap: number = 8; // Gap between cards
  const cardWidth: string = `calc(${100 / cardsPerRow}% - ${(gap * (cardsPerRow - 1)) / cardsPerRow}px)`; // Adjust the card width based on cardsPerRow

  return (
    <div className='flex max-w-[28rem] gap-[8px] flex-wrap content-start justify-start px-2 py-3'>
      {games.length === 0 && <p>No products available</p>}
      {games.map((game, index) => (
        <div
          onClick={() => navigate(`/offers/${game.id}`)}
          key={index}
          className="flex flex-col content-stretch justify-stretch h-fit rounded-[10px] cursor-pointer border-2  border-[#27282C]"
          style={{ width: cardWidth }}
        >
          <img src={game.imageUrl} alt={game.title} className="h-fit aspect-square object-center object-cover rounded-tl-[8px] rounded-tr-[8px]" />
          <div className="overflow-hidden w-full bg-[#1A1B1E] py-0.5 px-0.5 rounded-bl-lg rounded-br-lg">
            <h2 className="text-sm pb-0.5 max-[350px]:pb-0 pl-1 pr-0.5 font-normal max-[350px]:text-[13px] text-[#fff] whitespace-nowrap overflow-hidden">
              <MarqueeTitle text={game.title} />
            </h2>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Home
