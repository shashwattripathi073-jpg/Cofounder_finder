'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import socket from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, MessageSquare, Search, Check, CheckCheck,
    Briefcase, ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function MessagesPage() {
    const { user: currentUser } = useAuth();
    const [chats, setChats] = useState([]);
    const [connections, setConnections] = useState([]); // accepted connections to start new chats
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const scrollRef = useRef(null);

    // Load inbox + accepted connections
    useEffect(() => {
        const init = async () => {
            try {
                const [inboxRes, sentRes, receivedRes] = await Promise.all([
                    api.get('/chats/inbox'),
                    api.get('/requests/sent'),
                    api.get('/requests/received'),
                ]);

                setChats(inboxRes.data || []);

                // Build connections list from accepted requests (both sent & received)
                const connectedUsers = [];
                for (const r of sentRes.data) {
                    if (r.status === 'accepted' && r.receiverId) {
                        connectedUsers.push({ _id: r.receiverId, ...r.receiverInfo });
                    }
                }
                // Get full user objects for connections
                const connRes = await api.get('/users');
                const allUsers = connRes.data;

                const acceptedSentIds = sentRes.data.filter(r => r.status === 'accepted').map(r => r.receiverId?.toString());
                const acceptedReceivedIds = receivedRes.data.filter(r => r.status === 'accepted').map(r => r.senderId?._id?.toString());
                const allConnectedIds = [...new Set([...acceptedSentIds, ...acceptedReceivedIds])];

                const connectedUserObjects = allUsers.filter(u => allConnectedIds.includes(u._id.toString()));
                setConnections(connectedUserObjects);
            } catch (err) {
                toast.error('Failed to load messages');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Load chat history when a user is selected
    useEffect(() => {
        if (!selectedChat) return;
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/chats/${selectedChat._id}`);
                setMessages(data);
            } catch (err) {
                toast.error('Failed to load chat history');
            }
        };
        fetchMessages();
    }, [selectedChat]);

    // Real-time incoming messages
    useEffect(() => {
        const handleNewMessage = (msg) => {
            if (selectedChat && msg.senderId === selectedChat._id) {
                setMessages(prev => [...prev, { ...msg, _id: Date.now() }]);
            }
            // Update inbox preview
            setChats(prev => {
                const exists = prev.find(c => c.otherUser?._id === msg.senderId);
                if (exists) {
                    return prev.map(c =>
                        c.otherUser?._id === msg.senderId
                            ? { ...c, lastMessage: { ...msg, content: msg.content } }
                            : c
                    );
                }
                return prev;
            });
        };

        socket.on('receiveMessage', handleNewMessage);
        return () => socket.off('receiveMessage', handleNewMessage);
    }, [selectedChat]);

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const openChat = (user) => {
        setSelectedChat(user);
        setMessages([]);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || sending) return;
        setSending(true);

        const content = newMessage.trim();
        setNewMessage('');

        // Optimistic UI
        const optimistic = {
            _id: `opt_${Date.now()}`,
            senderId: currentUser.id,
            receiverId: selectedChat._id,
            content,
            createdAt: new Date().toISOString(),
            optimistic: true,
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            const { data } = await api.post('/chats/send', {
                receiverId: selectedChat._id,
                content,
            });

            // Replace optimistic with real
            setMessages(prev => prev.map(m => m._id === optimistic._id ? data : m));

            // Emit real-time
            socket.emit('sendMessage', {
                senderId: currentUser.id,
                receiverId: selectedChat._id,
                content,
            });

            // Update inbox
            setChats(prev => {
                const exists = prev.find(c => c.otherUser?._id === selectedChat._id);
                if (exists) {
                    return prev.map(c =>
                        c.otherUser?._id === selectedChat._id ? { ...c, lastMessage: data } : c
                    );
                }
                return [{ otherUser: selectedChat, lastMessage: data }, ...prev];
            });
        } catch (err) {
            toast.error('Failed to send message');
            setMessages(prev => prev.filter(m => m._id !== optimistic._id));
        } finally {
            setSending(false);
        }
    };

    // Merge inbox chats + connections into sidebar list (connections without chats come first)
    const inboxUserIds = chats.map(c => c.otherUser?._id?.toString());
    const connectionsNotInInbox = connections.filter(c => !inboxUserIds.includes(c._id?.toString()));

    const sidebarItems = [
        ...connectionsNotInInbox.map(u => ({ otherUser: u, lastMessage: null })),
        ...chats,
    ].filter(item => {
        if (!search) return true;
        const name = `${item.otherUser?.firstName} ${item.otherUser?.lastName}`.toLowerCase();
        return name.includes(search.toLowerCase());
    });

    if (!currentUser) return null;

    return (
        <div className="flex h-[82vh] glass-card overflow-hidden">

            {/* ─── Sidebar ─── */}
            <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] border-r border-white/10 flex-col shrink-0`}>

                {/* Sidebar header */}
                <div className="p-6 border-b border-white/10 bg-slate-900/40">
                    <h2 className="text-2xl font-extrabold mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full bg-slate-900/60 border border-white/5 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-10">
                            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                    ) : sidebarItems.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <MessageSquare className="mx-auto text-slate-600 mb-4" size={32} />
                            <p className="text-slate-500 text-sm font-medium">No connections yet.</p>
                            <p className="text-slate-600 text-xs mt-1">Accept requests to start chatting.</p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-1">
                            {sidebarItems.map((item) => {
                                const u = item.otherUser;
                                if (!u) return null;
                                const isActive = selectedChat?._id === u._id;
                                return (
                                    <button
                                        key={u._id}
                                        onClick={() => openChat(u)}
                                        className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-white/5 text-slate-300 hover:text-white'}`}
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center font-bold text-white shrink-0 text-lg">
                                            {u.firstName?.[0]}{u.lastName?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-sm truncate">{u.firstName} {u.lastName}</span>
                                                {item.lastMessage?.createdAt && (
                                                    <span className="text-[10px] opacity-50 ml-2 shrink-0">
                                                        {formatDistanceToNow(new Date(item.lastMessage.createdAt), { addSuffix: false })} ago
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                                                {item.lastMessage?.content || `Start a conversation with ${u.firstName}`}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Chat Area ─── */}
            <div className={`${!selectedChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-900/20`}>
                {selectedChat ? (
                    <>
                        {/* Chat header */}
                        <div className="p-4 md:p-5 border-b border-white/10 bg-slate-950/40 flex items-center gap-4">
                            <button
                                className="md:hidden p-2 hover:bg-white/5 rounded-lg text-slate-400"
                                onClick={() => setSelectedChat(null)}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center font-bold text-white text-lg shrink-0">
                                {selectedChat.firstName?.[0]}{selectedChat.lastName?.[0]}
                            </div>
                            <div>
                                <h3 className="font-bold">{selectedChat.firstName} {selectedChat.lastName}</h3>
                                <p className="text-indigo-400 text-xs font-semibold flex items-center gap-1">
                                    <Briefcase size={10} /> {selectedChat.role || 'Co-founder'}
                                </p>
                            </div>
                            <div className="ml-auto flex items-center gap-2 text-xs text-green-400 font-bold">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Online
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <AnimatePresence initial={false}>
                                {messages.length === 0 && (
                                    <div className="text-center text-slate-500 py-10 text-sm">
                                        Say hello to {selectedChat.firstName}! 👋
                                    </div>
                                )}
                                {messages.map((msg, i) => {
                                    const isMe = msg.senderId === currentUser.id || msg.senderId?._id === currentUser.id;
                                    return (
                                        <motion.div
                                            key={msg._id || i}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[72%] px-5 py-3.5 rounded-3xl shadow-md text-sm leading-relaxed
                                                ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-tr-lg'
                                                    : 'bg-slate-800 text-slate-200 rounded-tl-lg'
                                                }
                                                ${msg.optimistic ? 'opacity-60' : ''}`}
                                            >
                                                <p>{msg.content}</p>
                                                <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end' : ''}`}>
                                                    <span className="text-[10px] opacity-50">
                                                        {msg.createdAt
                                                            ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : 'sending...'}
                                                    </span>
                                                    {isMe && !msg.optimistic && <CheckCheck size={12} className="opacity-50" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-slate-950/40">
                            <form onSubmit={sendMessage} className="flex gap-3 items-center">
                                <input
                                    type="text"
                                    placeholder={`Message ${selectedChat.firstName}...`}
                                    className="flex-1 bg-slate-900/80 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-white text-sm"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="gradient-btn p-4 rounded-2xl shadow-xl shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-400 mb-2">
                            <MessageSquare size={44} />
                        </div>
                        <h2 className="text-3xl font-extrabold">Your Chats</h2>
                        <p className="text-slate-400 max-w-sm">Select a connection from the left to start chatting. All conversations are real-time.</p>
                        <div className="flex flex-wrap gap-4 pt-4 text-xs font-bold uppercase tracking-widest text-slate-600">
                            <span className="flex items-center gap-2"><Check size={14} className="text-green-500" /> End-to-end</span>
                            <span className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Real-time</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
