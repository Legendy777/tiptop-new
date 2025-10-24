import React from "react";

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

interface OrdersPanelProps {
    orders: IOrder[];
    handleOrderStatusChange: (orderId: number, status: 'pending' | 'process' | 'completed' | 'canceled' | 'invalid') => void;
}

const statusColorMap: Record<IOrder["status"], string> = {
    pending: "text-yellow-400",
    process: "text-blue-400",
    completed: "text-green-400",
    canceled: "text-red-400",
    invalid: "text-gray-400",
};

const OrdersPanel: React.FC<OrdersPanelProps> = ({ orders, handleOrderStatusChange }) => {
    return (
        <div className="flex flex-col w-full p-6">
            <h2 className="text-xl font-bold mb-4">Orders</h2>
            <div className="flex flex-wrap gap-3 justify-start items-start flex-1 space-y-4 overflow-y-auto overflow-x-hidden">
                {orders.map(order => (
                    <div
                        key={order._id}
                        className="w-[250px] bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-2"
                    >
                        <div className="w-full">
                            <div>
                                <div className="text-sm text-gray-400">Order ID:</div>
                                <div className="font-semibold">#{order._id}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">User:</div>
                                <div>User {order.userId}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Offer:</div>
                                <div>Offer {order.offerId}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Status:</div>
                                <div className={`${statusColorMap[order.status]} font-semibold`}>{order.status}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Currency:</div>
                                <div>{order.currency}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Created:</div>
                                <div className="text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div>
                            </div>
                        </div>
                        {
                            order.status === 'process' ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-full flex gap-2">
                                        <button onClick={() => handleOrderStatusChange(order._id, "completed")} className="flex-1 px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 cursor-pointer">
                                            Complete
                                        </button>
                                        <button onClick={() => handleOrderStatusChange(order._id, "canceled")} className="px-4 py-2 bg-red-500 rounded-md hover:bg-red-600 cursor-pointer">
                                            Cancel
                                        </button>
                                    </div>
                                    <button onClick={() => handleOrderStatusChange(order._id, "invalid")} className="w-full px-4 py-2 bg-gray-500 rounded-md hover:bg-gray-600 cursor-pointer">
                                        Invalid
                                    </button>
                                </div>
                            ) : null
                        }
                        {
                            order.status === 'pending' || order.status === 'invalid' ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-full flex gap-2">
                                        <button onClick={() => handleOrderStatusChange(order._id, "canceled")} className="w-full px-4 py-2 bg-red-500 rounded-md hover:bg-red-600 cursor-pointer">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : null
                        }
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersPanel;
