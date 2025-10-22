import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  pdfsRemaining: number;
}

export default function WelcomeEmail({ name, pdfsRemaining = 3 }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to kamkmPDF! You have {String(pdfsRemaining)} free PDFs to get started.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://ik.imagekit.io/gtnmxyt2d/servises%20store/K.png"
              width="140"
              height="140"
              alt="kamkmPDF Logo"
              style={logoImage}
            />
          </Section>

          {/* Greeting */}
          <Heading style={h1}>Welcome to kamkmPDF, {name}! 🎉</Heading>
          <Text style={lead}>
            Thank you for signing up! We're excited to help you create amazing PDFs with AI.
          </Text>

          {/* Free PDFs Info */}
          <Section style={highlightBox}>
            <Text style={highlightText}>
              <strong>You have {String(pdfsRemaining)} free PDFs</strong> to generate this month with our AI-powered platform.
            </Text>
          </Section>

          {/* Getting Started */}
          <Text style={text}>
            <strong>Here's what you can do:</strong>
          </Text>
          <Text style={listItem}>✅ Generate professional resumes</Text>
          <Text style={listItem}>✅ Create business proposals</Text>
          <Text style={listItem}>✅ Design custom documents</Text>
          <Text style={listItem}>✅ Use AI to perfect your content</Text>

          {/* Call-to-action */}
          <Section style={buttonContainer}>
            <Link
              style={button}
              href="https://kamkmpdf.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Creating PDFs
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Upgrade Teaser */}
          <Text style={text}>
            <strong>Want more?</strong> Upgrade to Professional or Pro+ for unlimited PDFs, no watermarks, and premium AI models with priority processing.
          </Text>

          <Section style={buttonContainer}>
            <Link
              style={secondaryButton}
              href="https://kamkmpdf.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Pricing Plans
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Closing */}
          <Text style={footerText}>
            Happy creating!
            <br />
            <span style={{ fontWeight: "bold" }}>The kamkmPDF Team</span>
          </Text>

          {/* Disclaimer */}
          <Text style={disclaimer}>
            You're receiving this email because you signed up for kamkmPDF. If you didn't create this account, please ignore this message.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/* ===== Styles ===== */

const main = {
  backgroundColor: "#f7fafc",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: "0",
  padding: "30px 0",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  margin: "0 auto",
  padding: "40px 32px",
  maxWidth: "640px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoImage = {
  margin: "0 auto",
  display: "block",
};

const h1 = {
  color: "#1a202c",
  fontSize: "30px",
  fontWeight: "700",
  textAlign: "center" as const,
  marginBottom: "16px",
  lineHeight: "1.3",
};

const lead = {
  color: "#2d3748",
  fontSize: "18px",
  fontWeight: "500",
  lineHeight: "1.6",
  textAlign: "center" as const,
  marginBottom: "28px",
};

const text = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "1.6",
  marginBottom: "16px",
  textAlign: "left" as const,
};

const listItem = {
  color: "#4a5568",
  fontSize: "15px",
  lineHeight: "1.8",
  marginBottom: "8px",
  paddingLeft: "8px",
};

const highlightBox = {
  backgroundColor: "#ebf8ff",
  borderLeft: "4px solid #3182ce",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
};

const highlightText = {
  color: "#2c5282",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0",
  textAlign: "center" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#3182ce",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  letterSpacing: "0.3px",
  padding: "14px 32px",
  textDecoration: "none",
  display: "inline-block",
};

const secondaryButton = {
  backgroundColor: "#ffffff",
  border: "2px solid #3182ce",
  borderRadius: "8px",
  color: "#3182ce",
  fontSize: "15px",
  fontWeight: "600",
  letterSpacing: "0.3px",
  padding: "12px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "32px 0",
};

const footerText = {
  color: "#4a5568",
  fontSize: "15px",
  textAlign: "center" as const,
  marginBottom: "16px",
  lineHeight: "1.6",
};

const disclaimer = {
  color: "#a0aec0",
  fontSize: "13px",
  textAlign: "center" as const,
  lineHeight: "1.5",
};
