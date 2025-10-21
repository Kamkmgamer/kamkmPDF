"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function NewPromptPage() {
  const router = useRouter();

  // Redirect to home page since PDF creation is now at /
  React.useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
