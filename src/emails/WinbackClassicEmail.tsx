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

interface WinbackClassicEmailProps {
  name: string;
  previousTier: string;
}

export default function WinbackClassicEmail({
  name,
  previousTier = "Professional",
}: WinbackClassicEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        We miss you! Come back with our exclusive $5/month Classic plan.
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

          {/* Badge */}
          <Section style={badgeContainer}>
            <div style={badge}>💝 COMEBACK OFFER</div>
          </Section>

          {/* Greeting */}
          <Heading style={h1}>We Miss You, {name}! 💙</Heading>
          <Text style={lead}>
            We noticed you cancelled your {previousTier} plan. We'd love to have
            you back!
          </Text>

          {/* Offer Box */}
          <Section style={offerBox}>
            <Text style={offerTitle}>Exclusive Comeback Offer</Text>
            <Text style={offerSubtitle}>Classic Plan - Just for You</Text>
            <Text style={offerPrice}>
              <span style={bigPrice}>$5</span>
              <span style={perMonth}>/month</span>
            </Text>
            <Text style={offerSavings}>58% OFF Regular Price!</Text>
          </Section>

          {/* What's Included */}
          <Text style={text}>
            <strong>Get back to creating with Classic:</strong>
          </Text>

          <Text style={listItem}>
            ✅ <strong>50 PDFs per month</strong>
          </Text>
          <Text style={listItem}>
            ✅ <strong>No watermarks</strong>
          </Text>
          <Text style={listItem}>
            ✅ <strong>Premium templates</strong>
          </Text>
          <Text style={listItem}>
            ✅ <strong>500 MB permanent storage</strong>
          </Text>
          <Text style={listItem}>
            ✅ <strong>Version history</strong> (5 versions)
          </Text>
          <Text style={listItem}>
            ✅ <strong>Email support</strong>
          </Text>

          {/* Call-to-action */}
          <Section style={buttonContainer}>
            <Link
              style={button}
              href="https://KamkmPDF.com/api/polar/create-checkout?tier=classic&offer=winback"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claim Your $5/Month Comeback Offer
            </Link>
          </Section>

          <Text style={urgency}>
            ⏰ This exclusive offer expires in 72 hours!
          </Text>

          <Hr style={divider} />

          {/* Why Come Back */}
          <Section style={testimonialBox}>
            <Text style={testimonialText}>
              "I cancelled my subscription but realized I was using KamkmPDF
              more than I thought. The Classic plan is perfect for my needs at
              an amazing price!"
            </Text>
            <Text style={testimonialAuthor}>
              - Sarah M., Freelance Designer
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Comparison */}
          <Text style={comparisonTitle}>
            <strong>Classic vs. Free Plan:</strong>
          </Text>

          <table style={comparisonTable}>
            <tr>
              <td style={comparisonCell}></td>
              <td style={comparisonHeaderCell}>Free</td>
              <td style={comparisonHeaderCellHighlight}>Classic</td>
            </tr>
            <tr>
              <td style={comparisonCell}>PDFs/month</td>
              <td style={comparisonCell}>3</td>
              <td style={comparisonCellHighlight}>
                <strong>50</strong>
              </td>
            </tr>
            <tr>
              <td style={comparisonCell}>Watermarks</td>
              <td style={comparisonCell}>Yes ❌</td>
              <td style={comparisonCellHighlight}>
                <strong>No ✅</strong>
              </td>
            </tr>
            <tr>
              <td style={comparisonCell}>Storage</td>
              <td style={comparisonCell}>50 MB (30 days)</td>
              <td style={comparisonCellHighlight}>
                <strong>500 MB (permanent)</strong>
              </td>
            </tr>
            <tr>
              <td style={comparisonCell}>Templates</td>
              <td style={comparisonCell}>3 basic</td>
              <td style={comparisonCellHighlight}>
                <strong>10+ premium</strong>
              </td>
            </tr>
          </table>

          <Hr style={divider} />

          {/* Closing */}
          <Text style={footerText}>
            We'd love to have you back in the KamkmPDF family!
            <br />
            <span style={{ fontWeight: "bold" }}>The KamkmPDF Team</span>
          </Text>

          {/* Disclaimer */}
          <Text style={disclaimer}>
            This is an exclusive comeback offer for previous subscribers. Offer
            valid for 72 hours from receipt of this email.
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
  backgroundColor: "#ec4899",
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
  marginBottom: "32px",
};

const offerBox = {
  background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
  borderRadius: "12px",
  padding: "32px",
  marginBottom: "32px",
  textAlign: "center" as const,
};

const offerTitle = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  marginBottom: "8px",
};

const offerSubtitle = {
  color: "#fce7f3",
  fontSize: "16px",
  fontWeight: "500",
  marginBottom: "16px",
};

const offerPrice = {
  margin: "0",
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
  backgroundColor: "#ec4899",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  letterSpacing: "0.3px",
  padding: "16px 40px",
  textDecoration: "none",
  display: "inline-block",
  boxShadow: "0 4px 14px rgba(236, 72, 153, 0.4)",
};

const urgency = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "600",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const testimonialBox = {
  backgroundColor: "#f0fdf4",
  borderLeft: "4px solid #10b981",
  borderRadius: "8px",
  padding: "24px",
  marginBottom: "24px",
};

const testimonialText = {
  color: "#065f46",
  fontSize: "16px",
  fontStyle: "italic" as const,
  lineHeight: "1.6",
  marginBottom: "12px",
};

const testimonialAuthor = {
  color: "#047857",
  fontSize: "14px",
  fontWeight: "600",
  textAlign: "right" as const,
};

const comparisonTitle = {
  color: "#1a202c",
  fontSize: "18px",
  marginBottom: "16px",
  textAlign: "center" as const,
};

const comparisonTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginBottom: "24px",
};

const comparisonCell = {
  padding: "12px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "14px",
  color: "#4a5568",
};

const comparisonHeaderCell = {
  padding: "12px",
  borderBottom: "2px solid #e2e8f0",
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#4a5568",
  textAlign: "center" as const,
};

const comparisonHeaderCellHighlight = {
  padding: "12px",
  borderBottom: "2px solid #ec4899",
  fontSize: "14px",
  fontWeight: "700" as const,
  color: "#ec4899",
  textAlign: "center" as const,
};

const comparisonCellHighlight = {
  padding: "12px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "14px",
  color: "#ec4899",
  fontWeight: "600" as const,
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
