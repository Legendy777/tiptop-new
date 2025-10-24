import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import {useDispatch} from "react-redux";
import type {AppDispatch} from "../store/store.ts";
import ChatsPanel from "../components/ChatsPanel.tsx";
import OrdersPanel from "../components/OrdersPanel.tsx";
import {updateOrderStatus} from "../store/features/ordersSlice.ts";
import NewGameForm from "../components/NewGameForm.tsx";
import NewOfferForm from "../components/NewOfferForm.tsx";

interface Message {
    sender: number;
    content: string;
    timestamp: string;
}

interface IOrder {
    _id: number;
    paymentId: number;
    userId: number;
    offerId: number;
    orderDetailsId: number | null;
    status: 'pending' | 'process' | 'completed' | 'canceled' | 'invalid';
    currency: 'USDT' | 'RUB';
    createdAt?: Date;
    updatedAt?: Date;
}

let socket: Socket;

export default function AdminPanel() {
    const dispatch = useDispatch<AppDispatch>();
    const [chatMap, setChatMap] = useState<Record<number, Message[]>>({});
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [chatVisible, setChatVisible] = useState(false);
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<"chats" | "users" | "orders" | "game" | "offer">("chats");
    const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
    const [orders, setOrders] = useState<IOrder[]>([]);

    useEffect(() => {
        socket = io(import.meta.env.VITE_API_URL);
        socket.emit("register_admin");

        socket.on("chat_history", (allChats: Record<number, Message[]>) => {
            setChatMap(allChats);
            setUnreadCounts({});
        });

        socket.on("orders_history", (orders: IOrder[]) => {
            setOrders(orders);
        });

        socket.on("new_message", ({ sender, content, timestamp, userId }) => {
            setChatMap(prev => ({
                ...prev,
                [userId]: [...(prev[userId] || []), { sender, content, timestamp }],
            }));
            setUnreadCounts(prev => {
                if (selectedUserId === userId) return { ...prev, [userId]: 0 };
                return { ...prev, [userId]: (prev[userId] || 0) + 1 };
            });
        });

        socket.on("unread_counts", (counts: Record<number, number>) => {
            setUnreadCounts(counts);
        });

        socket.on("new-order", (orders: IOrder[]) => {
            setOrders([]);
            setOrders(orders);
        });

        return () => {
            socket.disconnect();
        };
    }, []); // ✅ Only runs once when admin logs in

    useEffect(() => {
        if (selectedUserId === null) return;
        setUnreadCounts((prev) => ({ ...prev, [selectedUserId]: 0 }));
    }, [selectedUserId]);

    function handleReply() {
        if (!input.trim() || selectedUserId === null) return;
        socket.emit("admin_reply", { userId: selectedUserId, content: input });

        setChatMap((prev) => ({
            ...prev,
            [selectedUserId]: [
                ...(prev[selectedUserId] || []),
                { sender: 0, content: input, timestamp: new Date().toISOString() },
            ],
        }));

        setInput("");
    }

    const handleSelectedUserId = (id: number | null) => {
        if (id === selectedUserId) return;
        setSelectedUserId(id);
        if (id !== null) {
            socket.emit('admin_select_chat', selectedUserId);
            setChatVisible(true);
        }
    }

    const handleOrderStatusChange = async (orderId: number, status: 'pending' | 'process' | 'completed' | 'canceled' | 'invalid') => {
        const data: { orderId: string, status: string } = {
            orderId: orderId.toString(),
            status,
        }

        await dispatch(updateOrderStatus(data));
        socket.emit('admin_order_status_changed', { orderId: orderId.toString() });
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <div className="flex border-b border-gray-700 overflow-x-auto">
                {["Chats", "Users", "Orders", "Game", "Offer"].map((tab) => (
                    <button
                        key={tab}
                        className={`px-6 py-3 cursor-pointer ${
                            activeTab === tab.toLowerCase()
                                ? "border-b-2 border-blue-500 text-blue-400"
                                : "text-gray-400"
                        } hover:text-blue-300`}
                        onClick={() => setActiveTab(tab.toLowerCase() as any)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {activeTab === "chats" && (
                    <ChatsPanel
                        chatMap={chatMap}
                        selectedUserId={selectedUserId}
                        chatVisible={chatVisible}
                        setChatVisible={setChatVisible}
                        setSelectedUserId={setSelectedUserId}
                        handleSelectedUserId={handleSelectedUserId}
                        input={input}
                        setInput={setInput}
                        handleReply={handleReply}
                        unreadCounts={unreadCounts}
                    />
                )}
                {activeTab === "users" && (
                    <div className="flex-1 p-6 overflow-auto">
                        <h2 className="text-xl font-bold mb-4">User Management (coming soon)</h2>
                    </div>
                )}
                {activeTab === "orders" && (
                    <OrdersPanel orders={orders} handleOrderStatusChange={handleOrderStatusChange} />
                )}
                {activeTab === "game" && (
                    <NewGameForm />
                )}
                {activeTab === "offer" && (
                    <NewOfferForm />
                )}
            </div>
        </div>
    );
}
