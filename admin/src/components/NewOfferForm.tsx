import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../store/store.ts";
import {fetchGames} from "../store/features/gamesSlice.ts";
import {addOffer} from "../store/features/offersSlice.ts";

const NewOfferForm: React.FC = () => {
    const games = useSelector((state: RootState) => state.games.games);
    const dispatch = useDispatch<AppDispatch>();

    const [gameId, setGameId] = useState<number>(games[0]?._id || 0);
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [priceRUB, setPriceRUB] = useState<number | undefined>(undefined);
    const [priceUSDT, setPriceUSDT] = useState<number | undefined>(undefined);
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        dispatch(fetchGames());
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gameId) return;

        const offer = {
            gameId,
            title,
            imageUrl,
            priceRUB,
            priceUSDT,
            isEnabled,
        }

        await dispatch(addOffer(offer));

        setTitle('');
        setImageUrl('');
        setPriceRUB(0);
        setPriceUSDT(0);
        setIsEnabled(true);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2 max-w-md p-4 rounded">
            <select
                value={gameId}
                onChange={(e) => setGameId(Number(e.target.value))}
                required
                className="w-full p-2 border"
            >
                {games.map((game) => (
                    <option key={game._id} value={game._id} className="text-black">
                        {game.title}
                    </option>
                ))}
            </select>
            <input
                type="text"
                placeholder="Title"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border"
            />
            <input
                type="url"
                placeholder="Image URL"
                value={imageUrl}
                required
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2 border"
            />
            <input
                type="number"
                placeholder="Price RUB"
                value={priceRUB}
                min={0}
                required
                onChange={(e) => setPriceRUB(Number(e.target.value))}
                className="w-full p-2 border"
            />
            <input
                type="number"
                placeholder="Price USDT"
                value={priceUSDT}
                min={0}
                required
                onChange={(e) => setPriceUSDT(Number(e.target.value))}
                className="w-full p-2 border"
            />
            <label className="inline-flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => setIsEnabled(!isEnabled)}
                />
                <span>Is Enabled</span>
            </label>
            <br/>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Add Offer
            </button>
        </form>
    );
};

export default NewOfferForm;
