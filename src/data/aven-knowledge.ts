export interface AvenKnowledge {
  id: string;
  category: string;
  topic: string;
  content: string;
  metadata?: Record<string, string | number | boolean>;
}

export const avenKnowledgeBase: AvenKnowledge[] = [
  // Company Overview
  {
    id: "aven-001",
    category: "company",
    topic: "About Aven",
    content:
      "Aven is a revolutionary fintech company that helps people save money while paying off credit card debt. We provide intelligent credit solutions that empower individuals to take control of their financial future. Founded in 2023, Aven has quickly become a trusted partner for thousands of users looking to reduce their debt burden and improve their financial health.",
  },
  {
    id: "aven-002",
    category: "company",
    topic: "Mission",
    content:
      "Aven's mission is to democratize access to smart financial tools and help millions of Americans escape the cycle of credit card debt. We believe everyone deserves fair and transparent financial services that actually work in their favor, not against them.",
  },
  {
    id: "aven-003",
    category: "company",
    topic: "Values",
    content:
      "Our core values include transparency, customer empowerment, financial inclusion, and innovation. We're committed to providing clear, honest information about all our products and services, with no hidden fees or surprise charges.",
  },

  // Products and Services
  {
    id: "aven-004",
    category: "products",
    topic: "Aven Credit Card",
    content:
      "The Aven Credit Card is designed specifically for people paying off debt. It offers 0% APR on balance transfers for 21 months, no annual fee, and smart spending controls to help you avoid adding new debt while paying off existing balances. The card also provides cashback rewards on essential purchases like groceries and gas.",
  },
  {
    id: "aven-005",
    category: "products",
    topic: "Balance Transfer",
    content:
      "Aven offers one of the longest 0% APR balance transfer periods in the industry - 21 months. There's a one-time balance transfer fee of 3% or $5, whichever is greater. You can transfer balances from multiple cards, up to your approved credit limit. The balance transfer must be completed within 60 days of account opening.",
  },
  {
    id: "aven-006",
    category: "products",
    topic: "Cashback Rewards",
    content:
      "Earn 3% cashback on groceries, 2% on gas and transportation, and 1% on all other purchases. There's no limit to the cashback you can earn, and rewards never expire. Cashback can be redeemed as a statement credit, direct deposit to your bank account, or applied directly to your balance.",
  },
  {
    id: "aven-007",
    category: "products",
    topic: "Debt Management Tools",
    content:
      "Aven provides free debt management tools including a debt payoff calculator, personalized payoff plans, spending insights, and budget tracking. Our AI-powered recommendations help you optimize your payment strategy to save the most on interest and pay off debt faster.",
  },

  // Features and Benefits
  {
    id: "aven-008",
    category: "features",
    topic: "Smart Notifications",
    content:
      "Get intelligent alerts about your spending, payment due dates, and opportunities to save money. Our system learns your patterns and provides personalized insights to help you stay on track with your financial goals.",
  },
  {
    id: "aven-009",
    category: "features",
    topic: "Financial Education",
    content:
      "Access our comprehensive library of financial education resources, including articles, videos, and interactive tools. Topics cover credit score improvement, budgeting basics, debt reduction strategies, and long-term financial planning.",
  },
  {
    id: "aven-010",
    category: "features",
    topic: "Mobile App",
    content:
      "The Aven mobile app is available for iOS and Android. Features include instant balance checks, payment scheduling, spending categorization, virtual card numbers for online shopping, and biometric security. The app has a 4.8-star rating with over 10,000 reviews.",
  },

  // Account Management
  {
    id: "aven-011",
    category: "account",
    topic: "Eligibility Requirements",
    content:
      "To apply for an Aven Credit Card, you must be 18 years or older, have a valid Social Security number, have a US mailing address, and have a credit score of at least 670. We perform a hard credit inquiry during the application process.",
  },
  {
    id: "aven-012",
    category: "account",
    topic: "Application Process",
    content:
      "The application process takes about 5 minutes online. You'll need to provide personal information, employment details, and income verification. Most decisions are instant, though some applications may require additional review within 7-10 business days. Once approved, your card arrives within 7-10 business days.",
  },
  {
    id: "aven-013",
    category: "account",
    topic: "Credit Limits",
    content:
      "Credit limits range from $1,000 to $25,000 based on your creditworthiness and income. You can request a credit limit increase after 6 months of on-time payments. Automatic reviews for credit limit increases occur every 6 months.",
  },
  {
    id: "aven-014",
    category: "account",
    topic: "Payment Options",
    content:
      "Make payments through the mobile app, online portal, automatic payments, phone payments, or mail. We accept payments from checking accounts, savings accounts, and debit cards. Credit card payments from other cards are not accepted. Payments made before 5 PM ET on business days are credited the same day.",
  },

  // Fees and Rates
  {
    id: "aven-015",
    category: "fees",
    topic: "Fee Structure",
    content:
      "No annual fee, no over-limit fees, no foreign transaction fees. Balance transfer fee: 3% or $5 minimum. Cash advance fee: 5% or $10 minimum. Late payment fee: up to $40. Returned payment fee: up to $40.",
  },
  {
    id: "aven-016",
    category: "fees",
    topic: "Interest Rates",
    content:
      "0% intro APR on balance transfers for 21 months, then 14.99% - 24.99% variable APR based on creditworthiness. 0% intro APR on purchases for 12 months, then the same variable APR applies. Cash advance APR: 26.99% variable, applied immediately with no grace period.",
  },

  // Customer Support
  {
    id: "aven-017",
    category: "support",
    topic: "Contact Options",
    content:
      "24/7 phone support at 1-800-AVEN-HLP (1-800-283-6457). Live chat available on website and mobile app from 8 AM to 11 PM ET. Email support at support@aven.com with response within 24 hours. In-app messaging for account-specific questions.",
  },
  {
    id: "aven-018",
    category: "support",
    topic: "Lost or Stolen Card",
    content:
      "Report lost or stolen cards immediately through the app or by calling 1-800-AVEN-HLP. We'll freeze your card instantly and send a replacement via expedited shipping at no charge. You won't be liable for unauthorized charges made after you report the card missing.",
  },
  {
    id: "aven-019",
    category: "support",
    topic: "Dispute Process",
    content:
      "File disputes for unauthorized or incorrect charges through the app or online portal. We'll issue a provisional credit within 2 business days while investigating. Most disputes are resolved within 30 days. You'll receive written confirmation of the resolution.",
  },

  // Security and Privacy
  {
    id: "aven-020",
    category: "security",
    topic: "Security Features",
    content:
      "Bank-level 256-bit encryption, two-factor authentication, biometric login options, real-time fraud monitoring, instant card freeze/unfreeze, virtual card numbers for online shopping, and zero liability protection for unauthorized charges.",
  },
  {
    id: "aven-021",
    category: "security",
    topic: "Privacy Policy",
    content:
      "We never sell your personal information to third parties. Data is used only to provide services, improve products, and comply with legal requirements. You can request your data or deletion at any time. We're compliant with CCPA, GDPR, and all federal privacy regulations.",
  },

  // FAQs
  {
    id: "aven-022",
    category: "faq",
    topic: "How long does balance transfer take?",
    content:
      "Balance transfers typically complete within 5-7 business days, though some may take up to 14 days depending on the issuing bank. Continue making minimum payments on your old card until the transfer is confirmed complete.",
  },
  {
    id: "aven-023",
    category: "faq",
    topic: "Can I transfer multiple balances?",
    content:
      "Yes, you can transfer balances from multiple cards as long as the total doesn't exceed your credit limit. Each transfer is processed separately and may complete at different times.",
  },
  {
    id: "aven-024",
    category: "faq",
    topic: "Does applying hurt my credit score?",
    content:
      "We perform a hard credit inquiry during the application process, which may temporarily lower your credit score by a few points. However, consolidating debt with our card can improve your credit utilization ratio and potentially increase your score over time.",
  },
  {
    id: "aven-025",
    category: "faq",
    topic: "What happens after the intro APR period?",
    content:
      "After the 21-month intro period for balance transfers (or 12 months for purchases), the variable APR of 14.99% - 24.99% applies to any remaining balance. We'll notify you 45 days before the intro period ends.",
  },
  {
    id: "aven-026",
    category: "faq",
    topic: "Can I increase my credit limit?",
    content:
      "You can request a credit limit increase after 6 months of on-time payments through the app or online portal. We also automatically review accounts every 6 months for potential increases. Requests may result in a soft or hard credit inquiry.",
  },
  {
    id: "aven-027",
    category: "faq",
    topic: "Is there a penalty APR?",
    content:
      "No, Aven does not charge penalty APRs. Your rate remains the same even if you miss a payment, though late fees may apply. We believe in helping you succeed, not penalizing you when you're struggling.",
  },

  // Special Programs
  {
    id: "aven-028",
    category: "programs",
    topic: "Financial Hardship Program",
    content:
      "If you're experiencing financial hardship, we offer payment deferrals, reduced interest rates, and modified payment plans. Contact our hardship team at 1-800-AVEN-HLP to discuss options. We're here to help you through difficult times.",
  },
  {
    id: "aven-029",
    category: "programs",
    topic: "Refer a Friend",
    content:
      "Earn $50 for each friend who's approved for an Aven card through your referral link. Your friend also gets a $50 bonus after their first purchase. There's no limit to how many friends you can refer.",
  },
  {
    id: "aven-030",
    category: "programs",
    topic: "Credit Score Monitoring",
    content:
      "Free FICO score updates monthly, credit report monitoring with alerts for changes, personalized tips to improve your score, and credit score simulator to see impact of financial decisions. All included at no extra charge with your Aven card.",
  },
];

// Helper function to search knowledge base
export function searchKnowledge(query: string): AvenKnowledge[] {
  const lowercaseQuery = query.toLowerCase();
  return avenKnowledgeBase.filter(
    item =>
      item.content.toLowerCase().includes(lowercaseQuery) ||
      item.topic.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery)
  );
}

// Get knowledge by category
export function getKnowledgeByCategory(category: string): AvenKnowledge[] {
  return avenKnowledgeBase.filter(item => item.category === category);
}

// Get all categories
export function getCategories(): string[] {
  return [...new Set(avenKnowledgeBase.map(item => item.category))];
}
