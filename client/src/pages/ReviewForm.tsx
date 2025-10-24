import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { createReview, fetchReviews } from "../store/features/reviewsSlice";
import { fetchOrder } from "../store/features/ordersSlice";
import {useTranslation} from "react-i18next";

const ReviewForm: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const dispatch = useDispatch<AppDispatch>();

    const {t} = useTranslation();

    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const { orderForm, loading: orderLoading, error: orderError } = useSelector((state: RootState) => state.orders);
    const { reviews, loading: reviewsLoading, error: reviewsError } = useSelector((state: RootState) => state.reviews);

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrder(orderId));
            dispatch(fetchReviews());
        }
    }, [dispatch, orderId]);

    if (!orderId) return <div className="p-4 text-red-500 font-bold">Order ID not found</div>;

    if (orderLoading || reviewsLoading) return <div className="p-4 text-white">Loading...</div>;

    if (!orderForm) return <div className="p-4 text-red-500 font-bold">Order not found</div>;

    if (orderError) return <div className="p-4 text-red-500 font-bold">Order not found</div>;

    if (reviewsError) return <div className="p-4 text-red-500 font-bold">Reviews not found</div>;

    // Проверяем, есть ли отзыв на этот заказ
    const alreadyReviewed = reviews.some((review) => review.orderId.toString() === orderId);

    if (alreadyReviewed) {
        return <div className="p-4 text-yellow-400 font-bold">You have already reviewed this order.</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!rating || !comment.trim()) {
            setError("Rating and comment are required.");
            return;
        }

        try {
            await dispatch(
                createReview({
                    orderId,
                    rating,
                    comment,
                })
            ).unwrap();
            setSuccess(true);
            setComment("");
        } catch (err: any) {
            setError(err.message || "Failed to submit review.");
        }
    };

    const inputClass =
        "w-full p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-gray-200 border-gray-400 bg-[#1A1B1E]";

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-[28rem] w-full mx-2 my-3 p-4 space-y-4 bg-[#1A1B1E] rounded-xl shadow-md"
        >
            <div>
                <label className="text-white">{t('reviewForm.rating')} (1-5):</label>
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className={inputClass}
                />
            </div>
            <div>
                <label className="text-white">{t('reviewForm.comment')}:</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={inputClass + " min-h-[100px]"}
                    placeholder={t('reviewForm.placeholder')}
                />
            </div>
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-500">{t('reviewForm.success')}</div>}
            <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
                {t('reviewForm.btn')}
            </button>
        </form>
    );
};

export default ReviewForm;
