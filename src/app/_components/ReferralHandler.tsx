"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";

/**
 * Component to handle referral codes from URL parameters
 * Place this in your layout or main app component
 */
export default function ReferralHandler() {
  const searchParams = useSearchParams();
  const applyReferralMutation = api.referrals.applyReferralCode.useMutation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!searchParams) return;
    
    const referralCode = searchParams.get("ref");
    
    if (referralCode) {
      // Store in localStorage to apply after user signs up
      localStorage.setItem("pendingReferralCode", referralCode);
      
      // Try to apply immediately if user is already logged in
      applyReferralMutation.mutate(
        { referralCode },
        {
          onSuccess: (data) => {
            console.log("Referral code applied:", data.message);
            localStorage.removeItem("pendingReferralCode");
          },
          onError: (error) => {
            // If user is not logged in yet, the code will be applied after signup
            console.log("Referral code stored for later:", error.message);
          },
        }
      );
    }
  }, [searchParams]);

  // Try to apply pending referral code on component mount (after user logs in)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const pendingCode = localStorage.getItem("pendingReferralCode");
    
    if (pendingCode && !searchParams?.get("ref")) {
      applyReferralMutation.mutate(
        { referralCode: pendingCode },
        {
          onSuccess: (data) => {
            console.log("Pending referral code applied:", data.message);
            localStorage.removeItem("pendingReferralCode");
          },
          onError: (error) => {
            console.error("Failed to apply pending referral code:", error.message);
          },
        }
      );
    }
  }, []);

  return null; // This component doesn't render anything
}
