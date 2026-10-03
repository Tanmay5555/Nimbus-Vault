'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2, Bot, User, Sparkles } from 'lucide-react';
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

    const suggestions = [
        "How do I share a file with password?",
        "What is my storage limit?",
        "How to restore deleted files?"
    ];

    const sendMessageText = async (textToSend) => {
        if (!textToSend.trim() || isLoading) return;

        const userMessage = { id: Date.now().toString(), role: 'user', content: textToSend };
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

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

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

    const handleSendMessage = (e) => {
        e.preventDefault();
        sendMessageText(input);
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white z-50 animate-in fade-in zoom-in duration-300 ring-4 ring-orange-500/20"
                title="Open Nimbus AI Assistant"
            >
                <MessageCircle className="h-7 w-7" />
            </Button>
        );
    }

    return (
        <div className={cn(
            "fixed z-50 transition-all duration-300 ease-in-out shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
            isMinimized
                ? "bottom-6 right-6 w-72 h-14"
                : "bottom-6 right-6 w-[350px] sm:w-[400px] h-[520px] max-h-[82vh]"
        )}>
            {/* Header */}
            <div
                className="bg-gradient-to-r from-orange-500 to-amber-600 p-4 flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Bot className="w-5 h-5 text-orange-100" />
                    <span>Nimbus AI Assistant</span>
                    <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full font-semibold">Pro</span>
                </div>
                <div className="flex items-center gap-1 text-white/80">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title={isMinimized ? "Maximize" : "Minimize"}
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minimize2 className="w-4 h-4 text-white" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title="Close"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>

            {/* Content (Hidden when minimized) */}
            {!isMinimized && (
                <div className="flex flex-col h-[calc(100%-56px)]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/60">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-500 dark:text-slate-400 mt-6 space-y-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg">
                                    <Bot className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Welcome to Nimbus Assistant!</h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Ask me anything about your files, cloud storage limits, or sharing settings.</p>
                                </div>

                                <div className="pt-2 space-y-2">
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                        <Sparkles className="w-3 h-3 text-orange-500" /> Suggested Prompts
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                        {suggestions.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => sendMessageText(prompt)}
                                                className="text-left text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:border-orange-500 dark:hover:border-orange-500 transition-colors shadow-xs"
                                            >
                                                💡 {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.map(m => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex gap-3 max-w-[88%]",
                                    m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs text-xs font-bold",
                                    m.role === 'user' ? "bg-orange-500 text-white" : "bg-blue-600 text-white"
                                )}>
                                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-xs sm:text-sm shadow-xs leading-relaxed whitespace-pre-wrap",
                                    m.role === 'user'
                                        ? "bg-orange-500 text-white rounded-tr-none"
                                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-800"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                            <Input
                                className="pr-10 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs sm:text-sm rounded-xl focus:border-orange-500"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask Nimbus AI..."
                                ref={inputRef}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1 top-1 h-8 w-8 hover:bg-orange-500 hover:text-white text-slate-400 bg-transparent shadow-none rounded-lg transition-colors"
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </form>
                        <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-1.5">
                            Nimbus AI v2.0 • Secure Cloud Intelligence
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

