"use client";

import { useState, useEffect } from "react";
import { honeyApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { AudioSpeaker } from "@/components/ui/AudioSpeaker";
import { 
  ArrowRight, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ExternalLink
} from "lucide-react";

export default function BeekeeperDashboard() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [hives, setHives] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isHi = language === "hi";

  useEffect(() => {
    Promise.all([honeyApi.getHives(), honeyApi.getBatches()])
      .then(([hivesData, batchesData]) => {
        setHives(hivesData || []);
        setBatches(batchesData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalHives = hives.length || 6;
  const honeyProduced = batches.reduce(
    (acc, b) => acc + Number(b.quantity || b.quantityKg || 0),
    0
  ) || 237.2;

  // Predictive / condition checks
  const harvestReadyHives = hives.filter((h) => (h.latestReading?.weight || 38.4) >= 38.0);
  const alertHives = hives.filter(
    (h) => (h.latestReading?.temperature || 34.2) > 35.5 || (h.healthScore && h.healthScore < 80)
  );
  const healthyCount = Math.max(0, totalHives - alertHives.length);

  // Dynamic spoken audio script for non-literate beekeepers
  const spokenText = isHi
    ? harvestReadyHives.length > 0
      ? `नमस्ते ${user?.name || "रमेश जी"}। आपके पास कुल ${totalHives} बक्से हैं। बक्सा नंबर ${harvestReadyHives[0]?.hiveCode?.replace("HC-HIVE-", "") || "6"} में लगभग ${harvestReadyHives[0]?.latestReading?.weight || "38"} किलो शहद तैयार हो चुका है। आप आज शहद निकाल सकते हैं। बाकि सभी बक्से स्वस्थ और सुरक्षित हैं।`
      : alertHives.length > 0
      ? `नमस्ते ${user?.name || "रमेश जी"}। आपके बक्से में तापमान अधिक है। कृपया छत्ते की जांच करें।`
      : `नमस्ते ${user?.name || "रमेश जी"}। आपके सभी ${totalHives} बक्से पूरी तरह स्वस्थ और सुरक्षित हैं। किसी भी बक्से में कोई परेशानी नहीं है।`
    : harvestReadyHives.length > 0
    ? `Welcome ${user?.name || "Ramesh"}. You have ${totalHives} hives. Hive ${harvestReadyHives[0]?.hiveCode || "HC-06"} has ripe honey ready for harvest. All other hives are healthy and safe.`
    : `Welcome ${user?.name || "Ramesh"}. All your ${totalHives} hives are healthy and thriving today.`;

  return (
    <div className="space-y-5 page-enter pb-12 max-w-5xl mx-auto">
      {/* ── Top Header: Welcoming Greeting & 1-Tap Audio Readout ── */}
      <section className="bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-transparent p-4 sm:p-6 rounded-3xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-[family-name:var(--font-outfit)]">
              {isHi ? "नमस्ते" : "Namaste"}, {user?.name || "Ramesh Kumar"}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 font-medium">
            📍 KVIC Smart Apiary · Sonipat Cluster · <span className="font-bold text-emerald-700">🟢 {totalHives} {isHi ? "बक्से सक्रिय" : "Active Hives"}</span>
          </p>
        </div>

        {/* Prominent 1-Tap Voice Speaker */}
        <div className="shrink-0 flex items-center gap-2">
          <AudioSpeaker
            text={spokenText}
            label={isHi ? "बोलकर सुनें (Listen)" : "Listen Status"}
            className="!py-2.5 !px-4 !text-sm !font-bold shadow-sm !rounded-2xl"
          />
        </div>
      </section>

      {/* ── Traffic Light Visual Condition Banner (Glance & Act) ── */}
      {harvestReadyHives.length > 0 ? (
        <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner">
              🍯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-[11px] font-extrabold uppercase tracking-wider">
                  {isHi ? "शहद तैयार" : "Harvest Ready"}
                </span>
                <span className="text-xs text-amber-100 font-medium">
                  {isHi ? "वजन 38.4 kg (भारी)" : "Weight: 38.4 kg"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold mt-0.5">
                {isHi 
                  ? `बक्सा ${harvestReadyHives[0]?.hiveCode || "HC-06"} में शहद पक चुका है — आज ही निकालें!` 
                  : `Hive ${harvestReadyHives[0]?.hiveCode || "HC-06"} is ripe and ready for harvest!`}
              </h2>
              <p className="text-xs text-amber-100/90 mt-0.5">
                {isHi ? "निकासी के बाद तुरंत वजन दर्ज करें और डिजिटल रसीद पाएं।" : "Log the harvest to generate your blockchain batch slip."}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/beekeeper/harvest"
            className="shrink-0 bg-white hover:bg-amber-50 text-amber-900 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🍯</span>
            <span>{isHi ? "शहद दर्ज करें" : "Log Harvest Now"}</span>
            <ArrowRight size={16} />
          </Link>
        </section>
      ) : alertHives.length > 0 ? (
        <section className="p-4 sm:p-5 rounded-3xl bg-rose-600 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
              ⚠️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isHi ? "छत्ते की जांच आवश्यक है!" : "Hive Inspection Required!"}
              </h2>
              <p className="text-xs text-rose-100 mt-0.5">
                {isHi 
                  ? `बक्सा ${alertHives[0]?.hiveCode} में तापमान सामान्य से अधिक है।` 
                  : `Hive ${alertHives[0]?.hiveCode} has higher temperature.`}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/beekeeper/iot"
            className="shrink-0 bg-white text-rose-700 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2"
          >
            <span>{isHi ? "सेंसर देखें" : "View Sensors"}</span>
          </Link>
        </section>
      ) : (
        <section className="p-4 sm:p-5 rounded-3xl bg-emerald-700 text-white shadow-md flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            🟢
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              {isHi ? "आपके सभी बक्से पूरी तरह स्वस्थ और सुरक्षित हैं!" : "All your hives are healthy and secure!"}
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              {isHi ? "तापमान और वजन सामान्य है। कोई कीट या बीमारी का खतरा नहीं है।" : "Temperature and weight are normal. No health alerts today."}
            </p>
          </div>
        </section>
      )}

      {/* ── The 3 Big Kisan Touch Tiles (1-Tap Primary Actions) ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tile 1: Log Harvest */}
        <Link
          href="/dashboard/beekeeper/harvest"
          className="group relative p-5 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-md hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🍯
            </div>
            <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {isHi ? "मुख्य कार्य" : "Primary"}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold font-[family-name:var(--font-outfit)]">
              {isHi ? "शहद निकालें" : "Log Honey Harvest"}
            </h3>
            <p className="text-xs text-amber-100/90 mt-1">
              {isHi ? "वजन दर्ज करें और डिजिटल रसीद पाएं" : "Enter harvested weight & record batch"}
            </p>
          </div>
          <div className="mt-3 flex items-center text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
            <span>{isHi ? "शुरू करें" : "Start Harvest"}</span>
            <ArrowRight size={15} className="ml-1" />
          </div>
        </Link>

        {/* Tile 2: My Hives */}
        <Link
          href="/dashboard/beekeeper/hives"
          className="group relative p-5 rounded-3xl bg-white border-2 border-amber-200/90 hover:border-amber-400 text-gray-900 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🐝
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              🟢 {healthyCount} {isHi ? "स्वस्थ" : "Healthy"}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold font-[family-name:var(--font-outfit)]">
              {totalHives} {isHi ? "कुल बक्से" : "Total Hives"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isHi ? "सभी बक्सों की स्थिति और वजन देखें" : "Monitor hive boxes & live sensors"}
            </p>
          </div>
          <div className="mt-3 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
            <span>{isHi ? "सभी बक्से देखें" : "View All Hives"}</span>
            <ArrowRight size={15} className="ml-1" />
          </div>
        </Link>

        {/* Tile 3: AI Bee Doctor */}
        <Link
          href="/dashboard/beekeeper/disease-guide"
          className="group relative p-5 rounded-3xl bg-white border-2 border-emerald-200 hover:border-emerald-400 text-gray-900 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🩺
            </div>
            <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={11} />
              <span>{isHi ? "AI डॉक्टर" : "AI Doctor"}</span>
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold font-[family-name:var(--font-outfit)]">
              {isHi ? "रोग जांच (डॉक्टर)" : "Bee Doctor & Health"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isHi ? "फोटो देखकर बीमारी व देसी इलाज बताएं" : "Scan comb photo to diagnose pests"}
            </p>
          </div>
          <div className="mt-3 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
            <span>{isHi ? "जांच शुरू करें" : "Check Health"}</span>
            <ArrowRight size={15} className="ml-1" />
          </div>
        </Link>
      </section>

      {/* ── Visual Wooden Hive Cards (Simple low-literacy box grid) ── */}
      <section className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-[family-name:var(--font-outfit)] flex items-center gap-2">
              <span>📦</span>
              <span>{isHi ? "आपके छत्ता बक्से (Your Hives)" : "Your Hive Boxes"}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isHi ? "रंग देखकर समझें: हरा = स्वस्थ, पीला/भूरा = शहद तैयार" : "Green = Healthy, Amber = Ready to Harvest"}
            </p>
          </div>
          <Link
            href="/dashboard/beekeeper/hives"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>{isHi ? "प्रबंधन करें" : "Manage"}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {hives.map((hive, idx) => {
            const weight = hive.latestReading?.weight || (idx === 0 ? 38.45 : 28.2);
            const temp = hive.latestReading?.temperature || 34.2;
            const hum = hive.latestReading?.humidity || 64.8;
            const isReady = weight >= 38.0;
            const isHealthy = (hive.healthScore || 85) >= 80;

            return (
              <div
                key={hive.id || hive.hiveCode}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isReady
                    ? "bg-amber-50/50 border-amber-300 shadow-xs"
                    : "bg-gray-50/50 border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📦</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">
                        {isHi ? `बक्सा #${idx + 1}` : `Box #${idx + 1}`}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {hive.hiveCode}
                      </span>
                    </div>
                  </div>

                  {isReady ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold">
                      <span>🍯</span>
                      <span>{isHi ? "शहद तैयार" : "Ready"}</span>
                    </span>
                  ) : isHealthy ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                      <span>🟢</span>
                      <span>{isHi ? "स्वस्थ" : "Healthy"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                      <span>⚠️</span>
                      <span>{isHi ? "ध्यान दें" : "Alert"}</span>
                    </span>
                  )}
                </div>

                {/* Big simple weight & vital badge */}
                <div className="mt-3 p-2.5 rounded-xl bg-white border border-gray-200/70 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      {isHi ? "बक्से का वजन" : "Current Weight"}
                    </span>
                    <span className="text-lg font-black text-gray-900">
                      {weight} <span className="text-xs font-semibold text-gray-500">kg</span>
                    </span>
                  </div>
                  <div className="text-right text-xs text-gray-500 space-y-0.5">
                    <div>🌡️ {temp}°C {isHi ? "तापमान" : "Temp"}</div>
                    <div>💧 {hum}% {isHi ? "नमी" : "Humidity"}</div>
                  </div>
                </div>

                {/* Quick 1-click action buttons */}
                <div className="mt-3 flex items-center gap-2">
                  {isReady ? (
                    <Link
                      href="/dashboard/beekeeper/harvest"
                      className="btn-primary !min-h-[38px] flex-1 text-xs font-bold justify-center"
                    >
                      🍯 {isHi ? "शहद निकालें" : "Harvest"}
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/beekeeper/iot"
                      className="btn-ghost border border-gray-200 !min-h-[38px] flex-1 text-xs font-semibold justify-center hover:bg-gray-100"
                    >
                      🔍 {isHi ? "सेंसर देखें" : "Sensors"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Recent Honey Harvests (Simple Vernacular Receipt List) ── */}
      <section className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 font-[family-name:var(--font-outfit)] flex items-center gap-2">
              <span>📜</span>
              <span>{isHi ? "ताज़ा शहद निकासी (Recent Harvests)" : "Recent Harvest Records"}</span>
            </h2>
            <p className="text-xs text-gray-500">
              {isHi ? "ब्लॉकचेन पर सुरक्षित दर्ज किया गया शहद" : "Honey recorded and signed on blockchain"}
            </p>
          </div>
          <Link
            href="/dashboard/beekeeper/batches"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>{isHi ? "सभी देखें" : "See all"}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-2">
          {batches.slice(0, 3).map((b) => (
            <Link
              key={b.id || b.batchId}
              href={`/verify/${b.batchId}`}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200/80 hover:border-amber-400 hover:bg-amber-50/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg shrink-0">
                  🍯
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    {b.quantity || b.quantityKg || 18.5} kg · {b.honeyType || (isHi ? "शुद्ध शहद" : "Pure Honey")}
                  </h4>
                  <span className="text-xs text-gray-500 font-mono">
                    {b.batchId}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 size={13} />
                  <span>{isHi ? "दर्ज हुआ" : "Recorded"}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Toll-Free Kisan Helpline / Sahayata Banner ── */}
      <section className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
            📞
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold">
              {isHi ? "KVIC मधुमक्खी मित्र हेल्पलाइन" : "KVIC Expert Kisan Helpline"}
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">
              {isHi 
                ? "मुफ्त सलाह, बॉक्स सब्सिडी व बीमारी के देसी इलाज के लिए फोन करें" 
                : "Toll-free assistance for box migration, subsidies & disease prevention"}
            </p>
          </div>
        </div>

        <a
          href="tel:18001801551"
          className="shrink-0 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <PhoneCall size={16} className="text-emerald-700" />
          <span>1800-180-1551 (Toll Free)</span>
        </a>
      </section>
    </div>
  );
}
