'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ChatMessage } from '@/lib/types';

interface ChatContextValue {
  messages: ChatMessage[];
  isOpen: boolean;
  hasEverOpened: boolean;
  isStreaming: boolean;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateLastAssistantMessage: (content: string, done?: boolean) => void;
  setIsOpen: (open: boolean) => void;
  openChat: () => void;   // opens AND marks hasEverOpened = true
  closeChat: () => void;  // hides panel but preserves history
  setIsStreaming: (v: boolean) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpenState] = useState(false);
  const [hasEverOpened, setHasEverOpened] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const idCounterRef = useRef(0);

  const genId = () => {
    idCounterRef.current += 1;
    return `msg-${Date.now()}-${idCounterRef.current}`;
  };

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const full: ChatMessage = { ...msg, id: genId(), timestamp: Date.now() };
    setMessages((prev) => [...prev, full]);
    return full;
  }, []);

  const updateLastAssistantMessage = useCallback((content: string, done = false) => {
    setMessages((prev) => {
      const copy = [...prev];
      // Find last assistant message and update it
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === 'assistant') {
          copy[i] = { ...copy[i], content };
          break;
        }
      }
      return copy;
    });
    if (done) setIsStreaming(false);
  }, []);

  const openChat = useCallback(() => {
    setIsOpenState(true);
    setHasEverOpened(true);
  }, []);

  const closeChat = useCallback(() => {
    // Close panel WITHOUT clearing history
    setIsOpenState(false);
  }, []);

  const setIsOpen = useCallback((open: boolean) => {
    if (open) {
      openChat();
    } else {
      closeChat();
    }
  }, [openChat, closeChat]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider value={{
      messages,
      isOpen,
      hasEverOpened,
      isStreaming,
      addMessage,
      updateLastAssistantMessage,
      setIsOpen,
      openChat,
      closeChat,
      setIsStreaming,
      clearMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
