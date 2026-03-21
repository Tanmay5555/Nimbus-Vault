'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2, Bot, User } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isMinimized]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] })
            });

            if (!response.ok) throw new Error('Failed to send message');

            // Create functionality to read the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Add empty assistant message
            const assistantMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;

                setMessages(prev => prev.map(msg =>
                    msg.id === assistantMsgId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                ));
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting right now. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-orange-500 hover:bg-orange-600 text-white z-50 animate-in fade-in zoom-in duration-300"
            >
                <MessageCircle className="h-8 w-8" />
            </Button>
        );
    }

    return (
        <div className={cn(
            "fixed z-50 transition-all duration-300 ease-in-out shadow-2xl rounded-xl overflow-hidden border border-gray-200 bg-white",
            isMinimized
                ? "bottom-6 right-6 w-72 h-14"
                : "bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh]"
        )}>
            {/* Header */}
            <div
                className="bg-orange-500 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2 text-white font-medium">
                    <Bot className="w-5 h-5" />
                    <span>Nimbus Assistant</span>
                </div>
                <div className="flex items-center gap-1 text-white/80">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1 hover:bg-orange-600 rounded-md transition-colors"
                        title={isMinimized ? "Maximize" : "Minimize"}
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-1 hover:bg-orange-600 rounded-md transition-colors"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content (Hidden when minimized) */}
            {!isMinimized && (
                <div className="flex flex-col h-[calc(100%-56px)]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-8 space-y-2">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-400">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <p className="text-sm">Hi! How can I help you today?</p>
                            </div>
                        )}

                        {messages.map(m => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex gap-3 max-w-[85%]",
                                    m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    m.role === 'user' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                                )}>
                                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm shadow-sm",
                                    m.role === 'user'
                                        ? "bg-orange-500 text-white rounded-tr-none"
                                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                            <Input
                                className="pr-10 bg-gray-50 focus:bg-white transition-colors"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                ref={inputRef}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1 top-1 h-8 w-8 hover:bg-orange-100 hover:text-orange-600 text-gray-400 bg-transparent shadow-none"
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </form>
                        <div className="text-[10px] text-center text-gray-300 mt-2">
                            AI can make mistakes. Please verify important info.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
