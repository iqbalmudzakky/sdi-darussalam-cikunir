import fs from "node:fs";
import path from "node:path";
import {
  Document,
  Font,
  Image as PdfImage,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { DecisionLetterContent } from "@/modules/admission-letter/entity";
import {
  DECISION_LETTER_TEXT,
  SCHOOL_CITY,
  SCHOOL_LETTERHEAD,
} from "@/modules/shared/constant/admission/letter";
import { toLetterDate } from "@/modules/shared/date/letterDate";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

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
  kop: { flexDirection: "row", alignItems: "center" },
  logo: { width: 44, height: 44 },
  kopText: {
    flex: 1,
    alignItems: "center",
    paddingRight: 44,
  },
  bold: { fontFamily: "Helvetica-Bold" },
  rule: {
    borderBottomWidth: 1.5,
    marginTop: 6,
    marginBottom: 8,
  },
  paragraph: { marginBottom: 6 },
  row: { flexDirection: "row", marginBottom: 1 },
  label: { width: 70 },
  childLabel: { width: 100 },
  colon: { width: 10 },
  value: { flex: 1 },
  indent: { paddingLeft: 24, marginBottom: 6 },
  signRow: { flexDirection: "row", marginTop: 4 },
  signColumn: { flex: 1, alignItems: "center" },
  signSpace: { height: 52 },
  note: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 8.5,
    marginTop: 8,
  },
});

type DecisionLetterPdfInput = {
  content: DecisionLetterContent;
  isAccepted: boolean;
};

type DecisionLetterProps = {
  input: DecisionLetterPdfInput;
};

type RowProps = {
  label: string;
  value: string;
  isChild?: boolean;
  isBold?: boolean;
};

export async function renderDecisionLetterPdf(
  input: DecisionLetterPdfInput,
): Promise<Buffer> {
  const document = <DecisionLetterDocument input={input} />;
  return renderToBuffer(document);
}

function DecisionLetterDocument({ input }: DecisionLetterProps) {
  const { content, isAccepted } = input;
  const { child } = content;
  const text = DECISION_LETTER_TEXT[isAccepted ? "accepted" : "rejected"];
  const letterDate = toLetterDate(content.letter_date);

  return (
    <Document title={`${text.title} - ${child.full_name}`}>
      <Page size="A4" style={styles.page}>
        <Letterhead />
        <Text style={[styles.paragraph, { textAlign: "right" }]}>
          {SCHOOL_CITY}, {letterDate.dateLabel}
        </Text>
        <Row label="Nomor" value={content.letter_number} />
        <Row label="Hal" value={text.subject} />

        <View style={[styles.paragraph, { marginTop: 6 }]}>
          <Text>Kepada Yth.</Text>
          <Text>Bapak/Ibu Orang Tua/Wali Calon Siswa Baru</Text>
          <Text>SD Islam Darussalam Cikunir</Text>
          <Text>Di</Text>
          <Text>{SCHOOL_CITY}</Text>
        </View>
        <Text style={styles.paragraph}>Assalamu’alaikum Wr.Wb.</Text>
        <Text style={styles.paragraph}>
          Teriring salam kami sampaikan semoga Bapak/Ibu senantiasa dalam
          lindungan Allah SWT dan seluruh aktivitas yang kita lakukan semoga
          mendapat ridho dari-Nya. Amiin.
        </Text>
        <Text style={styles.paragraph}>
          Berdasarkan hasil Wawancara Orang Tua, Observasi dan pertimbangan Usia
          Calon Siswa sampai bulan Juli {content.entry_year}, maka rapat Panitia
          PMB SDI Darussalam Cikunir memutuskan bahwa :
        </Text>

        <View style={styles.indent}>
          <Row label="Nama" value={child.full_name} isChild />
          <Row label="Asal Sekolah" value={child.previous_school} isChild />
          <Row label="Dinyatakan" value={text.result} isChild isBold />
          <Row label="Kelas" value={child.grade_label} isChild />
          <Row label="Dengan Usia" value={child.age_label} isChild />
        </View>
        <Text style={styles.paragraph}>
          Penerimaan Murid Baru SD Islam Darussalam Cikunir mengacu kepada usia
          siswa sesuai data yang diterima oleh panitia.
        </Text>

        {isAccepted && <PaymentBlock content={content} />}
        <Text style={styles.paragraph}>
          Demikian informasi ini kami sampaikan. Atas perhatian dan
          kerjasamanya, kami haturkan terima kasih.
        </Text>
        <Text style={styles.paragraph}>Wassalamu’alaikum Wr.wb</Text>

        <Signatures content={content} />
        {isAccepted && <ContactBlock content={content} />}
      </Page>
    </Document>
  );
}

