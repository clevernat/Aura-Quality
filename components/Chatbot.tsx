import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AQIData } from '../types';
import { ChatBubbleIcon, CloseIcon, SendIcon } from './icons';

interface ChatbotProps {
    aqiData: AQIData | null;
}

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const Chatbot: React.FC<ChatbotProps> = ({ aqiData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
        setMessages([
            { sender: 'bot', text: "Hello! I'm your air quality assistant. Ask me anything about the current conditions or health recommendations." }
        ]);
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading || !ai) return;

        const newMessages: Message[] = [...messages, { sender: 'user', text: trimmedInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const context = aqiData
                ? `The user is currently viewing data for ${aqiData.locationName}. Current AQI is ${aqiData.current.aqi} (${aqiData.current.category}) with ${aqiData.current.primaryPollutant} as the primary pollutant.`
                : "The user has not selected a location yet.";

            const fullPrompt = `${context}\n\nUser's question: "${trimmedInput}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    systemInstruction: `You are a friendly and helpful Air Quality and Health Assistant for an app called "Aura Quality". Your goal is to answer user questions about air quality, its health impacts, and provide relevant advice. Use the provided context about the user's current view, but use your search tool to find real-time, global air quality data when asked for information not present in the context. Keep your answers concise, helpful, and easy to understand. Do not mention you are an AI model.`,
                    tools: [{googleSearch: {}}],
                },
            });

            setMessages([...newMessages, { sender: 'bot', text: response.text }]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages([...newMessages, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!process.env.API_KEY) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none z-50"
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? <CloseIcon className="w-7 h-7" /> : <ChatBubbleIcon className="w-7 h-7" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-auto max-h-[70vh] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col z-50">
                    <header className="bg-gray-700 p-4 rounded-t-xl flex justify-between items-center">
                        <h3 className="font-bold text-lg">Aura Quality Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close chat window">
                             <CloseIcon className="w-6 h-6" />
                        </button>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-md lg:max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-600 text-white rounded-bl-none'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-600 rounded-2xl rounded-bl-none">
                                        <TypingIndicator />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                        <div className="relative">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="w-full bg-gray-700 text-white rounded-full py-2 pl-4 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                disabled={isLoading}
                                aria-label="Chat input"
                            />
                            <button type="submit" disabled={isLoading} className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-300 disabled:opacity-50" aria-label="Send message">
                                <SendIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;
