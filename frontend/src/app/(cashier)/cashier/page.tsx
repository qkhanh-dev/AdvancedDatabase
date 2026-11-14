"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  QrCode,
  FileCheck,
  Calculator,
  Download,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hospitalApi } from "@/services/hospitalApi";
import {
  FeeCalculationResponse,
  HoaDon,
  HinhThucTTEnum,
  TrangThaiHoaDonEnum,
} from "@/types";

export default function CashierPage() {
  const [examId, setExamId] = useState("");
  const [feeBreakdown, setFeeBreakdown] = useState<FeeCalculationResponse | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState<HoaDon | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Invoice creation form
  const [hinhThucTT, setHinhThucTT] = useState<HinhThucTTEnum>(HinhThucTTEnum.TIEN_MAT);
  const [nhanVienThu] = useState("NV_TN_01");

  // Webhook simulation form
  const [webhookData, setWebhookData] = useState({
    invoiceId: "",
    amount: 0,
    transactionId: "TXN_" + Date.now().toString().slice(-6),
    signature: "mock_signature_test",
  });

  const handleCalculateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await hospitalApi.billing.calculateFee(examId.trim());
      setFeeBreakdown(res);
      setFeedback({ type: "success", text: "Tính toán viện phí & bóc tách BHYT thành công!" });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi tính toán viện phí.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!examId.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const inv = await hospitalApi.billing.createInvoice({
        MaLK: examId.trim(),
        HinhThucTT: hinhThucTT,
        NhanVienThu: nhanVienThu,
      });
      setCreatedInvoice(inv);
      setWebhookData((prev) => ({
        ...prev,
        invoiceId: inv.MaHD,
        amount: Number(inv.SoTien),
      }));
      setFeedback({
        type: "success",
        text: `Lập hóa đơn thành công: ${inv.MaHD}! Tổng số tiền: ${Number(inv.SoTien).toLocaleString()} đ`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi tạo hóa đơn viện phí.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!webhookData.invoiceId) {
      setFeedback({ type: "error", text: "Vui lòng nhập hoặc lập hóa đơn trước khi quét mã/gửi Webhook." });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      await hospitalApi.billing.webhookVietQr({
        invoiceId: webhookData.invoiceId,
        amount: Number(webhookData.amount),
        transactionId: webhookData.transactionId,
        signature: webhookData.signature,
      });
      setFeedback({
        type: "success",
        text: `Webhook VietQR xử lý thành công! Giao dịch ${webhookData.transactionId} đã xác nhận thanh toán.`,
      });
      // Fetch updated invoice
      const updated = await hospitalApi.billing.getInvoiceById(webhookData.invoiceId);
      setCreatedInvoice(updated);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi xử lý Webhook VietQR.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const invId = createdInvoice?.MaHD || webhookData.invoiceId;
    if (!invId) {
      setFeedback({ type: "error", text: "Chưa có hóa đơn để xuất PDF." });
      return;
    }
    setDownloading(true);
    try {
      const blob = await hospitalApi.billing.downloadPdf(invId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bien_Lai_${invId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFeedback({ type: "success", text: `Đã xuất hóa đơn PDF thành công cho ${invId}!` });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi tải file biên lai PDF.",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-purple-600" /> Phân Hệ Thu Ngân Viện Phí & Quyết Toán BHYT
            </h1>
            <p className="text-sm text-slate-500">
              Quản lý HOA_DON, tự động bóc tách mức hưởng BHYT (80-100%), quét VietQR và xuất biên lai PDFKit
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Exam ID & Calculation */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-purple-600" /> 1. Tra Cứu & Tính Viện Phí
              </CardTitle>
              <CardDescription className="text-xs">
                Nhập Mã lượt khám để tổng hợp viện phí và bóc tách BHYT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleCalculateFee} className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700">Mã Lượt Khám (MaLK) *</label>
                  <input
                    type="text"
                    required
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                    placeholder="Ví dụ: LK202611140001"
                    className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full text-xs bg-purple-600 hover:bg-purple-700">
                  {loading ? "Đang tính toán..." : "Tính Toán Viện Phí"}
                </Button>
              </form>

              {feeBreakdown && (
                <div className="pt-3 border-t border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{feeBreakdown.patientName}</span>
                    <Badge variant={feeBreakdown.bhytNumber ? "success" : "secondary"}>
                      {feeBreakdown.bhytNumber ? `BHYT (${((feeBreakdown.coverageRate ?? 0) * 100)}%)` : "Không BHYT"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-lg border">
                    <div className="flex justify-between">
                      <span>Tiền khám bệnh:</span>
                      <span className="font-medium">{(feeBreakdown.examFee ?? 0).toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiền thuốc:</span>
                      <span className="font-medium">{(feeBreakdown.medicineFee ?? 0).toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiền cận lâm sàng:</span>
                      <span className="font-medium">{(feeBreakdown.serviceFee ?? 0).toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t text-slate-800">
                      <span>Tổng viện phí gốc:</span>
                      <span>{(feeBreakdown.totalCost ?? 0).toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Quỹ BHYT chi trả:</span>
                      <span>- {(feeBreakdown.bhytPaid ?? 0).toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-purple-700 pt-2 border-t">
                      <span>Bệnh nhân thanh toán:</span>
                      <span>{(feeBreakdown.patientPaid ?? 0).toLocaleString()} đ</span>
                    </div>
                  </div>

                  {/* Create Invoice Controls */}
                  <div className="space-y-2 pt-2">
                    <label className="font-medium text-slate-700 block">Hình thức thanh toán:</label>
                    <select
                      value={hinhThucTT}
                      onChange={(e) => setHinhThucTT(e.target.value as HinhThucTTEnum)}
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 bg-white"
                    >
                      <option value={HinhThucTTEnum.TIEN_MAT}>Tiền mặt (TIEN_MAT)</option>
                      <option value={HinhThucTTEnum.CHUYEN_KHOAN}>Chuyển khoản VietQR (CHUYEN_KHOAN)</option>
                      <option value={HinhThucTTEnum.THE_ATM}>Thẻ ATM / POS (THE_ATM)</option>
                      <option value={HinhThucTTEnum.DONG_CHI_TRA}>Đồng chi trả (DONG_CHI_TRA)</option>
                    </select>

                    <Button
                      onClick={handleCreateInvoice}
                      disabled={loading}
                      className="w-full text-xs bg-purple-600 hover:bg-purple-700 gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" /> Lập Hóa Đơn Thanh Toán
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center & Right Columns: Invoice Details, VietQR Webhook, PDFKit */}
        <div className="lg:col-span-2 space-y-6">
          {createdInvoice ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-purple-600" /> Hóa Đơn Viện Phí: {createdInvoice.MaHD}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Thời gian lập: {new Date(createdInvoice.NgayLap).toLocaleString("vi-VN")}
                    </CardDescription>
                  </div>
                  <Badge variant={createdInvoice.TrangThai === TrangThaiHoaDonEnum.DA_THANH_TOAN ? "success" : "warning"}>
                    {createdInvoice.TrangThai}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div><span className="text-slate-500">Mã Lượt Khám:</span> <p className="font-semibold">{createdInvoice.MaLK}</p></div>
                  <div><span className="text-slate-500">Hình thức TT:</span> <p className="font-semibold">{createdInvoice.HinhThucTT}</p></div>
                  <div><span className="text-slate-500">Thu ngân:</span> <p className="font-semibold">{createdInvoice.NhanVienThu || "NV_TN_01"}</p></div>
                  <div><span className="text-slate-500">Số tiền phải thu:</span> <p className="font-bold text-purple-700 text-sm">{Number(createdInvoice.SoTien).toLocaleString()} đ</p></div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                    variant="outline"
                    className="gap-2 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {downloading ? "Đang xuất PDF..." : "Tải Hóa Đơn PDF (PDFKit)"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 text-xs">
              Vui lòng nhập Mã lượt khám và bấm &quot;Tính Toán Viện Phí&quot; để tiến hành lập hóa đơn.
            </Card>
          )}

          {/* Card 3: Giả lập Cổng Thanh Toán Webhook VietQR */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-600" /> Giả Lập Cổng Thanh Toán Webhook VietQR (HMAC Idempotency)
              </CardTitle>
              <CardDescription className="text-xs">
                Mô phỏng máy chủ thanh toán gửi thông báo hoàn tất chuyển khoản
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-slate-700">Mã Hóa Đơn *</label>
                    <input
                      type="text"
                      value={webhookData.invoiceId}
                      onChange={(e) => setWebhookData({ ...webhookData, invoiceId: e.target.value })}
                      placeholder="Mã hóa đơn (VD: HD202611140001)"
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700">Số tiền thanh toán (VNĐ) *</label>
                    <input
                      type="number"
                      value={webhookData.amount}
                      onChange={(e) => setWebhookData({ ...webhookData, amount: Number(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700">Mã giao dịch ngân hàng (TxnID) *</label>
                    <input
                      type="text"
                      value={webhookData.transactionId}
                      onChange={(e) => setWebhookData({ ...webhookData, transactionId: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700">Chữ ký HMAC-SHA256</label>
                    <input
                      type="text"
                      value={webhookData.signature}
                      onChange={(e) => setWebhookData({ ...webhookData, signature: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSimulateWebhook}
                  disabled={loading}
                  className="w-full text-xs bg-purple-600 hover:bg-purple-700 gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" /> Gửi Tín Hiệu Webhook Thanh Toán
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
