import React from 'react';

/**
 * GSTBill — Printable GST Tax Invoice (SAC Code 9988)
 *
 * Props:
 *   booking: {
 *     orderTotal, bookingId, customerName, tailorName,
 *     vendorName, garmentType, fabricName, date
 *   }
 */
export default function GSTBill({ booking = {} }) {
  const {
    orderTotal   = 0,
    bookingId    = 'N/A',
    customerName = 'Customer',
    tailorName   = 'Tailor',
    vendorName   = 'Vendor',
    garmentType  = 'Garment',
    fabricName   = 'Fabric',
    date         = new Date().toISOString(),
  } = booking;

  const baseAmount = Number(orderTotal) || 0;
  const cgst       = +(baseAmount * 0.025).toFixed(2);
  const sgst       = +(baseAmount * 0.025).toFixed(2);
  const totalTax   = +(cgst + sgst).toFixed(2);
  const grandTotal = +(baseAmount + totalTax).toFixed(2);
  const invoiceNo  = `SNV-${bookingId?.toString().substring(0, 8).toUpperCase() || 'XXXXXX'}`;
  const invoiceDate = new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #gst-bill, #gst-bill * { visibility: visible; }
          #gst-bill { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="gst-bill" className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-purple-700 to-pink-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">SewNova</h1>
              <p className="text-purple-200 text-xs mt-0.5">Custom Tailoring Platform</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold uppercase tracking-widest">Tax Invoice</p>
              <p className="text-purple-200 text-xs">GST Compliant</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* ── Invoice meta + parties ─────────────────────────── */}
          <div className="grid grid-cols-2 gap-6">
            {/* Bill To */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Bill To</p>
              <p className="text-sm font-bold text-gray-900">{customerName}</p>
              <p className="text-xs text-gray-500 mt-1">SewNova Customer</p>
            </div>
            {/* Service By */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Service By</p>
              <p className="text-sm font-bold text-gray-900">✂️ {tailorName}</p>
              <p className="text-xs text-gray-500 mt-1">🏭 Fabric: {vendorName}</p>
            </div>
          </div>

          {/* Invoice details row */}
          <div className="flex flex-wrap gap-6 text-xs">
            <div>
              <span className="text-gray-400 font-medium">Invoice No:</span>
              <span className="ml-1 font-bold text-gray-800">{invoiceNo}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Date:</span>
              <span className="ml-1 font-bold text-gray-800">{invoiceDate}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium">SAC Code:</span>
              <span className="ml-1 font-bold text-gray-800">9988</span>
            </div>
          </div>

          {/* ── Items Table ────────────────────────────────────── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">HSN/SAC</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 text-gray-600">1</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    Tailoring Service — {garmentType}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono">9988</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(baseAmount)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-600">2</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    Fabric — {fabricName}
                    <span className="text-[10px] text-gray-400 ml-1">(included in total)</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono">5007</td>
                  <td className="px-4 py-3 text-right text-gray-400">{fmt(0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Tax Summary ────────────────────────────────────── */}
          <div className="flex justify-end">
            <div className="w-72 border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">{fmt(baseAmount)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 text-sm border-t border-gray-100">
                <span className="text-gray-600">CGST @ 2.5%</span>
                <span className="font-medium text-gray-800">{fmt(cgst)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 text-sm border-t border-gray-100">
                <span className="text-gray-600">SGST @ 2.5%</span>
                <span className="font-medium text-gray-800">{fmt(sgst)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm border-t-2 border-purple-200 bg-purple-50">
                <span className="font-bold text-purple-800">Grand Total</span>
                <span className="font-extrabold text-purple-800 text-base">{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* ── Footer ─────────────────────────────────────────── */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-[10px] text-gray-400 text-center">
              This is a computer-generated invoice and does not require a physical signature.
            </p>
            <p className="text-[10px] text-gray-400 text-center">
              GST is applicable as per the Goods and Services Tax Act, 2017.
              SAC 9988 — Other manufacturing services; publishing, printing and reproduction services; materials recovery services.
            </p>
          </div>
        </div>

        {/* ── Print Button ─────────────────────────────────────── */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 no-print">
          <button
            onClick={() => window.print()}
            className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print Invoice
          </button>
        </div>
      </div>
    </>
  );
}
