import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  userFirstname?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : "https://flashhfashion.in";

export const WelcomeEmail = ({
  userFirstname = "Trendsetter",
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the Flash Family</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <div className="flex justify-center items-center">
                <div className="bg-indigo-600 h-10 w-10 text-white font-black text-xl flex items-center justify-center rounded-xl mx-auto">
                  F
                </div>
              </div>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to <strong>Flash Fashion</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {userFirstname},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You&apos;re officially on the list. You&apos;ll be the first to
              know about our new drops, exclusive collaborations, and flash
              sales.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={`${baseUrl}/store`}
              >
                Start Shopping
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Use code <strong>WELCOME10</strong> for 10% off your first order.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Stay energetic,
              <br />
              The Flash Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
