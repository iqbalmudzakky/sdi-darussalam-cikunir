export const DOKU_PPN_RATE = 0.11;

export const DOKU_MDR_METHODS = [
  { label: "VA BCA", kind: "flat", value: 4500 },
  { label: "VA bank lain", kind: "flat", value: 4000 },
  { label: "QRIS", kind: "flat", value: 4000 },
  { label: "DANA / OVO / ShopeePay", kind: "percent", value: 0.02 },
] as const;
