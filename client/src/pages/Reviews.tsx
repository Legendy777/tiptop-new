import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store.ts";
import { fetchReviews } from "../store/features/reviewsSlice.ts";
import type{ IReview } from "../store/features/reviewsSlice.ts";
import {useTranslation} from "react-i18next";

export function Reviews() {
    const [sortBy, setSortBy] = useState<"date" | "rating">("date");
    const [reviewsData, setReviewsData] = useState<IReview[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const { reviews, loading } = useSelector((state: RootState) => state.reviews);

    const {t} = useTranslation();

    useEffect(() => {
        dispatch(fetchReviews());
    }, [dispatch]);

    useEffect(() => {
        if (reviews.length > 0) {
            const sorted = [...reviews].sort((a, b) =>
                sortBy === "date"
                    ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    : b.rating - a.rating
            );
            setReviewsData(sorted);
        } else {
            setReviewsData([]);
        }
    }, [reviews, sortBy]);

    const averageRating =
        reviews.length > 0
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
            : "0";

    return (
        <div className="max-w-[28rem] w-full h-full text-white font-sans flex flex-col">
            {/* External Links */}
            <section className="p-3">
                <p className="text-xs text-[#8F96A3] mb-2">
                    {t('reviews.desc')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <a
                        href="https://www.z2u.com/shop/TipTop"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#1a1b1e] rounded border border-[#27282C] flex justify-center items-center h-[50px]"
                    >
                        <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Z2U-c5h7q5XnVVv9ID7Tj8uiJA00ul15qa.png"
                            alt="Z2U"
                            className="h-12 object-contain"
                        />
                    </a>
                    <a
                        href="https://playerok.com/profile/TipTop999/reviews"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#1a1b1e] rounded border border-[#27282C] flex justify-center items-center h-[50px]"
                    >
                        <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/пЛЕЙЕРОК-anUyadlymqmnQiKwGyLNfhyTrApQ0u.png"
                            alt="PlayerOK"
                            className="h-15 object-contain"
                        />
                    </a>
                </div>
            </section>

            {/* Summary */}
            <section className="bg-[#1a1b1e] m-3 max-[350px]:mt-0 max-[350px]:mb-1 rounded p-3 shrink-0 border border-[#27282C]">
                <div>
                    <h2 className="mb-2 text-lg max-[350px]:text-base">{t('reviews.count')}: {reviews.length}</h2>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={20}
                                className="max-[350px]:h-[16px] max-[350px]:w-[16px]"
                                color={star <= Math.round(Number(averageRating)) ? "#fbbf24" : "#27282C"}
                            />
                        ))}
                        <span className="ml-2 text-lg max-[350px]:text-base">{averageRating}</span>
                    </div>
                </div>
                <div className="mt-3 max-[350px]:mt-1 text-right">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "date" | "rating")}
                        className="bg-[#252629] text-[#8F96A3] rounded border border-[#27282C] px-3 py-1 text-sm cursor-pointer"
                    >
                        <option value="date">{t('reviews.byDate')}</option>
                        <option value="rating">{t('reviews.byRating')}</option>
                    </select>
                </div>
            </section>

            {/* Reviews */}
            <main className="flex-grow overflow-y-auto p-3">
                {loading ? (
                    <p>Загрузка отзывов...</p>
                ) : (
                    reviewsData.map((review) => (
                        <article
                            key={review._id}
                            className="bg-[#1a1b1e] rounded p-3 mb-3 border border-[#27282C]"
                        >
                            <header className="flex justify-between mb-2">
                                <strong className="max-[350px]:text-sm">{review.username}</strong>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={16}
                                            color={star <= review.rating ? "#fbbf24" : "#27282C"}
                                        />
                                    ))}
                                </div>
                            </header>
                            <p className="mb-2 max-[350px]:text-sm">{review.comment}</p>
                            <footer className="text-xs text-[#8F96A3]">
                                {new Date(review.createdAt).toLocaleString("ru-RU", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </footer>
                        </article>
                    ))
                )}
            </main>
        </div>
    );
}
