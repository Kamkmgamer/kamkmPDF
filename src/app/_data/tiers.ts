import { Sparkles, Users, Zap, Star, Crown, Rocket, type LucideIcon } from "lucide-react";

export type TierFeature = { text: string; included: boolean };
export type Tier = {
  id: "starter" | "classic" | "professional" | "pro_plus" | "business" | "enterprise";
  name: string;
  icon: LucideIcon; // lucide icon component
  price: number;
  priceYearly: number;
  description: string;
  color: string; // tailwind gradient e.g. 'from-blue-400 to-blue-600'
  features: TierFeature[];
  cta: string;
  popular: boolean;
  publiclyVisible: boolean; // Whether to show on pricing page
};

export const tiers: Tier[] = [
  {
    id: "starter",
    name: "Free",
    icon: Sparkles,
    price: 0,
    priceYearly: 0,
    description: "Perfect for testing and exploring",
    color: "from-gray-400 to-gray-600",
    publiclyVisible: true,
    features: [
      { text: "3 PDFs per month", included: true },
      { text: "50 MB storage (30 days)", included: true },
      { text: "Basic templates (3)", included: true },
      { text: "Free AI models", included: true },
      { text: "Watermark on PDFs", included: false },
      { text: "2-5 minute processing", included: false },
      { text: "Community support", included: true },
      { text: "Premium templates", included: false },
      { text: "API access", included: false },
      { text: "Team collaboration", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "classic",
    name: "Classic",
    icon: Star,
    price: 5,
    priceYearly: 50,
    description: "Exclusive offer for valued users",
    color: "from-purple-400 to-purple-600",
    publiclyVisible: false, // Hidden - only via email campaigns
    features: [
      { text: "50 PDFs per month", included: true },
      { text: "500 MB permanent storage", included: true },
      { text: "10+ premium templates", included: true },
      { text: "Standard AI models", included: true },
      { text: "No watermarks", included: true },
      { text: "<90 second processing", included: true },
      { text: "Version history (5 versions)", included: true },
      { text: "Email support (48-72h)", included: true },
      { text: "API access", included: false },
      { text: "Team collaboration", included: false },
    ],
    cta: "Upgrade to Classic",
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    icon: Zap,
    price: 15,
    priceYearly: 150,
    description: "For freelancers and professionals",
    color: "from-blue-400 to-blue-600",
    publiclyVisible: true,
    features: [
      { text: "5,000 PDFs per month", included: true },
      { text: "2 GB permanent storage", included: true },
      { text: "20+ premium templates", included: true },
      { text: "Premium AI models (GPT-4 class)", included: true },
      { text: "No watermarks", included: true },
      { text: "<60 second processing", included: true },
      { text: "Version history (10 versions)", included: true },
      { text: "Email support (24-48h)", included: true },
      { text: "API access", included: false },
      { text: "Team collaboration", included: false },
    ],
    cta: "Upgrade to Pro",
    popular: false,
  },
  {
    id: "pro_plus",
    name: "Pro+",
    icon: Rocket,
    price: 30,
    priceYearly: 300,
    description: "Best for power users",
    color: "from-amber-400 via-yellow-500 to-orange-500",
    publiclyVisible: true,
    features: [
      { text: "10,000 PDFs per month (2x Pro)", included: true },
      { text: "5 GB permanent storage", included: true },
      { text: "Unlimited templates + early access", included: true },
      { text: "Premium AI models + priority queue", included: true },
      { text: "AI watermark removal", included: true },
      { text: "<45 second processing", included: true },
      { text: "Version history (25 versions)", included: true },
      { text: "Priority support (12h response)", included: true },
      { text: "API access (full)", included: true },
      { text: "Bulk generation tools", included: true },
    ],
    cta: "Upgrade to Pro+",
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    icon: Users,
    price: 79,
    priceYearly: 790,
    description: "For teams and small businesses",
    color: "from-sky-400 to-sky-600",
    publiclyVisible: true,
    features: [
      { text: "50,000 PDFs per month (pooled)", included: true },
      { text: "50 GB shared storage", included: true },
      { text: "Unlimited templates", included: true },
      { text: "Premium AI models + priority", included: true },
      { text: "Custom branding", included: true },
      { text: "<30 second processing", included: true },
      { text: "Version history (50 versions)", included: true },
      { text: "Priority support (live chat)", included: true },
      { text: "API access (beta)", included: true },
      { text: "Team collaboration (5 seats)", included: true },
    ],
    cta: "Upgrade to Business",
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    price: 500,
    priceYearly: 5000,
    description: "Custom solutions for large organizations",
    color: "from-purple-500 to-pink-600",
    publiclyVisible: true,
    features: [
      { text: "Unlimited PDFs", included: true },
      { text: "Unlimited storage", included: true },
      { text: "Custom templates", included: true },
      { text: "Best AI models + custom training", included: true },
      { text: "White-label options", included: true },
      { text: "<15 second processing", included: true },
      { text: "Unlimited version history", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Full API access + webhooks", included: true },
      { text: "Unlimited team seats + SSO", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];
