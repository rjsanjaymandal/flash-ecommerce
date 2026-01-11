import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  total: number;
  shippingAddress?: string;
  orderDate?: string;
}

export const OrderConfirmationEmail = ({
  orderId,
  customerName,
  items,
  total,
  shippingAddress,
  orderDate = new Date().toDateString(),
}: OrderConfirmationEmailProps) => {
  const previewText = `Your Flash order #${orderId.slice(0, 8)} is confirmed.`;
  const estimatedDelivery = new Date(
    new Date(orderDate).getTime() + 7 * 24 * 60 * 60 * 1000
  ).toDateString();

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://flash-ecommerce.vercel.app/logo.png"
                width="40"
                height="40"
                alt="Flash"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Order Confirmed! 🚀
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hi {customerName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thanks for your order. We&apos;re getting it ready to be shipped.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Order ID:</strong> {orderId}
              <br />
              <strong>Date:</strong> {orderDate}
              <br />
              <strong>Est. Delivery:</strong> {estimatedDelivery}
            </Text>

            {shippingAddress && (
              <Text className="text-black text-[14px] leading-[24px]">
                <strong>Shipping To:</strong>
                <br />
                {shippingAddress}
              </Text>
            )}

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Section>
              {items.map((item, index) => (
                <Row key={index} className="pb-4">
                  <Column>
                    <Text className="text-[14px] font-bold m-0">
                      {item.name}
                    </Text>
                    <Text className="text-[12px] text-gray-500 m-0">
                      Qty: {item.quantity}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text className="text-[14px] font-bold m-0">
                      ₹{item.price * item.quantity}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Section>
              <Row>
                <Column>
                  <Text className="text-[14px] font-bold m-0">Total</Text>
                </Column>
                <Column align="right">
                  <Text className="text-[18px] font-black m-0">₹{total}</Text>
                </Column>
              </Row>
            </Section>

            <Text className="text-center text-[12px] text-gray-500 mt-8">
              Questions? Reply to this email or visit our{" "}
              <Link
                href="https://flash-ecommerce.vercel.app/contact"
                className="text-blue-600 underline"
              >
                Help Center
              </Link>
              .
            </Text>
            <Text className="text-black text-[14px] leading-[24px] mt-2 text-center font-bold">
              FLASH Fashion - Embrace Your Pride
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderConfirmationEmail;
