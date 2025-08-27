"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Loader2,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import useChatStore from "@/stores/chatStore";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";
import {
  startVoiceCall,
  stopVoiceCall,
  toggleMute,
  getVapiInstance,
} from "@/lib/vapi";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    messages,
    isLoading,
    isMuted,
    currentTranscript,
    addMessage,
    setLoading,
    setMuted,
    setCurrentTranscript,
    setError,
  } = useChatStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Vapi listeners
  useEffect(() => {
    getVapiInstance({
      onMessage: (message: Record<string, unknown>) => {
        const messageType = message.type as string;
        const transcript = message.transcript as
          | { isFinal?: boolean; role?: string; text?: string }
          | undefined;

        if (messageType === "transcript") {
          // Handle interim transcripts for live feedback
          if (
            !transcript?.isFinal &&
            transcript?.role === "user" &&
            transcript?.text
          ) {
            setCurrentTranscript(transcript.text);
          }

          // Handle final transcripts
          if (transcript?.isFinal) {
            if (transcript.role === "user" && transcript.text) {
              addMessage({
                role: "user",
                content: transcript.text,
                isVoice: true,
              });
              setCurrentTranscript("");
            } else if (transcript.role === "assistant" && transcript.text) {
              addMessage({
                role: "assistant",
                content: transcript.text,
                isVoice: true,
              });
            }
          }
        }
      },
      onCallEnd: () => {
        setIsVoiceCallActive(false);
        toast({
          title: "Voice call ended",
          description:
            "You can continue chatting via text or start a new voice call.",
        });
      },
      onError: (error: Error) => {
        console.error("Vapi error:", error);
        setError("Voice connection error. Please try again.");
        setIsVoiceCallActive(false);
      },
    });
  }, [addMessage, setCurrentTranscript, setError, toast]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    addMessage({
      role: "user",
      content: userMessage,
      isVoice: false,
    });

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant response
      addMessage({
        role: "assistant",
        content: data.response,
        isVoice: false,
        contexts: data.contexts,
      });
    } catch (error) {
      console.error("Chat error:", error);
      setError("Failed to send message. Please try again.");
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceToggle = async () => {
    try {
      if (isVoiceCallActive) {
        await stopVoiceCall();
        setIsVoiceCallActive(false);
        toast({
          title: "Voice call ended",
          description: "Voice assistant has been disconnected.",
        });
      } else {
        await startVoiceCall();
        setIsVoiceCallActive(true);
        toast({
          title: "Voice call started",
          description: "You can now speak with the assistant.",
        });
      }
    } catch (error) {
      console.error("Voice toggle error:", error);
      toast({
        title: "Error",
        description: "Failed to toggle voice call. Please check your settings.",
        variant: "destructive",
      });
    }
  };

  const handleMuteToggle = () => {
    if (isVoiceCallActive) {
      toggleMute();
      setMuted(!isMuted);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Card className="w-full h-full flex flex-col bg-white shadow-xl">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Aven Support Assistant</h2>
            <p className="text-sm opacity-90">Available 24/7 to help you</p>
          </div>
          <div className="flex items-center gap-2">
            {isVoiceCallActive && (
              <Button
                onClick={handleMuteToggle}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                {isMuted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              onClick={handleVoiceToggle}
              variant="secondary"
              size="sm"
              className={`${
                isVoiceCallActive
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/20 hover:bg-white/30"
              } text-white`}
            >
              {isVoiceCallActive ? (
                <>
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Call
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Start Voice
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Voice Status Indicator */}
        <AnimatePresence>
          {isVoiceCallActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center gap-2"
            >
              <div className="flex items-center gap-1">
                <Volume2 className="h-3 w-3 animate-pulse" />
                <span className="text-xs">Voice Active</span>
              </div>
              {currentTranscript && (
                <span className="text-xs italic opacity-75">
                  &ldquo;{currentTranscript}&rdquo;
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Assistant is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <SuggestedQuestions onSelectQuestion={handleSuggestedQuestion} />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message or click the phone to speak..."
            disabled={isLoading || isVoiceCallActive}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || isVoiceCallActive}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-2 text-center">
          By using this service, you agree to Aven&apos;s terms and privacy
          policy.
        </p>
      </div>
    </Card>
  );
}
