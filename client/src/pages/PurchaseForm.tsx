import React, { useState, useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch} from "../store/store.ts";
import {fetchOrder} from "../store/features/ordersSlice.ts";
import {createOrderDetails, fetchOrderDetails, updateOrderDetails} from "../store/features/orderDetailsSlice.ts";
import {useTranslation} from "react-i18next";

type BindingType = "id" | "gameAccount" | "google" | "facebook" | "other" | "choice";

interface FormData {
    orderId: string | null;
    userInGameId: string | null;
    nickname: string | null;
    login: string | null;
    password: string | null;
    entry: string | null;
    code: string | null;
    server: string | null;
}

const isEntryType = (v: BindingType): v is Exclude<BindingType, "other" | "choice"> =>
    v !== "other" && v !== "choice";

const PurchaseForm: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const {t} = useTranslation();

    const order = useSelector((state: any) => state.orders.orderForm);
    const orderDetails = useSelector((state: any) => state.ordersDetails.orderDetails);

    const [bindingType, setBindingType] = useState<BindingType>("choice");
    const [formData, setFormData] = useState<FormData>({
        orderId: orderId || null,
        userInGameId: null,
        nickname: null,
        login: null,
        password: null,
        entry: null,
        code: null,
        server: null,
    });
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrder(orderId));
            dispatch(fetchOrderDetails(orderId));
        }

        if (order && orderDetails) {
            if (order.status === "pending") {
                setFormData((prev) => ({
                    ...prev,
                    orderId: orderId || null,
                }));
            }

            if (order.status === "invalid") {
                const oldFormData: FormData = {
                    orderId: order._id || null,
                    userInGameId: orderDetails.userInGameId || null,
                    nickname: orderDetails.nickname || null,
                    login: orderDetails.login || null,
                    password: orderDetails.password || null,
                    entry: orderDetails.entry || null,
                    code: orderDetails.code || null,
                    server: orderDetails.server || null,
                }

                setFormData(oldFormData);
            }
        }
    }, [orderId]);

    if (!orderId) {
        return <div className="p-4 text-red-500 font-bold">Order ID not found</div>;
    }

    if (!order) {
        return <div className="p-4 text-red-500 font-bold">Order not found</div>;
    }

    if (order.status == "pending" || order.status == "invalid") { /* empty */ } else {
        return <div className="p-4 text-red-500 font-bold">Order status is {order.status}</div>;
    }

    const handleBindingTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as BindingType;
        setBindingType(value);

        setFormData((prev) => ({
            ...prev,
            entry: isEntryType(value) ? value : formData.entry,
            // Clear other fields that might not be relevant after binding change
            userInGameId: value === "id" ? prev.userInGameId : null,
            login: ["gameAccount", "google", "facebook", "other"].includes(value)
                ? prev.login
                : null,
            password: ["gameAccount", "google", "facebook", "other"].includes(value)
                ? prev.password
                : null,
            nickname: prev.nickname, // keep nickname, it's always needed except for choice
        }));

        setErrors({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value.trim() === "" ? null : value,
        }));
    };

    const validate = () => {
        const newErrors: Record<string, boolean> = {};
        if (bindingType === "choice") return newErrors;

        const requiredFieldsMap: Record<BindingType, (keyof FormData)[]> = {
            id: ["userInGameId", "nickname"],
            gameAccount: ["login", "password", "nickname"],
            google: ["login", "password", "nickname"],
            facebook: ["login", "password", "nickname"],
            other: ["entry", "login", "password", "nickname"],
            choice: [],
        };

        const requiredFields = requiredFieldsMap[bindingType] || [];

        requiredFields.forEach((field) => {
            if (!formData[field]) {
                newErrors[field] = true;
            }
        });

        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (bindingType === "choice") {
            // Do not submit if choice is selected
            return;
        }

        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            if (order.status === "pending") {
                dispatch(createOrderDetails(formData));
            }

            if (order.status === "invalid") {
                dispatch(updateOrderDetails(formData));
            }

            navigate("/chat")
        }
    };

    const inputClass =
        "w-full p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 text-gray-200 border-gray-400 bg-[#1A1B1E]";
    const errorClass = "text-red-500 text-sm mb-2";

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-[28rem] w-full mx-2 my-3 p-4 space-y-4 bg-[#1A1B1E] rounded-xl shadow-md"
        >
            <select
                value={bindingType}
                onChange={handleBindingTypeChange}
                className={inputClass}
            >
                <option value="choice">{t('purchaseForm.typeTitle')}</option>
                <option value="id">ID</option>
                <option value="gameAccount">{t('purchaseForm.gameAccount')}</option>
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
                <option value="other">{t('purchaseForm.other')}</option>
            </select>

            {bindingType === "id" && (
                <>
                    <div>
                        <input
                            name="userInGameId"
                            placeholder="User In-Game ID"
                            value={formData.userInGameId ?? ""}
                            onChange={handleInputChange}
                            className={inputClass}
                        />
                        {errors.userInGameId && (
                            <div className={errorClass}>User In-Game ID is required</div>
                        )}
                    </div>
                    <div>
                        <input
                            name="nickname"
                            placeholder="Nickname"
                            value={formData.nickname ?? ""}
                            onChange={handleInputChange}
                            className={inputClass}
                        />
                        {errors.nickname && (
                            <div className={errorClass}>Nickname is required</div>
                        )}
                    </div>
                </>
            )}

            {["gameAccount", "google", "facebook", "other"].includes(bindingType) && (
                <>
                    {bindingType === "other" && (
                        <div>
                            <input
                                name="entry"
                                placeholder={t('purchaseForm.entry')}
                                value={formData.entry ?? ""}
                                onChange={handleInputChange}
                                className={inputClass}
                            />
                            {errors.entry && <div className={errorClass}>Entry is required</div>}
                        </div>
                    )}
                    <div>
                        <input
                            name="login"
                            placeholder={t('purchaseForm.login')}
                            value={formData.login ?? ""}
                            onChange={handleInputChange}
                            className={inputClass}
                        />
                        {errors.login && <div className={errorClass}>Login is required</div>}
                    </div>
                    <div>
                        <input
                            name="password"
                            placeholder={t('purchaseForm.password')}
                            value={formData.password ?? ""}
                            onChange={handleInputChange}
                            className={inputClass}
                        />
                        {errors.password && (
                            <div className={errorClass}>Password is required</div>
                        )}
                    </div>
                    <div>
                        <input
                            name="nickname"
                            placeholder={t('purchaseForm.nickname')}
                            value={formData.nickname ?? ""}
                            onChange={handleInputChange}
                            className={inputClass}
                        />
                        {errors.nickname && (
                            <div className={errorClass}>Nickname is required</div>
                        )}
                    </div>
                </>
            )}

            <div>
                <input
                    name="code"
                    placeholder={t('purchaseForm.code')}
                    value={formData.code ?? ""}
                    onChange={handleInputChange}
                    className={inputClass}
                />
            </div>
            <div>
                <input
                    name="server"
                    placeholder={t('purchaseForm.server')}
                    value={formData.server ?? ""}
                    onChange={handleInputChange}
                    className={inputClass}
                />
            </div>

            <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
                {order.status === "pending" ? t('purchaseForm.btn') : null}
                {order.status === "invalid" ? t('purchaseForm.btnUpdate') : null}
            </button>
        </form>
    );
};

export default PurchaseForm;
