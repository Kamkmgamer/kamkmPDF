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

interface ClassicOfferEmailProps {
  name: string;
  pdfsUsed: number;
}

export default function ClassicOfferEmail({
  name,
  pdfsUsed = 3,
}: ClassicOfferEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>🎁 Exclusive offer: Unlimited PDFs for just $5/month!</Preview>
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

          {/* Badge */}
          <Section style={badgeContainer}>
            <div style={badge}>🎁 EXCLUSIVE OFFER</div>
          </Section>

          {/* Greeting */}
          <Heading style={h1}>
            {name}, We Have a Special Offer for You! 💎
          </Heading>
          <Text style={lead}>
            You've generated {pdfsUsed} PDFs with us. We'd love to help you
            create even more!
          </Text>

          {/* Offer Box */}
          <Section style={offerBox}>
            <Text style={offerTitle}>Classic Plan - Limited Time Offer</Text>
            <Text style={offerPrice}>
              <span style={strikethrough}>$12/month</span>
              <br />
              <span style={bigPrice}>$5</span>
              <span style={perMonth}>/month</span>
            </Text>
            <Text style={offerSavings}>Save 58% - Exclusive for You!</Text>
          </Section>

          {/* What's Included */}
          <Text style={text}>
            <strong>Here's what you get with Classic:</strong>
          </Text>

          <Text style={listItem}>
            ✅ <strong>50 PDFs per month</strong> (vs. 3 free)
          </Text>
          <Text style={listItem}>
            ✅ <strong>No watermarks</strong> on your documents
          </Text>
          <Text style={listItem}>
            ✅ <strong>Premium templates</strong> (10+ designs)
          </Text>
          <Text style={listItem}>
            ✅ <strong>Standard AI models</strong>
          </Text>
          <Text style={listItem}>
            ✅ <strong>500 MB permanent storage</strong>
          </Text>
          <Text style={listItem}>
            ✅ <strong>Version history</strong> (5 versions)
          </Text>
          <Text style={listItem}>
            ✅ <strong>Email support</strong> (48-72h response)
          </Text>

          {/* Call-to-action */}
          <Section style={buttonContainer}>
            <Link
              style={button}
              href="https://KamkmPDF.com/api/polar/create-checkout?tier=classic&offer=exclusive"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claim Your $5/Month Offer Now
            </Link>
          </Section>

          <Text style={urgency}>
            ⏰ This exclusive offer is only available for a limited time!
          </Text>

          <Hr style={divider} />

          {/* Comparison */}
          <Text style={comparisonText}>
            <strong>Why Classic is perfect for you:</strong>
            <br />
            <br />
            • You're already using KamkmPDF regularly
            <br />
            • You want to remove watermarks from your PDFs
            <br />
            • You need more than 3 PDFs per month
            <br />• You want premium features at an affordable price
          </Text>

          <Hr style={divider} />

          {/* Closing */}
          <Text style={footerText}>
            Questions? Just reply to this email - we're here to help!
            <br />
            <span style={{ fontWeight: "bold" }}>The KamkmPDF Team</span>
          </Text>

          {/* Disclaimer */}
          <Text style={disclaimer}>
            This is an exclusive offer for KamkmPDF users. Offer subject to
            availability and may be withdrawn at any time.
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

const badge = {
  display: "inline-block",
  backgroundColor: "#9333ea",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1px",
  padding: "8px 20px",
  borderRadius: "20px",
  textTransform: "uppercase" as const,
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

const offerBox = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: "12px",
  padding: "32px",
  marginBottom: "32px",
  textAlign: "center" as const,
};

const offerTitle = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "600",
  marginBottom: "16px",
};

const offerPrice = {
  margin: "0",
};

const strikethrough = {
  color: "#e2e8f0",
  fontSize: "18px",
  textDecoration: "line-through",
};

const bigPrice = {
  color: "#ffffff",
  fontSize: "64px",
  fontWeight: "800",
  lineHeight: "1",
};

const perMonth = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "600",
};

const offerSavings = {
  color: "#fef3c7",
  fontSize: "16px",
  fontWeight: "600",
  marginTop: "12px",
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

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#9333ea",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  letterSpacing: "0.3px",
  padding: "16px 40px",
  textDecoration: "none",
  display: "inline-block",
  boxShadow: "0 4px 14px rgba(147, 51, 234, 0.4)",
};

const urgency = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "600",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const comparisonText = {
  color: "#4a5568",
  fontSize: "15px",
  lineHeight: "1.8",
  textAlign: "left" as const,
  backgroundColor: "#f7fafc",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "24px",
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
