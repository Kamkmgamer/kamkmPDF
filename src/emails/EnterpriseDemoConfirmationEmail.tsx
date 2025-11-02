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

interface EnterpriseDemoConfirmationEmailProps {
  firstName: string;
  company: string;
}

export default function EnterpriseDemoConfirmationEmail({
  firstName,
  company,
}: EnterpriseDemoConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Thanks for requesting a KamkmPDF Enterprise demo — we'll reach out
        within 24 hours.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src="https://ik.imagekit.io/gtnmxyt2d/servises%20store/K.png"
              width="140"
              height="140"
              alt="KamkmPDF Logo"
              style={logoImage}
            />
          </Section>

          <Heading style={h1}>Thanks, {firstName}!</Heading>
          <Text style={lead}>
            We've received your request for a KamkmPDF Enterprise demo for{" "}
            {company}. Our team will get in touch within{" "}
            <strong>24 hours</strong> to coordinate the best time.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Here's what happens next:</Text>
            <Text style={listItem}>
              • We review your goals and requirements.
            </Text>
            <Text style={listItem}>
              • Schedule a 30-minute discovery and live demo session.
            </Text>
            <Text style={listItem}>
              • Share a custom proposal tailored to your needs.
            </Text>
          </Section>

          <Text style={text}>
            Need to reach us sooner? Email our enterprise team at{" "}
            <Link style={link} href="mailto:enterprise@KamkmPDF.com">
              enterprise@KamkmPDF.com
            </Link>
            .
          </Text>

          <Hr style={divider} />

          <Text style={footerText}>
            We're excited to show you how KamkmPDF can scale with your
            organization.
            <br />— The KamkmPDF Enterprise Team
          </Text>

          <Text style={disclaimer}>
            You're receiving this email because you requested an enterprise
            demo. If this wasn't you, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f7fafc",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
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
  fontWeight: 700,
  textAlign: "center" as const,
  marginBottom: "16px",
  lineHeight: 1.3,
};

const lead = {
  color: "#2d3748",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: 1.6,
  textAlign: "center" as const,
  marginBottom: "28px",
};

const infoBox = {
  backgroundColor: "#f3e8ff",
  borderLeft: "4px solid #7c3aed",
  borderRadius: "10px",
  padding: "20px",
  marginBottom: "24px",
};

const infoTitle = {
  color: "#5b21b6",
  fontSize: "16px",
  fontWeight: 600,
  marginBottom: "12px",
};

const listItem = {
  color: "#4a5568",
  fontSize: "15px",
  lineHeight: 1.8,
  marginBottom: "4px",
};

const text = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: 1.6,
  marginBottom: "20px",
  textAlign: "left" as const,
};

const link = {
  color: "#7c3aed",
  textDecoration: "none",
  fontWeight: 600,
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
  lineHeight: 1.6,
};

const disclaimer = {
  color: "#a0aec0",
  fontSize: "13px",
  textAlign: "center" as const,
  lineHeight: 1.5,
};
