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

interface AbandonedCartEmailProps {
  userFirstname?: string;
  checkoutUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : "https://flashhfashion.in";

export const AbandonedCartEmail = ({
  userFirstname = "Friend",
  checkoutUrl = `${baseUrl}/cart`,
}: AbandonedCartEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You left something behind 🛒</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <div className="flex justify-center items-center">
                <div className="bg-orange-500 h-10 w-10 text-white font-black text-xl flex items-center justify-center rounded-xl mx-auto">
                  !
                </div>
              </div>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              It&apos;s still waiting for you...
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hey {userFirstname},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We noticed you left some premium gear in your cart. These items
              are selling out fast, so we saved them for you for a limited time.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={checkoutUrl}
              >
                Secure Your Drip
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Don&apos;t let your style slip away.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AbandonedCartEmail;
