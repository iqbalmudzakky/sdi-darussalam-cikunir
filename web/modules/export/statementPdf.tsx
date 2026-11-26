import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
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
import type {
  StatementContent,
  StatementFees,
  StatementParent,
} from "@/modules/admission-letter/entity";
import { SCHOOL_CITY } from "@/modules/shared/constant/admission/letter";
import { toLetterDate } from "@/modules/shared/date/letterDate";
import { formatRupiah } from "@/modules/shared/format/rupiah";

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
  kop: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 52, height: 52 },
  rule: { borderBottomWidth: 1.5, marginTop: 6, marginBottom: 8 },
  title: { textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 12 },
  subtitle: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 6,
  },
  paragraph: { marginBottom: 4 },
  row: { flexDirection: "row", marginBottom: 2 },
  label: { width: 150 },
  colon: { width: 10 },
  value: { flex: 1 },
  indent: { paddingLeft: 14 },
  indentDeep: { paddingLeft: 34 },
  bold: { fontFamily: "Helvetica-Bold" },
  signRow: { flexDirection: "row", marginTop: 10 },
  signColumn: { flex: 1, alignItems: "center" },
  signSpace: { height: 46 },
});

type StatementPdfProps = {
  content: StatementContent;
};

type ParentBlockProps = {
  title: string;
  parent: StatementParent;
  children: ReactNode;
};

type ProgramBlockProps = {
  code: string;
  name: string;
  yearly: number;
  july: number;
  fees: StatementFees;
  julyYear: string;
};

export async function renderStatementPdf(
  content: StatementContent,
): Promise<Buffer> {
  return renderToBuffer(<StatementDocument content={content} />);
}

function StatementDocument({ content }: StatementPdfProps) {
  const { father, mother, child, fees } = content;
  const letterDate = toLetterDate(content.letter_date);
  const julyYear = child.academic_year.split("/")[0];
  const birthDate = child.date_of_birth
    ? child.date_of_birth.split("-").reverse().join("/")
    : "-";
  const motherAddress = mother.address;
  const motherAddressLabel = mother.same_address
    ? "SDA"
    : `${motherAddress.street} RT ${motherAddress.rt} RW ${motherAddress.rw}, ${motherAddress.village}, ${motherAddress.district}, ${motherAddress.city}, ${motherAddress.province} ${motherAddress.postal_code}`;

  return (
    <Document title={`Surat Pernyataan - ${child.full_name}`}>
      <Page size="A4" style={styles.page}>
        <Letterhead />
        <Text style={styles.title}>SURAT PERNYATAAN</Text>
        <Text style={styles.subtitle}>MAMPU MEMBAYAR BIAYA PENDIDIKAN</Text>
        <Text style={styles.paragraph}>
          Assalamu’alaikum warahmatullahi wabarakatuh
        </Text>
        <Text style={styles.paragraph}>
          Pada hari ini {letterDate.spelledLabel}
        </Text>
        <Text style={styles.paragraph}>
          Kami yang bertanda tangan di bawah ini :
        </Text>

        <Text>1. Nama Bapak</Text>
        <ParentBlock title="Bapak" parent={father}>
          <Row
            label="A l a m a t"
            value={`Dusun ${father.address.street}   RT ${father.address.rt}   RW ${father.address.rw}`}
          />
          <Row
            label=""
            value={`Kelurahan ${father.address.village}   Kode Pos ${father.address.postal_code}`}
          />
          <Row
            label=""
            value={`Kecamatan ${father.address.district}, Kab/Kota ${father.address.city}, Provinsi ${father.address.province}`}
          />
        </ParentBlock>

        <Text>2. Nama Ibu</Text>
        <ParentBlock title="Ibu" parent={mother}>
          <Row label="A l a m a t" value={motherAddressLabel} />
        </ParentBlock>

        <Text>Adalah orang tua/wali dari :</Text>
        <View style={styles.indent}>
          <Row label="Nama lengkap anak" value={child.full_name} />
          <Row
            label="Tempat/tanggal lahir"
            value={`${child.place_of_birth}, ${birthDate}`}
          />
          <Row label="K e l a s" value={child.grade_label} />
        </View>

        <ClauseA academicYear={child.academic_year} />
        <ProgramBlock
          code="A.4."
          name="Tahfizh"
          yearly={fees.tahfizh_yearly_fee}
          july={fees.tahfizh_july_fee}
          fees={fees}
          julyYear={julyYear}
        />
        <ProgramBlock
          code="A.5."
          name="Unggulan"
          yearly={fees.unggulan_yearly_fee}
          july={fees.unggulan_july_fee}
          fees={fees}
          julyYear={julyYear}
        />
        <ClausesBToE />

        <Text style={{ textAlign: "right" }}>
          {SCHOOL_CITY}, {letterDate.hijriLabel} / {letterDate.dateLabel}
        </Text>
        <Signatures content={content} />
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
        <View>
          <Text style={styles.bold}>
            Yayasan Pembangunan Umat Islam Darussalam
          </Text>
          <Text style={[styles.bold, { fontSize: 15, lineHeight: 1.3 }]}>
            Perguruan Islam Darussalam
          </Text>
          <Text
            style={{
              fontFamily: "Helvetica-Oblique",
              fontSize: 9,
              marginTop: 2,
            }}
          >
            Amanah Profesional dan Prestisius
          </Text>
        </View>
      </View>
      <View style={styles.rule} />
    </>
  );
}

