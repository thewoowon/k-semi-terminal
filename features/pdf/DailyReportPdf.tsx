import "server-only";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { DailySemiReport } from "@/features/reports/lib/reportTypes";
import { dotDate } from "@/lib/formatDate";

/**
 * Optional Korean font. react-pdf's built-in Helvetica has no Hangul glyphs;
 * set PDF_FONT_URL to a .ttf/.otf with Korean coverage to render Korean text.
 * Registration failures degrade to the default font instead of throwing.
 */
let fontFamily = "Helvetica";
let registered = false;
function ensureFont() {
  if (registered) return;
  registered = true;
  const url = process.env.PDF_FONT_URL;
  if (url) {
    try {
      Font.register({ family: "ReportKR", fonts: [{ src: url }] });
      fontFamily = "ReportKR";
    } catch {
      /* keep default */
    }
  }
}

const HOT = "#d8590a";
const INK = "#0e141b";
const DIM = "#5b6470";

function styles() {
  return StyleSheet.create({
    page: { padding: 40, fontFamily, fontSize: 10, color: INK, lineHeight: 1.5 },
    brand: { fontSize: 9, letterSpacing: 1, color: HOT, textTransform: "uppercase", marginBottom: 6 },
    title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
    subtitle: { fontSize: 10, color: DIM, marginBottom: 12 },
    scoreRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 14, borderBottom: "1pt solid #e2e6ea", paddingBottom: 10 },
    score: { fontSize: 32, fontWeight: 700, color: HOT },
    scoreMeta: { fontSize: 10, color: DIM, marginLeft: 8, marginBottom: 5 },
    h2: { fontSize: 11, fontWeight: 700, marginTop: 14, marginBottom: 5, color: INK },
    p: { fontSize: 10, color: "#2a3138", marginBottom: 4 },
    item: { marginBottom: 6 },
    itemTitle: { fontSize: 10, fontWeight: 700 },
    itemMeta: { fontSize: 8, color: DIM },
    src: { fontSize: 8, color: DIM, marginBottom: 2 },
    disclaimer: { fontSize: 7.5, color: DIM, marginTop: 16, borderTop: "1pt solid #e2e6ea", paddingTop: 8 },
  });
}

/** A4 daily report PDF generated from the stored report JSON (checklist §11). */
export function DailyReportPdf({ report }: { report: DailySemiReport }) {
  ensureFont();
  const s = styles();
  return (
    <Document title={report.title} author="K-Semi Signal">
      <Page size="A4" style={s.page}>
        <Text style={s.brand}>K-Semi Signal · Morning Brief · {dotDate(report.date)}</Text>
        <Text style={s.title}>{report.title}</Text>
        <Text style={s.subtitle}>{report.subtitle}</Text>

        <View style={s.scoreRow}>
          <Text style={s.score}>{report.cycleScore}</Text>
          <Text style={s.scoreMeta}>/ 100 · {report.cycleLabel}</Text>
        </View>

        <Text style={s.h2}>Executive Summary</Text>
        <Text style={s.p}>{report.executiveSummary}</Text>

        <Text style={s.h2}>Top Signal Changes</Text>
        {report.topChanges.map((sig) => (
          <View key={sig.id} style={s.item}>
            <Text style={s.itemTitle}>
              {sig.title}  ({sig.score >= 0 ? "+" : ""}
              {sig.score})
            </Text>
            <Text style={s.itemMeta}>
              {sig.segment} · {sig.direction} · {sig.confidence}
            </Text>
            <Text style={s.p}>{sig.summary}</Text>
          </View>
        ))}

        <Text style={s.h2}>Risk Radar</Text>
        {report.risks.map((r) => (
          <View key={r.id} style={s.item}>
            <Text style={s.itemTitle}>{r.title}</Text>
            <Text style={s.p}>{r.summary}</Text>
          </View>
        ))}

        <Text style={s.h2}>Scenarios</Text>
        {report.scenarios.map((sc) => (
          <Text key={sc.type} style={s.p}>
            [{sc.type.toUpperCase()} {sc.probability}%] {sc.title} — {sc.summary}
          </Text>
        ))}

        <Text style={s.h2}>Sources</Text>
        {report.sources.map((src) => (
          <Text key={src.id} style={s.src}>
            • {src.title} — {src.publisher}
          </Text>
        ))}

        <Text style={s.disclaimer}>{report.disclaimer}</Text>
      </Page>
    </Document>
  );
}
