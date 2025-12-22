
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface WaitlistNotificationProps {
  productName: string;
  productUrl: string;
  imageUrl?: string;
  userName?: string;
  baseUrl: string;
}

export const WaitlistNotification = ({
  productName,
  productUrl,
  imageUrl,
  userName = "Valued Customer",
  baseUrl,
}: WaitlistNotificationProps) => {
  const previewText = `Great news! ${productName} is back in stock.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>It's Back!</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            You asked us to let you know, and we delivered. <strong>{productName}</strong> is finally back in stock and ready for you.
          </Text>

          {imageUrl && (
            <Section style={imageSection}>
              <Img
                src={imageUrl}
                width="300"
                alt={productName}
                style={image}
              />
            </Section>
          )}

          <Section style={btnContainer}>
            <Button style={button} href={productUrl}>
              Shop Now
            </Button>
          </Section>

          <Text style={text}>
            This product is in high demand, so grab it while you can!
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            You received this email because you joined the waitlist for this product.
            <br />
            <Link href={`${baseUrl}/account`} style={link}>
              Manage your waitlist
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WaitlistNotification;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  padding: "0",
  color: "#111",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
  fontWeight: "bold",
};

const imageSection = {
  display: "flex",
  justifyContent: "center",
  margin: "20px 0",
};

const image = {
  borderRadius: "8px",
  border: "1px solid #eaeaea",
  objectFit: "cover" as const,
};

const hr = {
  borderColor: "#eaeaea",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "24px",
};

const link = {
  color: "#444",
  textDecoration: "underline",
};
