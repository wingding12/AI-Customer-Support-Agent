"use client";

import { useState, useEffect } from "react";
import ChatInterface from "@/components/chat/ChatInterface";
import KnowledgeBaseManager from "@/components/admin/KnowledgeBaseManager";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  MessageSquare,
  Settings,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Check for admin mode from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("admin") === "true") {
      setShowAdmin(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">Aven</h1>
                <p className="text-sm opacity-90">Smart Credit Solutions</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 border-blue-100 bg-white/80 backdrop-blur">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    0% APR for 21 Months
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Transfer your balances and save on interest with our
                  industry-leading intro rate.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 border-green-100 bg-white/80 backdrop-blur">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Cashback Rewards</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Earn 3% on groceries, 2% on gas, and 1% on all other purchases
                  with no limits.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 border-purple-100 bg-white/80 backdrop-blur">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg">24/7 Support</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Get help anytime with our AI assistant or call 1-800-AVEN-HLP
                  for human support.
                </p>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <Card className="p-4 bg-gray-50">
              <h4 className="font-semibold mb-3 text-gray-700">Quick Links</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-sm text-blue-600 hover:underline"
                >
                  Apply for Aven Card
                </a>
                <a
                  href="#"
                  className="block text-sm text-blue-600 hover:underline"
                >
                  Check Application Status
                </a>
                <a
                  href="#"
                  className="block text-sm text-blue-600 hover:underline"
                >
                  Balance Transfer Calculator
                </a>
                <a
                  href="#"
                  className="block text-sm text-blue-600 hover:underline"
                >
                  Learn About Rewards
                </a>
              </div>
            </Card>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="h-[700px]"
            >
              <Tabs defaultValue="chat" className="h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chat">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Customer Support
                  </TabsTrigger>
                  {showAdmin && (
                    <TabsTrigger value="admin">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="chat" className="h-[calc(100%-48px)]">
                  <ChatInterface />
                </TabsContent>

                {showAdmin && (
                  <TabsContent value="admin" className="h-[calc(100%-48px)]">
                    <KnowledgeBaseManager />
                  </TabsContent>
                )}
              </Tabs>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-3">Products</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Credit Cards</li>
                <li>Balance Transfers</li>
                <li>Debt Management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Credit Education</li>
                <li>Calculators</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>1-800-AVEN-HLP</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2024 Aven. All rights reserved. | Equal Housing Lender | Member
            FDIC
          </div>
        </div>
      </div>
    </div>
  );
}
