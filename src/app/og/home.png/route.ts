import React from "react";
import { ImageResponse } from "next/og";

export async function GET() {
  const width = 1200;
  const height = 630;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width,
    height,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 64,
    background:
      "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #38bdf8 100%)",
    color: "#fff",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  };

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background:
      "radial-gradient(1000px 600px at 0% 0%, rgba(255,255,255,.12), transparent)",
  };

  const badgeStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    fontSize: 28,
    fontWeight: 700,
    padding: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,.14)",
  };

  const h1Style: React.CSSProperties = {
    margin: 0,
    marginTop: 24,
    fontSize: 84,
    lineHeight: 1.05,
    fontWeight: 900,
    textShadow: "0 4px 24px rgba(0,0,0,.25)",
  };

  const pStyle: React.CSSProperties = {
    margin: 0,
    marginTop: 16,
    fontSize: 32,
    opacity: 0.95,
  };

  return new ImageResponse(
    React.createElement(
      "div",
      { style: containerStyle },
      // overlay
      React.createElement("div", { style: overlayStyle }),
      // content
      React.createElement(
        "div",
        {
          style: {
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
          },
        },
        React.createElement("div", { style: badgeStyle }, "kamkmPDF"),
        React.createElement(
          "h1",
          { style: h1Style },
          "AI PDF Generator & Document Automation",
        ),
        React.createElement(
          "p",
          { style: pStyle },
          "Generate professional PDFs with AI. Templates, branding, collaboration, and a developer-friendly API.",
        ),
      ),
    ),
    { width, height },
  );
}
