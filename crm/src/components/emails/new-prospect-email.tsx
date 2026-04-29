import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
} from "@react-email/components";

interface NewProspectEmailProps {
  championName: string;
  parentFirstName: string;
  childCount: number;
  geographyName: string;
  prospectsUrl: string;
}

export function NewProspectEmail({
  championName,
  parentFirstName,
  childCount,
  geographyName,
  prospectsUrl,
}: NewProspectEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Enrollment Interest</Heading>
          <Text style={text}>Hi {championName},</Text>
          <Text style={text}>
            <strong>{parentFirstName}</strong> has expressed interest in Alpha
            School {geographyName} for{" "}
            <strong>
              {childCount} {childCount === 1 ? "child" : "children"}
            </strong>
            .
          </Text>
          <Section style={buttonSection}>
            <Link href={prospectsUrl} style={button}>
              View Prospects
            </Link>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Alpha School Enrollment CRM
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#0B0B10",
  marginBottom: "24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#0B0B10",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#0000FF",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "4px",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "600" as const,
};

const hr = {
  borderColor: "#e0e0e0",
  margin: "32px 0",
};

const footer = {
  fontSize: "12px",
  color: "#999999",
};
