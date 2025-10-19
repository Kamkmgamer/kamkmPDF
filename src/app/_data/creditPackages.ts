/**
 * Credit Package Definitions
 * For users who have exceeded their subscription limits
 */

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
  savings?: string;
}

export const creditPackages: CreditPackage[] = [
  {
    id: "credits_50",
    name: "Starter Pack",
    credits: 50,
    price: 1,
    pricePerCredit: 0.02,
  },
  {
    id: "credits_500",
    name: "Value Pack",
    credits: 500,
    price: 5,
    pricePerCredit: 0.01,
    popular: true,
    savings: "50% off",
  },
  {
    id: "credits_1000",
    name: "Power Pack",
    credits: 1000,
    price: 10,
    pricePerCredit: 0.01,
    savings: "50% off",
  },
];
