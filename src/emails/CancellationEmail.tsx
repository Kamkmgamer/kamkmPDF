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

interface CancellationEmailProps {
  name: string;
  tier: string;
  endDate: string;
}

export default function CancellationEmail({ 
  name, 
  tier = "Professional",
  endDate = "January 31, 2025"
}: CancellationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        We're sorry to see you go. Your {tier} features remain active until {endDate}.
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
          <Heading style={h1}>We're Sorry to See You Go, {name} 😢</Heading>
          <Text style={lead}>
            Your {tier} subscription has been cancelled.
          </Text>

          {/* Info Box */}
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Your {tier} features will remain active until:</strong>
              <br />
              <span style={dateText}>{endDate}</span>
            </Text>
            <Text style={infoSubtext}>
              You can continue using all premium features until this date. After that, your account will revert to the Free plan.
            </Text>
          </Section>

          {/* What You'll Lose */}
          <Text style={text}>
            <strong>After {endDate}, you'll lose access to:</strong>
          </Text>

          <Text style={listItem}>❌ Unlimited PDF generation</Text>
          <Text style={listItem}>❌ No watermarks on documents</Text>
          <Text style={listItem}>❌ Premium AI models</Text>
          <Text style={listItem}>❌ Permanent storage</Text>
          <Text style={listItem}>❌ Version history</Text>
          <Text style={listItem}>❌ Priority support</Text>

          <Hr style={divider} />

          {/* Feedback Request */}
          <Text style={text}>
            <strong>We'd love to hear from you:</strong>
            <br /><br />
            Could you take a moment to tell us why you cancelled? Your feedback helps us improve kamkmPDF for everyone.
          </Text>

          <Section style={buttonContainer}>
            <Link
              style={secondaryButton}
              href="https://kamkmpdf.com/feedback?type=cancellation"
              target="_blank"
              rel="noopener noreferrer"
            >
              Share Your Feedback
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Reactivate Option */}
          <Text style={centerText}>
            <strong>Changed your mind?</strong>
            <br />
            You can reactivate your subscription anytime before {endDate} to keep all your premium features.
          </Text>

          <Section style={buttonContainer}>
            <Link
              style={button}
              href="https://kamkmpdf.com/dashboard/subscription"
              target="_blank"
              rel="noopener noreferrer"
            >
              Reactivate My Subscription
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Closing */}
          <Text style={footerText}>
            Thank you for being part of kamkmPDF. We hope to see you again soon!
            <br />
            <span style={{ fontWeight: "bold" }}>The kamkmPDF Team</span>
          </Text>

          {/* Disclaimer */}
          <Text style={disclaimer}>
            If you didn't cancel your subscription, please contact us immediately at support@kamkmpdf.com
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

const infoBox = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
};

const infoText = {
  color: "#92400e",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 12px 0",
  textAlign: "center" as const,
};

const dateText = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#b45309",
};

const infoSubtext = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
  textAlign: "center" as const,
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
