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

interface QuotaReminderEmailProps {
  name: string;
  pdfsUsed: number;
  pdfsRemaining: number;
  pdfsTotal: number;
}

export default function QuotaReminderEmail({ 
  name, 
  pdfsUsed = 2, 
  pdfsRemaining = 1,
  pdfsTotal = 3 
}: QuotaReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You're almost out of PDFs! Only {String(pdfsRemaining)} remaining this month.
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
          <Heading style={h1}>Hey {name}! 📊</Heading>
          <Text style={lead}>
            You're making great progress with kamkmPDF!
          </Text>

          {/* Usage Alert */}
          <Section style={warningBox}>
            <Text style={text}>
              You're running low on PDFs! You've used {pdfsUsed} of your {pdfsTotal} monthly PDFs.
            </Text>
            <Text style={text}>
              Upgrade to <strong>Professional</strong> for 5,000 PDFs per month, or <strong>Pro+</strong> for 10,000 PDFs with AI watermark removal and priority processing!
            </Text>
            <Text style={text}>
              Only <strong>{pdfsRemaining} PDF{pdfsRemaining !== 1 ? 's' : ''}</strong> remaining.
            </Text>
          </Section>

          {/* Message */}
          <Text style={text}>
            Don't let your momentum stop! Upgrade to <strong>Professional</strong> and get:
          </Text>

          <Text style={listItem}>✨ <strong>Unlimited PDF generation</strong></Text>
          <Text style={listItem}>🚫 <strong>No watermarks</strong> on your documents</Text>
          <Text style={listItem}>⚡ <strong>Premium AI models</strong> (GPT-4 class)</Text>
          <Text style={listItem}>💾 <strong>2 GB permanent storage</strong></Text>
          <Text style={listItem}>⏱️ <strong>60-second processing</strong> time</Text>

          {/* Call-to-action */}
          <Section style={buttonContainer}>
            <Link
              style={button}
              href="https://kamkmpdf.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Upgrade to Professional - $12/month
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Alternative */}
          <Text style={centerText}>
            Not ready to upgrade? You can still use your remaining {pdfsRemaining} PDF{pdfsRemaining !== 1 ? 's' : ''}.
          </Text>

          <Section style={buttonContainer}>
            <Link
              style={secondaryButton}
              href="https://kamkmpdf.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Continue to Dashboard
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Closing */}
          <Text style={footerText}>
            Keep creating amazing PDFs!
            <br />
            <span style={{ fontWeight: "bold" }}>The kamkmPDF Team</span>
          </Text>

          {/* Disclaimer */}
          <Text style={disclaimer}>
            Your quota resets at the beginning of each month. You can upgrade or purchase additional credits anytime.
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

const centerText = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "1.6",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const listItem = {
  color: "#4a5568",
  fontSize: "15px",
  lineHeight: "1.8",
  marginBottom: "8px",
  paddingLeft: "8px",
};

const warningBox = {
  backgroundColor: "#fffbeb",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
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