function Letterhead() {
  const logo = { data: fs.readFileSync(LOGO_PATH), format: "png" as const };

  return (
    <>
      <View style={styles.kop}>
        <PdfImage src={logo} style={styles.logo} />
        <View style={styles.kopText}>
          <Text style={[styles.bold, { fontSize: 9 }]}>
            {SCHOOL_LETTERHEAD.foundation}
          </Text>
          <Text style={[styles.bold, { fontSize: 9 }]}>
            {SCHOOL_LETTERHEAD.institution}
          </Text>
          <Text style={[styles.bold, { fontSize: 12 }]}>
            {SCHOOL_LETTERHEAD.school}
          </Text>
          <Text style={[styles.bold, { fontSize: 8 }]}>
            {SCHOOL_LETTERHEAD.accreditation}
          </Text>
          <Text style={{ fontSize: 7.5 }}>{SCHOOL_LETTERHEAD.address}</Text>
        </View>
      </View>
      <View style={styles.rule} />
    </>
  );
}

function PaymentBlock({ content }: { content: DecisionLetterContent }) {
  const { payment } = content;
  const deadline = payment.deadline
    ? toLetterDate(payment.deadline).dateLabel
    : "-";

  return (
    <>
      <Text style={styles.paragraph}>
        Selanjutnya, silahkan Bapak/Ibu menyelesaikan administrasi paling lambat{" "}
        {deadline}
      </Text>
      <Text style={styles.paragraph}>
        Pembayaran dapat dilakukan melalui transfer ke :
      </Text>
      <View style={[styles.indent, styles.bold]}>
        <Text>{payment.bank_name}</Text>
        <Text>No. A/C {payment.bank_account_number}</Text>
        <Text>a/n {payment.bank_account_name}</Text>
      </View>
    </>
  );
}

function Signatures({ content }: { content: DecisionLetterContent }) {
  const { signers } = content;

  return (
    <View style={styles.signRow} wrap={false}>
      <View style={styles.signColumn}>
        <Text>Mengetahui,</Text>
        <View style={styles.signSpace} />
        <Text style={styles.bold}>{signers.principal_name}</Text>
        <Text>Kepala SD Islam Darussalam Cikunir</Text>
      </View>
      <View style={styles.signColumn}>
        <Text>Panitia PMB</Text>
        <View style={styles.signSpace} />
        <Text style={styles.bold}>{signers.committee_chair_name}</Text>
        <Text>Ketua</Text>
      </View>
    </View>
  );
}

function ContactBlock({ content }: { content: DecisionLetterContent }) {
  return (
    <View wrap={false}>
      <Text style={styles.note}>
        CATATAN : Foto copy bukti transfer diserahkan ke Bagian Keuangan.
      </Text>
      <Text style={{ marginTop: 6 }}>Contact :</Text>
      {content.contacts.map((contact, index) => (
        <Text key={`${contact.name}-${index}`}>
          {index + 1}. {contact.name} ({contact.phone})
        </Text>
      ))}
    </View>
  );
}

function Row({ label, value, isChild, isBold }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={isChild ? styles.childLabel : styles.label}>{label}</Text>
      <Text style={styles.colon}>:</Text>
      <Text style={[styles.value, isBold ? styles.bold : {}]}>
        {value || "-"}
      </Text>
    </View>
  );
}
