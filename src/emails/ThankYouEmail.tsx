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

interface ThankYouEmailProps {
  name: string;
}

export default function ThankYouEmail({ name }: ThankYouEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        We’ve received your message — our team will get back to you shortly.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://ik.imagekit.io/gtnmxyt2d/servises%20store/K.png"
              width="140"
              height="140"
              alt="Company Logo"
              style={logoImage}
            />
          </Section>

          {/* Greeting */}
          <Heading style={h1}>Thank You, {name}!</Heading>
          <Text style={lead}>
            We’ve received your message and truly appreciate you taking the time
            to reach out.
          </Text>

          {/* Message */}
          <Text style={text}>
            Our team is already reviewing your inquiry and we’ll get back to you
            within <strong>24–48 business hours</strong>. In the meantime, feel
            free to explore our website or check out our latest updates.
          </Text>

          {/* Call-to-action */}
          <Section style={buttonContainer}>
            <Link
              style={button}
              href="https://khalil.mageed.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Our Website
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Closing */}
          <Text style={footerText}>
            Warm regards,
            <br />
            <span style={{ fontWeight: "bold" }}>KAMKM</span>
          </Text>

          {/* Unsubscribe / Disclaimer */}
          <Text style={disclaimer}>
            This is an automated confirmation email. Please do not reply
            directly. If you didn’t initiate this request, you can safely ignore
            this message.
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
  marginBottom: "28px",
  textAlign: "left" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  marginBottom: "36px",
};

const button = {
  backgroundColor: "#2b6cb0",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  letterSpacing: "0.3px",
  padding: "14px 28px",
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
