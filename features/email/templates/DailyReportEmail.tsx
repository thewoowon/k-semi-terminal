import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type DailyReportEmailProps = {
  title: string;
  subtitle: string;
  summary: string;
  cycleScore: number;
  cycleLabel: string;
  reportUrl: string;
  unsubscribeUrl: string;
  disclaimer: string;
};

const ink = "#e6edf3";
const dim = "#8b949e";
const faint = "#59636e";
const hot = "#ff6b00";

/** Founding Reader daily email (launch checklist §9.3). Dark, dense, terminal. */
export function DailyReportEmail({
  title,
  subtitle,
  summary,
  cycleScore,
  cycleLabel,
  reportUrl,
  unsubscribeUrl,
  disclaimer,
}: DailyReportEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{subtitle}</Preview>
      <Body style={{ backgroundColor: "#05070a", color: ink, fontFamily: "-apple-system, Segoe UI, Roboto, sans-serif", margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px" }}>
          <Text style={{ fontSize: 12, letterSpacing: "0.12em", color: hot, textTransform: "uppercase", margin: "0 0 4px" }}>
            ★ K-Semi Signal · Founding Reader
          </Text>
          <Heading style={{ fontSize: 21, color: ink, margin: "0 0 4px", lineHeight: 1.25 }}>
            {title}
          </Heading>
          <Text style={{ color: dim, margin: "0 0 16px", fontSize: 14 }}>{subtitle}</Text>

          <Section style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
            <Text style={{ margin: 0, fontSize: 11, letterSpacing: "0.1em", color: faint, textTransform: "uppercase" }}>
              K-Semi Cycle Score
            </Text>
            <Text style={{ margin: "4px 0 0" }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: "#ffb000" }}>{cycleScore}</span>
              <span style={{ color: faint, fontSize: 14 }}> / 100 · {cycleLabel}</span>
            </Text>
          </Section>

          <Text style={{ color: ink, lineHeight: 1.7, fontSize: 14 }}>{summary}</Text>

          <Section style={{ marginTop: 20 }}>
            <Button href={reportUrl} style={{ backgroundColor: hot, color: "#05070a", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 6, textDecoration: "none" }}>
              전체 리포트 보기 →
            </Button>
          </Section>

          <Hr style={{ borderColor: "rgba(148,163,184,0.14)", margin: "24px 0 12px" }} />
          <Text style={{ color: faint, fontSize: 11, lineHeight: 1.6 }}>{disclaimer}</Text>
          <Text style={{ color: faint, fontSize: 11, margin: "8px 0 0" }}>
            본 메일은 K-Semi Signal Founding Reader 등록자에게 발송되었습니다.{" "}
            <Link href={unsubscribeUrl} style={{ color: dim, textDecoration: "underline" }}>
              수신 거부
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DailyReportEmail;
