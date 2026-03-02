'use client';

import { io } from "socket.io-client";
import { use, useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/features/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { notFound } from 'next/navigation';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEventStore } from "@/lib/store";
import { useSession } from "next-auth/react";

interface ChatMessage {
    author: string;
    content: string;
    timestamp: Date;
    isCurrentUser: boolean;
    avatarUrl?: string;
}

interface SystemMessage {
    content: string;
    timestamp: Date;
    type: 'join' | 'leave';
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { events, fetchEvents } = useEventStore();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<(ChatMessage | SystemMessage)[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<ReturnType<typeof io> | null>(null);
    const usernameRef = useRef<string>('');
    const avatarUrlRef = useRef<string>('');

    // Fetch events if store is empty
    useEffect(() => {
        async function init() {
            if (events.length === 0) {
                await fetchEvents();
            }
            setIsLoading(false);
        }
        init();
    }, [events.length, fetchEvents]);

    // Fetch previous messages from database
    useEffect(() => {
        if (!id) return;

        const fetchPreviousMessages = async () => {
            try {
                const httpUrl = process.env.NEXT_PUBLIC_HTTP_URL || 'http://localhost:8081';
                const response = await fetch(`${httpUrl}/messages?event=${id}`);
                if (!response.ok) {
                    console.error('Failed to fetch previous messages:', response.statusText);
                    return;
                }
                const dbMessages = await response.json();

                // Convert database messages to ChatMessage format
                const formattedMessages: ChatMessage[] = dbMessages.map((msg: any) => ({
                    author: msg.sender,
                    content: msg.message,
                    timestamp: new Date(msg.timestamp),
                    isCurrentUser: msg.sender === session?.user?.name,
                    avatarUrl: msg.avatar_url || undefined,
                }));

                setMessages(formattedMessages);
            } catch (error) {
                console.error('Error fetching previous messages:', error);
            }
        };

        fetchPreviousMessages();
    }, [id, session?.user?.name]);

    const event = events.find(e => e.id === id);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim() || !event) {
            return;
        }

        const newMessage: ChatMessage = {
            author: 'You',
            content: inputValue,
            timestamp: new Date(),
            isCurrentUser: true,
            avatarUrl: session?.user?.image || undefined,
        };

        const socket = socketRef.current;
        if (socket?.connected) {
            socket.emit('message', {
                room: event.id,
                username: usernameRef.current,
                message: inputValue,
                avatarUrl: avatarUrlRef.current,
            });
            setMessages((prev) => [...prev, newMessage]);
            setInputValue('');
        }

    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const isSystemMessage = (msg: ChatMessage | SystemMessage): msg is SystemMessage => {
        return 'type' in msg;
    };

    useEffect(() => {
        if (!event) return;

        const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:8080");
        socketRef.current = socket;
        console.log('Connecting to WebSocket server...');

        socket.on('connect', () => {
            console.log('Connected to WebSocket server.');
            const room = event.id;
            const username = session?.user?.name || `client-${Math.floor(Math.random() * 1000) + 1}`;
            const avatarUrl = session?.user?.image || '';
            usernameRef.current = username;
            avatarUrlRef.current = avatarUrl;
            socket.emit('join', { room, username, avatarUrl });
        });

        socket.on('join', msg => {
            const foreignUser = msg.username;
            setMessages(prev => [...prev, {
                content: `${foreignUser} joined the room`,
                timestamp: new Date(),
                type: 'join',
            }]);
        });

        socket.on('leave', msg => {
            const foreignUser = msg.username;
            setMessages(prev => [...prev, {
                content: `${foreignUser} left the room`,
                timestamp: new Date(),
                type: 'leave',
            }]);
        });

        socket.on('message', msg => {
            const foreignUser = msg.username;
            const { message, avatarUrl } = msg;
            setMessages(prev => [...prev, {
                author: foreignUser,
                content: message,
                timestamp: new Date(),
                isCurrentUser: false,
                avatarUrl: avatarUrl || undefined,
            }]);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            usernameRef.current = '';
            avatarUrlRef.current = '';
        };
    }, [event?.id, session?.user?.name, session?.user?.image]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!event) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href={`/events/${id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold">{event.title}</h1>
                        <p className="text-xs text-muted-foreground">{messages.reduce((accumulator, currentValue) => {
                            return accumulator + (isSystemMessage(currentValue) ? 0 : 1);
                        }, 0)} messages</p>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 py-6">
                <div className="space-y-4">
                    {messages.map((message, index) => {
                        if (isSystemMessage(message)) {
                            return (
                                <div key={`sys-${index}`} className="flex justify-center py-2">
                                    <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full">
                                        {message.content}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={`msg-${index}`}
                                className={`flex gap-3 ${message.isCurrentUser ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    {message.avatarUrl ? (
                                        <AvatarImage src={message.avatarUrl} alt={message.author} />
                                    ) : null}
                                    <AvatarFallback className="text-xs">
                                        {message.author.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div
                                    className={`flex flex-col max-w-xs ${
                                        message.isCurrentUser ? 'items-end' : 'items-start'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-foreground">
                                            {message.author}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                    <div
                                        className={`px-3 py-2 rounded-lg ${
                                            message.isCurrentUser
                                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                                : 'bg-muted text-muted-foreground rounded-bl-none'
                                        }`}
                                    >
                                        <p className="text-sm break-words">{message.content}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
                <div className="max-w-4xl mx-auto px-4 py-4 flex gap-3">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        size="sm"
                        className="h-10 w-10 p-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
