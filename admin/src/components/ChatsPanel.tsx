import { useEffect, useRef } from 'react';
import {LucideArrowLeft} from "lucide-react";

interface Message {
    sender: number;
    content: string;
    timestamp: string;
}

const ChatsPanel = ({
                        chatMap,
                        selectedUserId,
                        chatVisible,
                        setChatVisible,
                        setSelectedUserId,
                        handleSelectedUserId,
                        input,
                        setInput,
                        handleReply,
                        unreadCounts,
                    }: {
    chatMap: Record<number, Message[]>;
    selectedUserId: number | null;
    chatVisible: boolean;
    setChatVisible: (visible: boolean) => void;
    setSelectedUserId: (id: number | null) => void;
    handleSelectedUserId: (id: number | null) => void;
    input: string;
    setInput: (value: string) => void;
    handleReply: () => void;
    unreadCounts: Record<number, number>;
}) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedUserId, chatMap]);

    const closeChat = () => {
        setSelectedUserId(null);
        setChatVisible(false);
    }

    return (
        <>
            <div style={chatVisible ? {display: "none"} : {display: "block"}} className="w-fit border-r border-gray-700 p-4 overflow-y-auto overflow-x-hidden">
                <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Users</h2>
                {Object.keys(chatMap).length === 0 && (
                    <p className="text-gray-400">No active chats</p>
                )}
                {Object.keys(chatMap).map((userId) => {
                    const idNum = Number(userId);
                    const unread = unreadCounts[idNum] || 0;
                    return (
                        <div
                            key={userId}
                            onClick={() => handleSelectedUserId(idNum)}
                            className={`cursor-pointer p-3 rounded mb-1 ${
                                selectedUserId === idNum ? "bg-blue-600" : "hover:bg-gray-700"
                            } flex justify-between items-center`}
                        >
                            <span>User {userId}</span>
                            {unread > 0 && (
                                <span className="bg-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                    {unread}
                  </span>
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={chatVisible ? {display: "flex"} : {display: "none"}} className="w-screen flex flex-col p-4">
                {selectedUserId !== null ? (
                    <>
                        <button onClick={() => closeChat()} className="w-[40px] py-1 rounded-lg mb-2 flex justify-center bg-blue-600 text-white transition cursor-pointer">
                            <LucideArrowLeft />
                        </button>
                        <div className="w-full overflow-y-auto mb-4 space-y-3 bg-gray-800 p-4 rounded">
                            {chatMap[selectedUserId]?.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded max-w-md break-words ${
                                        msg.sender === 0
                                            ? "ml-auto bg-blue-600 text-white"
                                            : "mr-auto bg-gray-700 text-gray-200"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                className="flex-1 border border-gray-600 bg-gray-700 px-4 py-2 rounded-l text-white focus:outline-none"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                                placeholder="Reply to user..."
                                autoFocus
                            />
                            <button
                                onClick={handleReply}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-r transition"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-400">Select a user to start chatting</p>
                )}
            </div>
        </>
    );
}

export default ChatsPanel;