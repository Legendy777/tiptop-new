import { useEffect, useRef, useState } from "react";
import io, { Socket } from 'socket.io-client';
import { useSelector } from "react-redux";
import type { RootState } from "../store/store.ts";
import type { DefaultEventsMap } from "socket.io";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {SendIcon} from "lucide-react";

export default function Chat() {
    const [messages, setMessages] = useState([{ sender: -1, content: "Hello, how can I help you?" }]);
    const [input, setInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // ✅ состояние

    const userId = useSelector((state: RootState) => state.user.user?._id);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(import.meta.env.VITE_API_URL);
        }

        const socket = socketRef.current;
        if (!userId) return;

        socket.emit('register_client', userId);
        const handleHistory = (msgs: any[]) => setMessages(msgs);
        const handleNewMessage = (msg: any) => setMessages(prev => [...prev, msg]);

        socket.on('chat_history', handleHistory);
        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('chat_history', handleHistory);
            socket.off('new_message', handleNewMessage);
        };
    }, [userId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim() || !socketRef.current) return;

        socketRef.current.emit('send_message', { sender: 1, userId, content: input });
        setMessages(prev => [...prev, { sender: 1, content: input }]);
        setInput('');
    };

    const onEmojiClick = (emojiData: any) => {
        setInput(prev => prev + emojiData.emoji);
    };

    return (
        <div className='flex max-w-[28rem] w-full gap-[8px] flex-wrap content-start justify-start'>
            <div className="w-full h-full border border-[#27282C] rounded-lg flex flex-col">
                <div className="flex-1 p-2 overflow-y-auto rounded-lg space-y-2 whitespace-pre-wrap">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`p-2 rounded-lg border border-[#27282C] max-w-xs ${
                                msg.sender === 1 ? "ml-auto bg-[#1A1B1E] text-white" : "mr-auto bg-gray-200 text-black"
                            }`}
                        >
                            {msg.content}
                            {msg.sender === -1 && msg.content.includes('📌 Status: PENDING') &&
                                <button onClick={() => navigate(`/purchase-form/${msg.content.match(/Order ID:\s*(\d+)/)?.[1]}`)} className="w-full h-[40px] text-sm cursor-pointer mt-2 bg-[#1A1B1E] rounded-lg text-white">Enter order details</button>
                            }
                            {msg.sender === -1 && msg.content.includes('📌 Status: INVALID') &&
                                <button onClick={() => navigate(`/purchase-form/${msg.content.match(/Order ID:\s*(\d+)/)?.[1]}`)} className="w-full h-[40px] text-sm cursor-pointer mt-2 bg-[#1A1B1E] rounded-lg text-white">Edit order details</button>
                            }
                            {msg.sender === -1 && msg.content.includes("leave a review") && msg.content.match(/№(\d+)/)?.[1] &&
                                <button onClick={() => navigate(`/review/${msg.content.match(/№(\d+)/)![1]}`)} className="w-full h-[40px] text-sm mt-2 bg-[#1A1B1E] cursor-pointer rounded-lg text-white">Leave a review</button>
                            }
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-3 max-[350px]:p-2 rounded-b-lg flex flex-col border-t border-[#27282C]">
                    <div className="p-2.5 max-[350px]:p-1 rounded-lg flex flex-col bg-[#1a1b1e]">
                        {showEmojiPicker && (
                            <div className="w-full mb-2 flex justify-start">
                                <div className="max-w-[250px] w-full rounded-xl shadow-lg border border-[#27282C] bg-[#1A1B1E] overflow-hidden">
                                    <EmojiPicker
                                        theme={Theme.DARK}
                                        onEmojiClick={onEmojiClick}
                                        width="100%"
                                        height={window.innerWidth < 350 ? 200 : 250}
                                        searchDisabled={true}
                                        previewConfig={{ showPreview: false }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex items-center">
                            <input
                                type="text"
                                className="flex-1 text-white max-[350px]:text-sm outline-none rounded-lg px-3 max-[350px]:px-1.5 py-2 mr-2 focus:outline-none"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder={t('chat.enter')}
                            />
                            <button
                                onClick={() => setShowEmojiPicker(prev => !prev)}
                                className="text-white text-xl mr-2"
                            >
                                😊
                            </button>
                            <button
                                onClick={sendMessage}
                                className="h-full px-4 max-[350px]:px-3 py-2 rounded-lg border border-[#27282C] cursor-pointer"
                            >
                                <SendIcon className="w-5 h-5 max-[350px]:h-4 max-[350px]:w-4 text-[#8F96A3]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}