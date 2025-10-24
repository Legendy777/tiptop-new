import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store"
import {useEffect, useState} from "react";
import type {IOrder} from "../store/features/ordersSlice.ts";
import {fetchOrders} from "../store/features/ordersSlice.ts";
import { format } from 'date-fns';
import {useTranslation} from "react-i18next";

const Orders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const formattedOrders = orders.map(order => ({
    ...order,
    createdAt: format(new Date(order.createdAt), 'yyyy-MM-dd'),
  }));
  const [filteredOrders, setFilteredOrders] = useState<IOrder[]>(formattedOrders);
  const [filteredOrdersStatus, setFilteredOrdersStatus] = useState<'all' | 'completed' | 'pending' | 'process' | 'canceled'>();

  const {t} = useTranslation();

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    const formatted = orders.map(order => ({
      ...order,
      createdAt: format(new Date(order.createdAt), 'yyyy-MM-dd'),
    }));
    setFilteredOrders(formatted);
    setFilteredOrdersStatus('all');
  }, [orders]);

  if (!orders) return null;

  const allOrders = formattedOrders;
  const completedOrders = formattedOrders.filter(order => order.status === 'completed');
  const pendingOrders = formattedOrders.filter(order => order.status === 'pending');
  const processOrders = formattedOrders.filter(order => order.status === 'process');
  const canceledOrders = formattedOrders.filter(order => order.status === 'canceled');

  const ordersCount = allOrders.length;
  const completedOrdersCount = completedOrders.length;
  const pendingOrdersCount = pendingOrders.length;
  const processOrdersCount = processOrders.length;
  const canceledOrdersCount = canceledOrders.length;

  const toggleToAllOrders = () => {
    setFilteredOrders(allOrders);
    setFilteredOrdersStatus('all');
  }

  const toggleToCompletedOrders = () => {
    setFilteredOrders(completedOrders);
    setFilteredOrdersStatus('completed');
  }

  const toggleToPendingOrders = () => {
    setFilteredOrders(pendingOrders);
    setFilteredOrdersStatus('pending');
  }

  const toggleToProcessOrders = () => {
    setFilteredOrders(processOrders);
    setFilteredOrdersStatus('process');
  }

  const toggleToCanceledOrders = () => {
    setFilteredOrders(canceledOrders);
    setFilteredOrdersStatus('canceled');
  }

  return (
    <div className="flex flex-col max-w-[28rem] w-full h-full overflow-hidden py-3 px-2">
      <div className="flex flex-col gap-2 w-full h-fill">
        <div onClick={toggleToAllOrders} style={filteredOrdersStatus === 'all' ? {border: "2px solid white"} : {}} className="flex items-center justify-center gap-1 bg-[#1E1F23] rounded-[10px] py-2 border  border-[#27282C]">
          <div className="flex items-center gap-2">
            <img className="w-[20px]" src="/Purchases.gif" alt="orders" />
            <span className="text-[16px] text-[#979EAA]">{t('orders.count')}:</span>
          </div>
          <span className="text-[16px] text-[#979EAA]">{ordersCount}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full h-fill">
          <div onClick={toggleToPendingOrders} style={filteredOrdersStatus === 'pending' ? {border: "2px solid white"} : {}} className="flex flex-col justify-center items-center bg-[#1E1F23] rounded-[10px] py-2 border  border-[#27282C]">
            <div className="flex items-center justify-center gap-2">
              <img className="w-[20px]" src="/Incorrect.gif" alt="incorrect" />
              <span className="text-white font-bold">{pendingOrdersCount}</span>
            </div>
            <div>
              <span className="text-[#979EAA]">{t('orders.pending')}</span>
            </div>
          </div>
          <div onClick={toggleToProcessOrders} style={filteredOrdersStatus === 'process' ? {border: "2px solid white"} : {}} className="flex flex-col justify-center items-center bg-[#1E1F23] rounded-[10px] py-2 border  border-[#27282C]">
            <div className="flex items-center justify-center gap-2">
              <img className="w-[20px]" src="/Process.gif" alt="process" />
              <span className="text-white font-bold">{processOrdersCount}</span>
            </div>
            <div>
              <span className="text-[#979EAA]">{t('orders.process')}</span>
            </div>
          </div>
          <div onClick={toggleToCanceledOrders} style={filteredOrdersStatus === 'canceled' ? {border: "2px solid white"} : {}} className="flex flex-col justify-center items-center bg-[#1E1F23] rounded-[10px] py-2 border  border-[#27282C]">
            <div className="flex items-center justify-center gap-2">
              <img className="w-[20px]" src="/Canceled.gif" alt="canceled" />
              <span className="text-white font-bold">{canceledOrdersCount}</span>
            </div>
            <div>
              <span className="text-[#979EAA]">{t('orders.canceled')}</span>
            </div>
          </div>
          <div onClick={toggleToCompletedOrders} style={filteredOrdersStatus === 'completed' ? {border: "2px solid white"} : {}} className="flex flex-col justify-center items-center bg-[#1E1F23] rounded-[10px] py-2 border  border-[#27282C]">
            <div className="flex items-center justify-center gap-2">
              <img className="w-[20px]" src="/Completed.gif" alt="completed" />
              <span className="text-white font-bold">{completedOrdersCount}</span>
            </div>
            <div>
              <span className="text-[#979EAA]">{t('orders.completed')}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full h-fill mt-2 overflow-auto">
        {filteredOrders.map(order => (
          <div key={order._id} className="flex flex-col items-start bg-[#1E1F23] rounded-[10px] px-2 py-2 border  border-[#27282C]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <img className="w-[18px]" src="/Number.gif" alt="order number" />
                <span className="text-[#979EAA] text-[16px]">{t('orders.number')}:</span>
              </div>
              <span className="text-white text-[18px]">{order._id}</span> 
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <img className="w-[18px]" src="/Date.gif" alt="order date" />
                <span className="text-[#979EAA] text-[16px]">{t('orders.date')}:</span>
              </div>
              <span className="text-white text-[18px]">{order.createdAt}</span> 
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <img className="w-[18px]" src="/Game.gif" alt="game" />
                <span className="text-[#979EAA] text-[16px]">{t('orders.game')}:</span>
              </div>
              <span className="text-white text-[18px]">{order.gameTitle}</span> 
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <img className="w-[18px]" src="/Status.gif" alt="order status" />
                <span className="text-[#979EAA] text-[16px]">{t('orders.status')}:</span>
              </div>
              <span className="text-white text-[18px]">{order.status === 'completed' ? t('orders.completedOrder') : order.status === 'pending' ? t('orders.pendingOrder') : order.status === 'process' ? t('orders.processOrder') : t('orders.canceledOrder')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders;
