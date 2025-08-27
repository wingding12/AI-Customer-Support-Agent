import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  contexts?: string[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isVoiceActive: boolean;
  isMuted: boolean;
  error: string | null;
  currentTranscript: string;

  // Actions
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateMessage: (id: string, content: string) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setVoiceActive: (active: boolean) => void;
  setMuted: (muted: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentTranscript: (transcript: string) => void;
}

const useChatStore = create<ChatState>(set => ({
  messages: [
    {
      id: uuidv4(),
      role: "assistant",
      content:
        "Hello! I'm your Aven support assistant. I can help you with questions about our credit card, balance transfers, rewards program, account management, and more. How can I assist you today?",
      timestamp: new Date(),
      isVoice: false,
    },
  ],
  isLoading: false,
  isVoiceActive: false,
  isMuted: false,
  error: null,
  currentTranscript: "",

  addMessage: message =>
    set(state => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: uuidv4(),
          timestamp: new Date(),
        },
      ],
    })),

  updateMessage: (id, content) =>
    set(state => ({
      messages: state.messages.map(msg =>
        msg.id === id ? { ...msg, content } : msg
      ),
    })),

  deleteMessage: id =>
    set(state => ({
      messages: state.messages.filter(msg => msg.id !== id),
    })),

  clearMessages: () =>
    set(() => ({
      messages: [
        {
          id: uuidv4(),
          role: "assistant",
          content:
            "Hello! I'm your Aven support assistant. How can I help you today?",
          timestamp: new Date(),
          isVoice: false,
        },
      ],
      error: null,
      currentTranscript: "",
    })),

  setLoading: loading => set(() => ({ isLoading: loading })),

  setVoiceActive: active => set(() => ({ isVoiceActive: active })),

  setMuted: muted => set(() => ({ isMuted: muted })),

  setError: error => set(() => ({ error })),

  setCurrentTranscript: transcript =>
    set(() => ({ currentTranscript: transcript })),
}));

export default useChatStore;
