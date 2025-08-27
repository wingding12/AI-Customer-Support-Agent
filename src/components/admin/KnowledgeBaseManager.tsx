"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [ingestStats, setIngestStats] = useState<{
    docs: number;
    chunks: number;
    upserted: number;
  } | null>(null);

  // Options
  const [limit, setLimit] = useState<number>(15);
  const [chunkMaxLength, setChunkMaxLength] = useState<number>(900);
  const [batchSize, setBatchSize] = useState<number>(100);
  const [clearOld, setClearOld] = useState<boolean>(false);
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

  const handleScrapeAndIngest = async () => {
    setIsScraping(true);
    setScrapeStatus("idle");
    setIngestStats(null);

    try {
      const response = await fetch("/api/knowledge/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          limit,
          clearOld,
          chunkMaxLength,
          batchSize,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to scrape & ingest");
      }

      setScrapeStatus("success");
      setIngestStats(data.stats);
      setVectorCount((prev) =>
        typeof prev === "number"
          ? prev + (data.stats?.upserted || 0)
          : data.stats?.upserted || null
      );
      toast({
        title: "Scrape & Ingest complete",
        description: `Docs: ${data.stats.docs}, Chunks: ${data.stats.chunks}, Upserted: ${data.stats.upserted}`,
      });
    } catch (error) {
      console.error("Scrape & Ingest error:", error);
      setScrapeStatus("error");
      toast({
        title: "Error",
        description:
          "Failed to scrape & ingest. Ensure EXA, OpenAI, and Pinecone keys are set.",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
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

          {/* Scrape & Ingest Controls */}
          <div className="mt-6 border-t pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="limit">Max pages</Label>
                <Input
                  id="limit"
                  type="number"
                  min={1}
                  max={50}
                  value={limit}
                  onChange={(e) =>
                    setLimit(parseInt(e.target.value || "0", 10) || 0)
                  }
                />
              </div>
              <div>
                <Label htmlFor="chunk">Chunk length</Label>
                <Input
                  id="chunk"
                  type="number"
                  min={300}
                  max={2000}
                  value={chunkMaxLength}
                  onChange={(e) =>
                    setChunkMaxLength(parseInt(e.target.value || "0", 10) || 0)
                  }
                />
              </div>
              <div>
                <Label htmlFor="batch">Batch size</Label>
                <Input
                  id="batch"
                  type="number"
                  min={10}
                  max={500}
                  value={batchSize}
                  onChange={(e) =>
                    setBatchSize(parseInt(e.target.value || "0", 10) || 0)
                  }
                />
              </div>
              <div className="flex items-end gap-2">
                <input
                  id="clearOld"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={clearOld}
                  onChange={(e) => setClearOld(e.target.checked)}
                />
                <Label htmlFor="clearOld">Clear existing vectors</Label>
              </div>
            </div>

            <Button
              onClick={handleScrapeAndIngest}
              disabled={isScraping}
              className="w-full"
            >
              {isScraping ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scraping & Ingesting...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Scrape & Ingest Latest Aven Info
                </>
              )}
            </Button>

            {scrapeStatus === "success" && ingestStats && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-900">
                Ingest complete — Docs: <strong>{ingestStats.docs}</strong>,
                Chunks: <strong>{ingestStats.chunks}</strong>, Upserted:{" "}
                <strong>{ingestStats.upserted}</strong>
              </div>
            )}
            {scrapeStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-900">
                Scrape & ingest failed. Check API keys and try again.
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Ensure OpenAI, Pinecone, and EXA API keys are configured</p>
            <p>
              • Initialize loads local seed data; Scrape & Ingest pulls live
              pages
            </p>
            <p>• The process may take several minutes depending on limits</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
