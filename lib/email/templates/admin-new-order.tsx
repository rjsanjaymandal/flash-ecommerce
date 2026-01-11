import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
  Button,
} from "@react-email/components";
import * as React from "react";

interface AdminNewOrderEmailProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

export const AdminNewOrderEmail = ({
  orderId,
  customerName,
  customerEmail,
  items = [],
  total,
}: AdminNewOrderEmailProps) => {
  const previewText = `New Order Received: ₹${total} by ${customerName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              New Order Received 💰
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Customer:</strong> {customerName} ({customerEmail})
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Order ID:</strong> {orderId}
            </Text>

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

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={`https://flash-ecommerce.vercel.app/admin/orders/${orderId}`}
              >
                View in Admin Panel
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AdminNewOrderEmail;