function ParentBlock({ title, parent, children }: ParentBlockProps) {
  return (
    <View style={styles.indent}>
      <Row label={`Nama ${title}`} value={parent.name} />
      <Row label="No. Identitas Diri/KTP" value={parent.nik} />
      <Row label="P e k e r j a a n" value={parent.occupation} />
      {children}
      <Row label="No. Telp. / HP" value={parent.phone} />
    </View>
  );
}

function ClauseA({ academicYear }: { academicYear: string }) {
  return (
    <>
      <Text style={styles.paragraph}>
        Apabila anak kami diterima sebagai Murid Baru di Unit Pelaksana
        Pendidikan Perguruan Islam Darussalam (TK Islam, SD Islam, SMP Islam dan
        SMA Islam), Tahun Pelajaran {academicYear} maka dengan ini kami
        menyatakan bahwa :
      </Text>
      <Text style={styles.paragraph}>
        A. Kami bersedia dan sanggup menyelesaikan biaya Pendidikan anak kami
        berupa; Uang Awal Tahun, SPP dan Uang KBM sesuai dengan ketentuan yang
        berlaku di Unit Pelaksana Pendidikan Perguruan Islam Darussalam ( TK
        Islam, SD Islam, SMP Islam dan SMA Islam ).
      </Text>
      <View style={styles.indent}>
        <Text style={styles.paragraph}>
          A.1. Uang Awal Tahun adalah biaya Pendidikan yang terdiri dari Uang
          Infaq Bangunan, Uang Seragam, Infaq Kemasjidan dan Uang Kegiatan
          Belajar Mengajar ( KBM ).
        </Text>
        <Text>A.2. Iuran Bulanan</Text>
      </View>
      <View style={styles.indentDeep}>
        <Text>
          * Iuran Bulanan adalah Sumbangan Pembinaan Pendidikan Murid yang
          dibayarkan rutin setiap bulan.
        </Text>
        <Text>
          * Pembayaran Iuran Bulanan siswa paling lambat tanggal 10 setiap bulan
          berjalan
        </Text>
        <Text style={styles.paragraph}>
          * Iuran Bulanan mengalami penyesuaian sebesar 5-10 Persen setiap Tahun
          Pelajaran.
        </Text>
      </View>
      <View style={styles.indent}>
        <Text style={styles.paragraph}>
          A.3. Uang KBM adalah Uang Kegiatan Belajar Mengajar ( KBM ) yang
          dibayarkan setiap Awal Tahun Pelajaran. Biaya KBM mengalami
          penyesuaian harga sebesar 5-10 Persen tiap tahunnya.
        </Text>
      </View>
    </>
  );
}

