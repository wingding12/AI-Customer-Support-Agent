"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, CreditCard, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const suggestions = [
  {
    icon: CreditCard,
    text: "How does the Aven credit card work?",
    color: "text-blue-600",
  },
  {
    icon: TrendingUp,
    text: "What are the balance transfer terms?",
    color: "text-green-600",
  },
  {
    icon: Shield,
    text: "How do I apply for an Aven card?",
    color: "text-purple-600",
  },
  {
    icon: HelpCircle,
    text: "What rewards does Aven offer?",
    color: "text-orange-600",
  },
];

export default function SuggestedQuestions({
  onSelectQuestion,
}: SuggestedQuestionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 font-medium">Popular questions:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start text-left hover:bg-gray-50 p-3 h-auto"
                onClick={() => onSelectQuestion(suggestion.text)}
              >
                <Icon
                  className={`h-4 w-4 mr-2 flex-shrink-0 ${suggestion.color}`}
                />
                <span className="text-sm">{suggestion.text}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
