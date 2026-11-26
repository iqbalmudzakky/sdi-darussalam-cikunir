import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ObservationViewResponse } from "@/modules/observation/dto";
import { OBSERVATION_INDICATOR_COUNT } from "@/modules/shared/constant/admission/observation";

const COLUMN_WIDTHS = [26, 145, 80, 55, 75, 110];

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 52,
    fontSize: 9.5,
    lineHeight: 1.4,
    fontFamily: "Helvetica",
  },
  title: { textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 13 },
  subtitle: { textAlign: "center", fontSize: 10, marginBottom: 10 },
  identity: { flexDirection: "row", gap: 16, marginBottom: 10 },
  identityColumn: { flex: 1 },
  row: { flexDirection: "row", marginBottom: 2 },
  colon: { width: 10 },
  value: { flex: 1 },
  tableRow: {
    flexDirection: "row",
    borderWidth: 0.75,
    borderColor: "#9CA3AF",
    marginTop: -0.75,
  },
  headerRow: { backgroundColor: "#E8EFE9", fontFamily: "Helvetica-Bold" },
  totalRow: { backgroundColor: "#F3F4F6", fontFamily: "Helvetica-Bold" },
  cell: { paddingVertical: 4, paddingHorizontal: 5, textAlign: "center" },
  cellLeft: { textAlign: "left" },
  section: { fontFamily: "Helvetica-Bold", fontSize: 10, marginTop: 14 },
});

type ReadinessProfilePdfProps = {
  observation: ObservationViewResponse;
};

export async function renderReadinessProfilePdf(
  observation: ObservationViewResponse,
): Promise<Buffer> {
  return renderToBuffer(<ReadinessProfileDocument observation={observation} />);
}

function ReadinessProfileDocument({ observation }: ReadinessProfilePdfProps) {
  const { profile } = observation;

  return (
    <Document title={`Profil Kesiapan - ${observation.full_name}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PROFIL KESIAPAN CALON MURID</Text>
        <Text style={styles.subtitle}>
          SD ISLAM DARUSSALAM CIKUNIR • TA {observation.academic_year ?? "-"}
        </Text>

        <IdentityBlock observation={observation} />

        <TableRow
          cells={[
            "No",
            "Dimensi Kesiapan",
            "Jumlah Indikator",
            "Skor Maks.",
            "Skor Perolehan",
            "Kategori",
          ]}
          variant="header"
        />
        {observation.dimensions.map((dimension, index) => (
          <TableRow
            key={dimension.name}
            cells={[
              String(index + 1),
              dimension.name,
              String(dimension.indicators.length),
              String(dimension.max_score),
              String(dimension.score),
              dimension.category?.label ?? "-",
            ]}
          />
        ))}
        <TableRow
          cells={[
            "",
            "TOTAL",
            String(OBSERVATION_INDICATOR_COUNT),
            String(profile.max_score),
            String(profile.score),
            profile.conclusion?.label ?? "-",
          ]}
          variant="total"
        />

        <SummaryBlock observation={observation} />
      </Page>
    </Document>
  );
}

function IdentityBlock({ observation }: ReadinessProfilePdfProps) {
  const birthDate = observation.date_of_birth.split("-").reverse().join("/");
  const observedOn = observation.observed_on.split("-").reverse().join("/");

  return (
    <View style={styles.identity}>
      <View style={styles.identityColumn}>
        <Row
          label="Nama Calon Murid"
          value={observation.full_name}
          width={110}
        />
        <Row label="Tanggal Lahir" value={birthDate} width={110} />
        <Row label="Tanggal Observasi" value={observedOn} width={110} />
        <Row
          label="Usia Pada Bulan Juli"
          value={observation.entry_age_text ?? "-"}
          width={110}
        />
      </View>
      <View style={styles.identityColumn}>
        <Row
          label="Nomor Pendaftaran"
          value={observation.registration_number ?? "-"}
          width={100}
        />
        <Row
          label="Asal TK/RA/PAUD"
          value={observation.previous_school}
          width={100}
        />
        <Row
          label="Observer"
          value={observation.observer_name ?? "-"}
          width={100}
        />
        <Row label="Note" value={observation.note ?? "-"} width={100} />
      </View>
    </View>
  );
}

function SummaryBlock({ observation }: ReadinessProfilePdfProps) {
  const { profile } = observation;

  return (
    <>
      <Text style={styles.section}>RINGKASAN PROFIL</Text>
      <Row
        label="Kesimpulan umum"
        value={profile.conclusion?.label ?? "-"}
        width={150}
      />
      <Row
        label="Dimensi paling kuat"
        value={profile.strongest ?? "-"}
        width={150}
      />
      <Row
        label="Dimensi yang perlu diperkuat"
        value={profile.weakest ?? "-"}
        width={150}
      />
      <Row
        label="Catatan/Rekomendasi"
        value={observation.recommendation ?? "-"}
        width={150}
      />
    </>
  );
}

type RowProps = {
  label: string;
  value: string;
  width: number;
};

function Row({ label, value, width }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={{ width }}>{label}</Text>
      <Text style={styles.colon}>:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

type TableRowProps = {
  cells: string[];
  variant?: "header" | "total";
};

function TableRow({ cells, variant }: TableRowProps) {
  const variantStyle =
    variant === "header"
      ? styles.headerRow
      : variant === "total"
        ? styles.totalRow
        : {};

  return (
    <View style={[styles.tableRow, variantStyle]} wrap={false}>
      {cells.map((cell, index) => (
        <Text
          key={index}
          style={[
            styles.cell,
            { width: COLUMN_WIDTHS[index] },
            index === 1 ? styles.cellLeft : {},
          ]}
        >
          {cell}
        </Text>
      ))}
    </View>
  );
}
