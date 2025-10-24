import React, { useState } from 'react';
import {useDispatch} from "react-redux";
import type {AppDispatch} from "../store/store.ts";
import {addGame} from "../store/features/gamesSlice.ts";

const NewGameForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [gifUrl, setGifUrl] = useState('');
    const [hasDiscount, setHasDiscount] = useState(false);
    const [isActual, setIsActual] = useState(true);
    const [isEnabled, setIsEnabled] = useState(true);
    const [appleStoreUrl, setAppleStoreUrl] = useState('');
    const [googlePlayUrl, setGooglePlayUrl] = useState('');
    const [trailerUrl, setTrailerUrl] = useState('');

    const dispatch = useDispatch<AppDispatch>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const game = {
            title,
            imageUrl,
            gifUrl,
            hasDiscount,
            isActual,
            isEnabled,
            appleStoreUrl,
            googlePlayUrl,
            trailerUrl,
        }

        await dispatch(addGame(game));

        // reset form
        setTitle('');
        setImageUrl('');
        setGifUrl('');
        setHasDiscount(false);
        setIsActual(true);
        setIsEnabled(true);
        setAppleStoreUrl('');
        setGooglePlayUrl('');
        setTrailerUrl('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2 max-w-md p-4 rounded">
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
                type="url"
                placeholder="GIF URL"
                value={gifUrl}
                required
                onChange={(e) => setGifUrl(e.target.value)}
                className="w-full p-2 border"
            />
            <label>
                <input
                    type="checkbox"
                    checked={hasDiscount}
                    onChange={() => setHasDiscount(!hasDiscount)}
                /> Has Discount
                <br/>
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={isActual}
                    onChange={() => setIsActual(!isActual)}
                /> Is Actual
                <br/>
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => setIsEnabled(!isEnabled)}
                /> Is Enabled
                <br/>
            </label>
            <input
                type="url"
                placeholder="Apple Store URL"
                value={appleStoreUrl}
                required
                onChange={(e) => setAppleStoreUrl(e.target.value)}
                className="w-full p-2 border"
            />
            <input
                type="url"
                placeholder="Google Play URL"
                value={googlePlayUrl}
                required
                onChange={(e) => setGooglePlayUrl(e.target.value)}
                className="w-full p-2 border"
            />
            <input
                type="url"
                placeholder="Trailer URL"
                value={trailerUrl}
                required
                onChange={(e) => setTrailerUrl(e.target.value)}
                className="w-full p-2 border"
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Add Game
            </button>
        </form>
    );
};

export default NewGameForm;
