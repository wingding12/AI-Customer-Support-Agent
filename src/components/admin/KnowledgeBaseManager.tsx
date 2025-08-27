"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import {
  Database,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function KnowledgeBaseManager() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [vectorCount, setVectorCount] = useState<number | null>(null);
  const { toast } = useToast();

  const handleInitializeKnowledgeBase = async () => {
    setIsInitializing(true);
    setInitStatus("idle");

    try {
      const response = await fetch("/api/knowledge/init", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setInitStatus("success");
        setVectorCount(data.count);
        toast({
          title: "Success",
          description: `Knowledge base initialized with ${data.count} vectors.`,
        });
      } else {
        throw new Error(data.error || "Failed to initialize");
      }
    } catch (error) {
      console.error("Initialization error:", error);
      setInitStatus("error");
      toast({
        title: "Error",
        description:
          "Failed to initialize knowledge base. Check your API keys.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Knowledge Base Manager
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Initialize or update the Aven knowledge base in Pinecone
            </p>
          </div>
          {initStatus === "success" && (
            <CheckCircle className="h-6 w-6 text-green-600" />
          )}
          {initStatus === "error" && (
            <AlertCircle className="h-6 w-6 text-red-600" />
          )}
        </div>

        <div className="space-y-3">
          {vectorCount !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>{vectorCount}</strong> knowledge vectors loaded in
                Pinecone
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleInitializeKnowledgeBase}
              disabled={isInitializing}
              className="flex-1"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Initialize Knowledge Base
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Ensure your OpenAI and Pinecone API keys are configured</p>
            <p>• This will create embeddings for all Aven knowledge data</p>
            <p>• The process may take a few minutes to complete</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
