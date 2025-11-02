"use client";

import { SignIn } from "@clerk/nextjs";
import { useTheme } from "~/providers/ThemeProvider";

interface SignInFormProps {
  redirectUrl: string;
}

export default function SignInForm({ redirectUrl }: SignInFormProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <SignIn
      forceRedirectUrl={redirectUrl}
      fallbackRedirectUrl="/dashboard"
      appearance={{
        baseTheme: undefined,
        variables: isDark
          ? {
              // Dark mode - OpenRouter style
              colorPrimary: "rgb(107, 72, 255)",
              colorBackground: "rgb(11, 18, 32)",
              colorInputBackground: "rgb(26, 26, 26)",
              colorInputText: "rgb(255, 255, 255)",
              colorText: "rgb(255, 255, 255)",
              colorTextSecondary: "rgb(229, 231, 235)",
              borderRadius: "0.5rem",
            }
          : {
              // Light mode
              colorPrimary: "rgb(37, 99, 235)",
              colorBackground: "rgb(255, 255, 255)",
              colorInputBackground: "rgb(255, 255, 255)",
              colorInputText: "rgb(15, 23, 42)",
              colorText: "rgb(15, 23, 42)",
              colorTextSecondary: "rgb(71, 85, 105)",
              borderRadius: "0.5rem",
            },
        elements: isDark
          ? {
              // Dark mode - OpenRouter style
              formButtonPrimary:
                "bg-[rgb(107,72,255)] hover:bg-[rgb(123,92,255)] text-white font-semibold shadow-lg border-0",
              card: "bg-[rgb(26,26,26)] border border-[rgb(55,55,55)] shadow-2xl",
              headerTitle: "text-white font-bold text-2xl",
              headerSubtitle: "text-white font-normal",
              formHeaderTitle: "text-white font-bold",
              formHeaderSubtitle: "text-white",
              formFieldLabel: "text-white font-medium",
              socialButtonsBlockButton:
                "border border-[rgb(82,82,82)] bg-[rgb(26,26,26)] hover:bg-[rgb(35,35,35)] hover:border-[rgb(115,115,115)] text-white",
              socialButtonsBlockButtonText: "text-white font-medium",
              formFieldInput:
                "bg-[rgb(26,26,26)] border border-[rgb(82,82,82)] text-white placeholder:text-[rgb(163,163,163)] focus:border-[rgb(115,115,115)]",
              formFieldInputShowPasswordButton: "text-[rgb(163,163,163)] hover:text-white",
              dividerLine: "bg-[rgb(115,115,115)]",
              dividerText: "text-white font-medium",
              footerActionText: "text-[rgb(229,231,235)]",
              footerActionLink:
                "text-[rgb(107,114,255)] hover:text-[rgb(139,145,255)] font-semibold no-underline",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-[rgb(163,163,163)]",
              identityPreviewEditButtonIcon: "text-[rgb(163,163,163)]",
              formFieldSuccessText: "text-green-400",
              formFieldErrorText: "text-red-400",
              formFieldWarningText: "text-yellow-400",
              formFieldHintText: "text-[rgb(163,163,163)]",
              alertText: "text-white",
              badge: "bg-[rgb(255,124,0)] text-white font-semibold",
              badgeSecondaryText: "text-white",
              formResendCodeLink: "text-[rgb(107,114,255)] hover:text-[rgb(139,145,255)] font-semibold",
              otpCodeFieldInput: "border border-[rgb(82,82,82)] text-white bg-[rgb(26,26,26)]",
            }
          : {
              // Light mode
              formButtonPrimary:
                "bg-[rgb(37,99,235)] hover:bg-[rgb(29,78,216)] text-white font-semibold shadow-lg border-0",
              card: "bg-white border border-[rgb(226,232,240)] shadow-2xl",
              headerTitle: "text-[rgb(15,23,42)] font-bold text-2xl",
              headerSubtitle: "text-[rgb(71,85,105)] font-normal",
              formHeaderTitle: "text-[rgb(15,23,42)] font-bold",
              formHeaderSubtitle: "text-[rgb(71,85,105)]",
              formFieldLabel: "text-[rgb(15,23,42)] font-medium",
              socialButtonsBlockButton:
                "border border-[rgb(203,213,225)] bg-white hover:bg-[rgb(248,250,252)] hover:border-[rgb(148,163,184)] text-[rgb(15,23,42)]",
              socialButtonsBlockButtonText: "text-[rgb(15,23,42)] font-medium",
              formFieldInput:
                "bg-white border border-[rgb(203,213,225)] text-[rgb(15,23,42)] placeholder:text-[rgb(100,116,139)] focus:border-[rgb(37,99,235)]",
              formFieldInputShowPasswordButton: "text-[rgb(100,116,139)] hover:text-[rgb(51,65,85)]",
              dividerLine: "bg-[rgb(203,213,225)]",
              dividerText: "text-[rgb(51,65,85)] font-semibold",
              footerActionText: "text-[rgb(71,85,105)]",
              footerActionLink: "text-[rgb(37,99,235)] hover:text-[rgb(29,78,216)] font-semibold no-underline",
              identityPreviewText: "text-[rgb(15,23,42)]",
              identityPreviewEditButton: "text-[rgb(71,85,105)] font-medium",
              identityPreviewEditButtonIcon: "text-[rgb(100,116,139)]",
              formFieldSuccessText: "text-green-600",
              formFieldErrorText: "text-red-600",
              formFieldWarningText: "text-yellow-600",
              formFieldHintText: "text-[rgb(100,116,139)]",
              alertText: "text-[rgb(15,23,42)]",
              badge: "bg-[rgb(249,115,22)] text-white font-semibold",
              badgeSecondaryText: "text-white",
              formResendCodeLink: "text-[rgb(37,99,235)] hover:text-[rgb(29,78,216)] font-semibold",
              otpCodeFieldInput: "border border-[rgb(203,213,225)] text-[rgb(15,23,42)] bg-white",
            },
      }}
    />
  );
}

