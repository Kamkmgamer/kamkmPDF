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

interface FinalWinbackEmailProps {
  name: string;
}

export default function FinalWinbackEmail({ name }: FinalWinbackEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Last chance: Your exclusive $5/month offer expires soon!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://ik.imagekit.io/gtnmxyt2d/servises%20store/K.png"
              width="140"
              height="140"
              alt="KamkmPDF Logo"
              style={logoImage}
            />
          </Section>

          {/* Urgent Badge */}
          <Section style={badgeContainer}>
            <div style={urgentBadge}>⏰ FINAL REMINDER</div>
          </Section>

          {/* Greeting */}
          <Heading style={h1}>
            {name}, Your Exclusive Offer Expires Soon! ⚠️
          </Heading>
          <Text style={lead}>
            This is your last chance to claim the $5/month Classic plan.
          </Text>

          {/* Countdown Box */}
          <Section style={countdownBox}>
            <Text style={countdownTitle}>⏰ OFFER EXPIRES IN:</Text>
            <Text style={countdownTime}>24 HOURS</Text>
            <Text style={countdownSubtext}>
              After this, the offer is gone forever
            </Text>
          </Section>

          {/* Offer Recap */}
          <Section style={offerBox}>
            <Text style={offerPrice}>
              <span style={bigPrice}>$5</span>
              <span style={perMonth}>/month</span>
            </Text>
            <Text style={offerSavings}>Classic Plan - 58% OFF</Text>
          </Section>

          {/* Quick Benefits */}
          <Text style={benefitsTitle}>
            <strong>What you're missing out on:</strong>
          </Text>

          <table style={benefitsTable}>
            <tr>
              <td style={benefitCell}>
                <span style={benefitIcon}>📄</span>
                <strong>50 PDFs/month</strong>
                <br />
                <span style={benefitSubtext}>vs. 3 on free plan</span>
              </td>
              <td style={benefitCell}>
                <span style={benefitIcon}>✨</span>
                <strong>No Watermarks</strong>
                <br />
                <span style={benefitSubtext}>Professional output</span>
              </td>
            </tr>
            <tr>
              <td style={benefitCell}>
                <span style={benefitIcon}>💾</span>
                <strong>500 MB Storage</strong>
                <br />
                <span style={benefitSubtext}>Permanent access</span>
              </td>
              <td style={benefitCell}>
                <span style={benefitIcon}>🎨</span>
                <strong>Premium Templates</strong>
                <br />
                <span style={benefitSubtext}>10+ designs</span>
              </td>
            </tr>
          </table>

          {/* Call-to-action */}
          <Section style={buttonContainer}>
            <Link
              style={button}
              href="https://KamkmPDF.com/api/polar/create-checkout?tier=classic&offer=final"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claim My $5/Month Offer Now
            </Link>
          </Section>

          <Text style={urgencyText}>
            🔥 Don't miss out! This is your final reminder.
          </Text>

          <Hr style={divider} />

          {/* Social Proof */}
          <Text style={socialProofTitle}>
            <strong>Join 50,000+ users creating amazing PDFs:</strong>
          </Text>

          <Section style={statsBox}>
            <table style={statsTable}>
              <tr>
                <td style={statCell}>
                  <div style={statNumber}>50K+</div>
                  <div style={statLabel}>Active Users</div>
                </td>
                <td style={statCell}>
                  <div style={statNumber}>1M+</div>
                  <div style={statLabel}>PDFs Created</div>
                </td>
                <td style={statCell}>
                  <div style={statNumber}>4.9★</div>
                  <div style={statLabel}>User Rating</div>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={divider} />

          {/* Alternative */}
          <Text style={centerText}>
            <strong>Not interested?</strong>
            <br />
            No problem! You can continue using the free plan with 3 PDFs per
            month.
          </Text>

          <Section style={buttonContainer}>
            <Link
              style={secondaryButton}
              href="https://KamkmPDF.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Continue with Free Plan
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Closing */}
          <Text style={footerText}>
            This is the last email about this offer. We won't bother you again!
            <br />
            <span style={{ fontWeight: "bold" }}>The KamkmPDF Team</span>
          </Text>

          {/* Disclaimer */}
          <Text style={disclaimer}>
            This exclusive offer expires in 24 hours. After that, the Classic
            plan will no longer be available at this price.
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
  marginBottom: "24px",
};

const logoImage = {
  margin: "0 auto",
  display: "block",
};

const badgeContainer = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const urgentBadge = {
  display: "inline-block",
  backgroundColor: "#dc2626",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1px",
  padding: "8px 20px",
  borderRadius: "20px",
  textTransform: "uppercase" as const,
  animation: "pulse 2s infinite",
};

const h1 = {
  color: "#1a202c",
  fontSize: "28px",
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
  marginBottom: "32px",
};

const countdownBox = {
  backgroundColor: "#fef2f2",
  border: "3px solid #dc2626",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const countdownTitle = {
  color: "#991b1b",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "1px",
  marginBottom: "8px",
  textTransform: "uppercase" as const,
};

const countdownTime = {
  color: "#dc2626",
  fontSize: "48px",
  fontWeight: "900",
  lineHeight: "1",
  marginBottom: "8px",
};

const countdownSubtext = {
  color: "#991b1b",
  fontSize: "14px",
  fontWeight: "600",
};

const offerBox = {
  background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "32px",
  textAlign: "center" as const,
};

const offerPrice = {
  margin: "0",
};

const bigPrice = {
  color: "#ffffff",
  fontSize: "56px",
  fontWeight: "800",
  lineHeight: "1",
};

const perMonth = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "600",
};

const offerSavings = {
  color: "#fef3c7",
  fontSize: "16px",
  fontWeight: "600",
  marginTop: "8px",
};

const benefitsTitle = {
  color: "#1a202c",
  fontSize: "18px",
  marginBottom: "20px",
  textAlign: "center" as const,
};

const benefitsTable = {
  width: "100%",
  marginBottom: "32px",
};

const benefitCell = {
  padding: "16px",
  textAlign: "center" as const,
  verticalAlign: "top" as const,
};

const benefitIcon = {
  fontSize: "32px",
  display: "block",
  marginBottom: "8px",
};

const benefitSubtext = {
  color: "#718096",
  fontSize: "13px",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700",
  letterSpacing: "0.3px",
  padding: "18px 48px",
  textDecoration: "none",
  display: "inline-block",
  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
};

const secondaryButton = {
  backgroundColor: "#ffffff",
  border: "2px solid #cbd5e0",
  borderRadius: "8px",
  color: "#4a5568",
  fontSize: "15px",
  fontWeight: "600",
  letterSpacing: "0.3px",
  padding: "12px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const urgencyText = {
  color: "#dc2626",
  fontSize: "16px",
  fontWeight: "700",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const socialProofTitle = {
  color: "#1a202c",
  fontSize: "16px",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const statsBox = {
  backgroundColor: "#f7fafc",
  borderRadius: "8px",
  padding: "24px",
  marginBottom: "24px",
};

const statsTable = {
  width: "100%",
};

const statCell = {
  textAlign: "center" as const,
  padding: "8px",
};

const statNumber = {
  color: "#3182ce",
  fontSize: "32px",
  fontWeight: "800",
  marginBottom: "4px",
};

const statLabel = {
  color: "#718096",
  fontSize: "13px",
  fontWeight: "600",
};

const centerText = {
  color: "#4a5568",
  fontSize: "15px",
  lineHeight: "1.6",
  marginBottom: "16px",
  textAlign: "center" as const,
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
