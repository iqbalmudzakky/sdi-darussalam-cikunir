import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createCheckoutSession } from "@/modules/payment/doku";
import type { RegistrationPayload } from "@/modules/payment/entity";

/*
 * TEMPORARY: verifies the production DOKU switch actually works end-to-end.
 * Talks to DOKU directly and never touches registration_payments/ppdb_*, so a
 * successful test payment does not create a fake registration. Delete this
 * route (and its Navbar button) once production is confirmed working.
 */

const TEST_AMOUNT = 15000;

const DUMMY_PAYLOAD: RegistrationPayload = {
  registration_type: "siswa_baru",
  parent_email: null,
  student: {
    full_name: "Test Pembayaran",
    nickname: null,
    nik: "0000000000000000",
    nisn: null,
    gender: "laki_laki",
    place_of_birth: "Bekasi",
    date_of_birth: "2015-01-01",
    address: "-",
    village: "-",
    rt_rw: "-",
    district: "-",
    city: "-",
    province: "-",
    phone: null,
    birth_order: 1,
    sibling_count: 0,
    orphan_status: null,
    daily_language: null,
    citizenship: "Indonesia",
    religion: "Islam",
    physical_disability: "tidak_ada",
    previous_school: "-",
    previous_school_transfer: null,
  },
  parents: [
    {
      parent_type: "father",
      relationship_status: "kandung",
      name: "Test Orang Tua",
      nik: "0000000000000000",
      place_of_birth: "Bekasi",
      date_of_birth: "1985-01-01",
      religion: "Islam",
      education: null,
      occupation: null,
      position: null,
      income: null,
      citizenship: "Indonesia",
      phone: "081200000000",
    },
  ],
  details: {
    living_with: null,
    distance_to_school: null,
    owned_vehicle: null,
    transportation_method: null,
    talent: null,
    blood_type: null,
    height: null,
    weight: null,
    head_circumference: null,
  },
};

export async function POST(request: Request) {
  if (process.env.DOKU_ENV !== "production") {
    return NextResponse.json(
      { error: "Test checkout ini hanya untuk memverifikasi mode production." },
      { status: 400 },
    );
  }

  const invoiceNumber = `TEST-${randomBytes(4).toString("hex").toUpperCase()}`;

  const result = await createCheckoutSession({
    invoiceNumber,
    amount: TEST_AMOUNT,
    payload: DUMMY_PAYLOAD,
    request,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 502 });
  }

  return NextResponse.json({ payment_url: result.session.paymentUrl });
}
