"use client";

import QRScannerWidget from "@/components/QRScannerWidget";
import AppIcon from "@/components/icons/AppIcon";
import { useLanguage } from "@/context/LanguageContext";

export default function BeekeeperScanPage() {
  const { language, t } = useLanguage();
  const isHi = language === "hi";

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Dashboard Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {isHi ? "क्यूआर कोड स्कैन करें" : "Scan Honey Jar QR Code"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {isHi
              ? "शहद के जार की प्रामाणिकता, स्रोत बक्सा, लैब रिपोर्ट व आपूर्ति श्रृंखला की जांच करें"
              : "Verify authenticity, hive origin, lab test reports, and supply chain journey"}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 shadow-xs w-fit">
          <AppIcon name="hives" size={14} className="text-amber-700" />
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
            {isHi ? "केवीआईसी स्कैनर" : "KVIC Scanner"}
          </span>
        </div>
      </div>

      {/* Main Interactive Scanner Card */}
      <div className="card overflow-hidden !p-4 sm:!p-6 !border-amber-200/90 !bg-white/95 !shadow-md !rounded-2xl backdrop-blur-xs">
        <QRScannerWidget defaultOpen={true} showDemoBatches={true} />
      </div>

      {/* Trust & Purity Pillars */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-amber-200/80 bg-white shadow-xs flex flex-col gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <AppIcon name="verify" size={18} />
          </div>
          <h3 className="text-xs font-bold text-amber-950">
            {isHi ? "1. कैमरे से स्कैन करें" : "1. Scan with Camera"}
          </h3>
          <p className="text-[11px] text-amber-900/70 leading-normal">
            {isHi
              ? "जार के लेबल पर लगे क्यूआर कोड को स्कैनर के सामने रखें"
              : "Point the camera at any HoneyChain QR label on the jar"}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200/80 bg-white shadow-xs flex flex-col gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <AppIcon name="lab" size={18} />
          </div>
          <h3 className="text-xs font-bold text-amber-950">
            {isHi ? "2. लैब व शुद्धता जांच" : "2. Lab Purity Reports"}
          </h3>
          <p className="text-[11px] text-amber-900/70 leading-normal">
            {isHi
              ? "नमी (<20%) और एचएमएफ स्तर का ऑन-चेन प्रमाण तुरंत देखें"
              : "Verify moisture content (<20%) and zero sugar adulteration"}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200/80 bg-white shadow-xs flex flex-col gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <AppIcon name="hives" size={18} />
          </div>
          <h3 className="text-xs font-bold text-amber-950">
            {isHi ? "3. ब्लॉकचेन सत्यापन" : "3. Blockchain Verified"}
          </h3>
          <p className="text-[11px] text-amber-900/70 leading-normal">
            {isHi
              ? "छत्ते से उपभोक्ता तक का हर चरण अपरिवर्तनीय और सुरक्षित है"
              : "Immutable hash comparison confirms data was never tampered with"}
          </p>
        </div>
      </section>
    </div>
  );
}