function ProgramBlock({
  code,
  name,
  yearly,
  july,
  fees,
  julyYear,
}: ProgramBlockProps) {
  const total = yearly + july;
  const darussalamTotal = total - fees.darussalam_discount;
  const otherTotal = total - fees.other_discount;
  const deadline = fees.payment_deadline
    ? toLetterDate(fees.payment_deadline).dateLabel
    : "-";

  return (
    <View wrap={false}>
      <View style={styles.indent}>
        <Text>
          {code} Kami sanggup membayar uang masuk untuk anak kami sebagai Murid
          Kelas I (Satu) {name} sebesar {formatRupiah(total)},- yang meliputi
          uang Awal Tahun ({formatRupiah(yearly)},-) dan Iuran bulan Juli{" "}
          {julyYear} ( {formatRupiah(july)},-) dengan diskon :
        </Text>
      </View>
      <View style={[styles.indentDeep, styles.paragraph]}>
        <Text>
          a). Lulusan TK Islam Darussalam{" "}
          {formatRupiah(fees.darussalam_discount)},- ={" "}
          {formatRupiah(darussalamTotal)},-
        </Text>
        <Text>
          b). Lulusan TK Non Darussalam {formatRupiah(fees.other_discount)},- ={" "}
          {formatRupiah(otherTotal)},-
        </Text>
        <Text>
          dibayar paling lambat {deadline} dan tidak akan menarik kembali uang
          tersebut apabila mengundurkan diri.
        </Text>
      </View>
    </View>
  );
}

function ClausesBToE() {
  return (
    <>
      <Text style={styles.paragraph}>
        B. Kami bersedia mematuhi peraturan keuangan yang berlaku di Perguruan
        Islam Darussalam dengan memenuhi kewajiban pelunasan atas biaya
        Pendidikan anak kami yang terdiri dari Uang Awal Tahun, SPP dan Uang KBM
        sesuai dengan batas waktu yang telah ditentukan sebagai syarat untuk :
      </Text>
      <View style={[styles.indent, styles.paragraph]}>
        <Text>
          a. Mengikuti pelaksanaan Ulangan Tengah Semester, Ulangan Semester dan
          Ujian Sekolah/Kelulusan
        </Text>
        <Text>b. Pengambilan Raport dan Nilai Akhir</Text>
        <Text>c. Pengambilan Surat Mutasi Pindah Sekolah ( Dapodik )</Text>
        <Text>
          d. Pengambilan Ijazah dan atau Administrasi surat Keterangan Kelulusan
        </Text>
      </View>
      <Text style={styles.paragraph}>
        C. Apabila menerima Surat Pemberitahuan Tagihan, maka Kami segera
        menyelesaikan tagihan tunggakan anak Kami.
      </Text>
      <Text style={styles.paragraph}>
        D. Membuat Surat Pernyataan pengunduran diri atau pindah Sekolah,
        Apabila kami tidak sanggup memenuhi kewajiban keuangan.
      </Text>
      <Text style={styles.paragraph}>
        E. Apabila ada Kegiatan Belajar Mengajar diluar pembiayaan Awal Tahun
        diatas maka akan dimusyawarahkan.
      </Text>
      <Text style={styles.paragraph}>
        Demikian surat pernyataan ini ditanda tangani tanpa adanya tekanan dari
        pihak manapun untuk dapat digunakan sebagaimana mestinya.
      </Text>
      <Text style={styles.paragraph}>
        Wassalamu’alaikum warahmatullahiwabarakatuh
      </Text>
    </>
  );
}

function Signatures({ content }: StatementPdfProps) {
  const { father, mother, signers } = content;

  return (
    <>
      <View style={styles.signRow} wrap={false}>
        <View style={styles.signColumn}>
          <Text>Mengetahui</Text>
          <Text> </Text>
          <View style={styles.signSpace} />
          <Text style={styles.bold}>{signers.principal_name}</Text>
          <Text>KEPALA SDI DARUSSALAM CIKUNIR</Text>
        </View>
        <View style={[styles.signColumn, { flex: 2 }]}>
          <Text>Orang Tua/Wali Murid</Text>
          <View style={{ flexDirection: "row", width: "100%" }}>
            <View style={styles.signColumn}>
              <Text>Suami</Text>
              <View style={styles.signSpace} />
              <Text style={styles.bold}>{father.name}</Text>
            </View>
            <View style={styles.signColumn}>
              <Text>Istri</Text>
              <View style={styles.signSpace} />
              <Text style={styles.bold}>{mother.name}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{ alignItems: "center", marginTop: 14 }} wrap={false}>
        <Text>Menyetujui,</Text>
        <View style={styles.signSpace} />
        <Text style={styles.bold}>{signers.director_name}</Text>
        <Text>D I R E K T U R</Text>
      </View>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.colon}>:</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}
