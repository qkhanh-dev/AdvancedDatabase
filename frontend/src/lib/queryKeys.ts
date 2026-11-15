// ============================================================================
// REACT QUERY KEYS CHUẨN v2 (API_Contract_v2 Mục 6)
// ============================================================================

export const QUERY_KEYS = {
  authProfile: ["auth", "profile"] as const,
  patientsLookup: (q: string) => ["patients", "lookup", q] as const,
  patientsList: (page = 1, limit = 50) => ["patients", "list", page, limit] as const,
  insuranceCards: (maBN: string) => ["insurance-cards", maBN] as const,
  examinationDetail: (id: string) => ["examinations", id] as const,
  examinationsList: (status?: string) => ["examinations", "list", status ?? "ALL"] as const,
  medicinesList: ["medicines", "list"] as const,
  labTypesList: ["lab-types", "list"] as const,
  labRequestsPending: ["lab-requests", "pending"] as const,
  labRequestsByStatus: (status?: string) => ["lab-requests", status ?? "ALL"] as const,
  bedsMap: (date: string, maKhoa?: string) => ["beds", "map", date, maKhoa ?? "ALL"] as const,
  inpatientAdmissions: (openOnly?: boolean) =>
    ["inpatient", "admissions", openOnly ? "OPEN" : "ALL"] as const,
  billingPreview: (maLuotKham: string) => ["billing", "preview", maLuotKham] as const,
  billingInvoice: (id: string) => ["billing", "invoice", id] as const,
  departments: ["departments"] as const,
  rooms: (maKhoa?: string) => ["rooms", maKhoa ?? "ALL"] as const,
  staff: (loaiChuyenMon?: string) => ["staff", loaiChuyenMon ?? "ALL"] as const,
  doctors: ["staff", "doctors"] as const,
  technicians: ["staff", "technicians"] as const,
  dashboardReport: (date: string) => ["reports", "dashboard", date] as const,
};
