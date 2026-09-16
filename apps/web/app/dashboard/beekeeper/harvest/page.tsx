"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { honeyApi } from "@/lib/api";
import { queueHarvest, flushOutbox } from "@/lib/offline";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function BeekeeperHarvestPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isHi = language === "hi";

  const [formData, setFormData] = useState({
    batchId: `HC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    hiveCode: "HIVE-007",
    honeyType: "Mustard Flower Honey (Sarson)",
    quantityKg: "18.5",
    harvestDate: new Date().toISOString().split("T")[0],
    originLocation: "Ganaur Apiary, Sonipat, Haryana",
    notes: "Pure raw honey extracted using modern solar centrifugal extractor.",
  });

  /** Multi-hive harvest: all hives whose honey went into this batch. */
  const [selectedHiveCodes, setSelectedHiveCodes] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [createdBatch, setCreatedBatch] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [hives, setHives] = useState<any[]>([]);
  const [hivesLoading, setHivesLoading] = useState(true);

  useEffect(() => {
    honeyApi
      .getHives()
      .then((data) => {
        setHives(data);
        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            hiveCode: data[0].hiveCode,
            honeyType: data[0].flowerSource || prev.honeyType,
            originLocation: data[0].location || prev.originLocation,
          }));
          setSelectedHiveCodes([data[0].hiveCode]);
        } else {
          setFormData((prev) => ({ ...prev, hiveCode: "" }));
        }
      })
      .catch(console.error)
      .finally(() => setHivesLoading(false));
  }, []);

  /** Toggle a hive chip; primary hive (first selected) drives honeyType/location defaults. */
  const toggleHive = (code: string) => {
    setSelectedHiveCodes((prev) => {
      const next = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      if (next.length > 0) {
        const primary = hives.find((h) => h.hiveCode === next[0]);
        setFormData((f) => ({
          ...f,
          hiveCode: next[0],
          honeyType: primary?.flowerSource || f.honeyType,
          originLocation: primary?.location || f.originLocation,
        }));
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHiveCodes.length === 0) {
      setError(
        isHi
          ? "कृपया पहले कम से कम एक बक्सा चुनें।"
          : "Please register or select a hive first before creating a batch."
      );
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let txHash = "";
      let metadataHash = "";

      const isMultiHive = selectedHiveCodes.length > 1;
      const hiveField = isMultiHive
        ? [...selectedHiveCodes].sort()
        : selectedHiveCodes[0];

      // 1. Try to register on blockchain first
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const { getContractWithSigner } = await import("@/lib/blockchain");
          const { ethers } = await import("ethers");
          const contract = await getContractWithSigner();

          const metadataPayload = JSON.stringify({
            batchId: formData.batchId,
            hive: hiveField,
            type: formData.honeyType,
            quantity: formData.quantityKg,
          });
          metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataPayload));

          const quantityGrams = Math.floor(Number(formData.quantityKg) * 1000);
          const harvestTimestamp = Math.floor(
            new Date(formData.harvestDate || Date.now()).getTime() / 1000
          );

          alert(
            "Please approve the CREATE BATCH transaction in MetaMask to register this on the blockchain."
          );

          const tx = await contract.createBatch(
            formData.batchId,
            metadataHash,
            quantityGrams,
            harvestTimestamp
          );

          await tx.wait();
          txHash = tx.hash;
          console.log("Blockchain transaction successful:", txHash);
        } catch (blockchainErr: any) {
          console.error("Blockchain error:", blockchainErr);
          if (
            blockchainErr.code === "ACTION_REJECTED" ||
            blockchainErr.code === 4001
          ) {
            throw new Error("Transaction rejected by user.");
          }
          alert(
            "Blockchain registration failed: " +
              (blockchainErr.reason || blockchainErr.message) +
              "\n\nBatch will still be saved to the database."
          );
        }
      }

      // 2. Create batch via API (DB storage)
      const apiPayload = {
        ...formData,
        hiveIds: selectedHiveCodes,
        blockchainTx: txHash || undefined,
        metadataHash,
      };

      // Offline path: no network → queue the harvest
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        queueHarvest(apiPayload);
        setQueuedOffline(true);
        return;
      }

      const res = await honeyApi.createBatch(apiPayload);
      setCreatedBatch(res);
    } catch (err: any) {
      setError(err.message || "Failed to create honey batch");
    } finally {
      setLoading(false);
    }
  };

  const verificationUrl = createdBatch
    ? typeof window !== "undefined"
      ? `${window.location.origin}/verify/${createdBatch.batchId}`
      : `http://localhost:3000/verify/${createdBatch.batchId}`
    : "";

  const jars: { serial: string; secret: string }[] =
    (createdBatch as any)?.jars || [];
  const [selectedJarIdx, setSelectedJarIdx] = useState(0);
  const selectedJar = jars[selectedJarIdx];
  const jarUrl =
    verificationUrl && selectedJar
      ? `${verificationUrl}?j=${selectedJar.serial}&s=${selectedJar.secret}`
      : "";

  useEffect(() => {
    const flush = () => {
      flushOutbox((payload, key) =>
        honeyApi.createBatch({ ...(payload as any), idempotencyKey: key })
      );
    };
    window.addEventListener("online", flush);
    flush();
    return () => window.removeEventListener("online", flush);
  }, []);

  if (queuedOffline) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-8 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-3xl">
            📶
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {isHi ? "फ़सल फ़ोन में सहेज ली गई है" : "Harvest saved on this phone"}
          </h2>
          <p className="text-sm text-gray-600">
            {isHi
              ? "आप ऑफ़लाइन हैं। फ़सल सुरक्षित रूप से सहेजी गई है और इंटरनेट आने पर अपने आप सर्वर पर जमा हो जाएगी।"
              : "You are offline. The harvest is stored safely and will be submitted automatically when internet returns."}
          </p>
          <button
            onClick={() => setQueuedOffline(false)}
            className="inline-block rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition-all"
          >
            {isHi ? "नया बैच दर्ज करें" : "Record Another Batch"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Dashboard Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {isHi ? "शहद निकालें व दर्ज करें" : "Log Honey Harvest"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {isHi
              ? "ब्लॉकचेन पर SHA-256 हैश के साथ शुद्ध शहद का बैच दर्ज करें और जार क्यूआर लेबल प्राप्त करें"
              : "Register harvest on blockchain with cryptographic SHA-256 metadata hash & generate jar QR labels"}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-xs font-bold w-fit shadow-xs">
          <span>🍯</span>
          <span>{isHi ? "केवीआईसी हार्वेस्ट स्टेशन" : "KVIC Harvest Station"}</span>
        </div>
      </div>

      {!createdBatch ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Batch & Apiary Details */}
          <div className="card p-5 sm:p-6 bg-white space-y-5 rounded-2xl shadow-xs border border-amber-200/80">
            <h2 className="font-bold text-gray-800 text-sm border-b border-gray-100 pb-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs">
                1
              </span>
              <span>{isHi ? "बैच और छत्ते का विवरण" : "Batch & Apiary Details"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {isHi ? "अद्वितीय बैच आईडी (Batch ID)" : "Unique Batch ID"}
                </label>
                <input
                  type="text"
                  required
                  className="input font-mono text-sm bg-gray-50/80"
                  value={formData.batchId}
                  onChange={(e) =>
                    setFormData({ ...formData, batchId: e.target.value })
                  }
                />
              </div>

              {/* Multi-hive contribution selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {isHi
                    ? "शहद के स्रोत बक्से (योगदान देने वाले सभी बक्से चुनें)"
                    : "Source Hives (tap all that contributed — first = primary)"}
                </label>

                {hivesLoading ? (
                  <p className="text-xs text-gray-400 py-2">
                    {isHi ? "बक्से लोड हो रहे हैं..." : "Loading your hives..."}
                  </p>
                ) : hives.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-3 text-xs text-amber-900">
                    <p className="font-bold mb-1">
                      {isHi ? "कोई बक्सा नहीं मिला" : "No hives registered yet"}
                    </p>
                    <Link
                      href="/dashboard/beekeeper/hives"
                      className="underline font-semibold text-amber-800"
                    >
                      {isHi ? "+ पहले नया बक्सा जोड़ें" : "+ Register your first hive"}
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {hives.map((h, i) => {
                      const selected = selectedHiveCodes.includes(h.hiveCode);
                      const isPrimary = selectedHiveCodes[0] === h.hiveCode;
                      return (
                        <button
                          key={h.hiveCode}
                          type="button"
                          onClick={() => toggleHive(h.hiveCode)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            selected
                              ? isPrimary
                                ? "bg-amber-600 text-white shadow-xs"
                                : "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                          }`}
                        >
                          {isPrimary && <span title="Primary hive">★</span>}
                          <span>{h.hiveCode}</span>
                          {h.flowerSource && (
                            <span className="text-[10px] opacity-75 font-normal">
                              ({h.flowerSource.split(" ")[0]})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedHiveCodes.length > 0 && (
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    {selectedHiveCodes.length}{" "}
                    {selectedHiveCodes.length === 1 ? "hive" : "hives"} —{" "}
                    {isHi
                      ? "बैच हैश में इन सभी बक्सों की क्रमबद्ध सूची शामिल होगी"
                      : "batch hash will include the sorted hive list (v2)"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {isHi ? "फूल / वनस्पति उत्पत्ति" : "Honey Flora / Botanical Origin"}
                </label>
                <input
                  type="text"
                  required
                  className="input text-sm"
                  value={formData.honeyType}
                  onChange={(e) =>
                    setFormData({ ...formData, honeyType: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {isHi ? "निकाला गया वजन (KG)" : "Harvested Quantity (KG)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  required
                  className="input text-sm font-semibold"
                  value={formData.quantityKg}
                  onChange={(e) =>
                    setFormData({ ...formData, quantityKg: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {isHi ? "निकासी तिथि (Harvest Date)" : "Harvest Date"}
                </label>
                <input
                  type="date"
                  required
                  className="input text-sm"
                  value={formData.harvestDate}
                  onChange={(e) =>
                    setFormData({ ...formData, harvestDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {isHi ? "स्थान (Apiary Location)" : "Harvest Location (Apiary Cluster)"}
                </label>
                <input
                  type="text"
                  required
                  className="input text-sm"
                  value={formData.originLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      originLocation: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {isHi ? "निकासी विधि और नोट्स" : "Extraction Notes & Method"}
              </label>
              <textarea
                rows={2}
                className="input text-sm resize-none"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          {/* Card 2: Cryptographic Explanation */}
          <div className="card p-4 sm:p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🔒</span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                {isHi ? "क्रिप्टोग्राफ़िक अखंडता सुरक्षा" : "Cryptographic Integrity Mechanism"}
              </h3>
            </div>
            <p className="text-xs text-amber-950/85 leading-relaxed">
              {isHi
                ? "जब आप सबमिट करेंगे, HoneyChain इस सटीक डेटा का एक विशिष्ट SHA-256 हैश उत्पन्न करेगा जो ब्लॉकचेन पर हमेशा के लिए दर्ज होगा। इसके बाद यदि कोई डेटा में बदलाव करेगा तो सिस्टम तुरंत TAMPER WARNING चेतावनी दिखाएगा।"
                : "When you submit, HoneyChain will generate a deterministic SHA-256 hash of this exact metadata. This hash is anchored on the blockchain. Any subsequent alteration of the quantity or origin will immediately trigger a TAMPER WARNING for consumers."}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-lg">⏳</span>
                  <span>{isHi ? "ब्लॉकचेन पर दर्ज हो रहा है..." : "Anchoring on Blockchain..."}</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span>{isHi ? "बैच ब्लॉकचेन पर दर्ज करें" : "Anchor Batch on Blockchain"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Batch Success & Jar QR Generation Section */
        <div className="card p-6 sm:p-8 bg-white border border-amber-200 text-center space-y-6 rounded-2xl shadow-md animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
            ✓
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 font-[family-name:var(--font-outfit)]">
              {isHi ? "शहद का बैच सफलतापूर्वक दर्ज हुआ!" : "Honey Batch Successfully Anchored!"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {isHi ? "ब्लॉकचेन बैच आईडी:" : "Blockchain Batch ID:"}{" "}
              <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                {createdBatch.batchId}
              </span>
            </p>
          </div>

          <div className="max-w-xs mx-auto p-5 bg-gradient-to-b from-amber-50/60 to-white rounded-2xl border border-amber-200 space-y-4 shadow-sm">
            {jars.length > 1 && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white p-2 text-xs">
                <button
                  type="button"
                  className="px-2.5 py-1 font-bold rounded-lg bg-amber-50 hover:bg-amber-100 disabled:opacity-30 cursor-pointer"
                  disabled={selectedJarIdx === 0}
                  onClick={() => setSelectedJarIdx((i) => Math.max(0, i - 1))}
                >
                  ← Prev
                </button>
                <span className="font-mono font-bold text-amber-950">
                  Jar {selectedJarIdx + 1} / {jars.length}
                </span>
                <button
                  type="button"
                  className="px-2.5 py-1 font-bold rounded-lg bg-amber-50 hover:bg-amber-100 disabled:opacity-30 cursor-pointer"
                  disabled={selectedJarIdx === jars.length - 1}
                  onClick={() =>
                    setSelectedJarIdx((i) => Math.min(jars.length - 1, i + 1))
                  }
                >
                  Next →
                </button>
              </div>
            )}

            <div className="flex justify-center bg-white p-4 rounded-xl shadow-xs border border-amber-100">
              <QRCodeSVG
                value={jarUrl || verificationUrl}
                size={180}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>🍯</text></svg>",
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />
            </div>

            {selectedJar && (
              <div className="rounded-xl bg-amber-100/80 border border-amber-300 p-2.5 text-center">
                <p className="text-[10px] uppercase tracking-widest font-bold text-amber-900">
                  {isHi ? "ढक्कन के नीचे का स्क्रैच कोड" : "Scratch code (under cap)"}
                </p>
                <p className="text-base font-mono font-bold tracking-[0.25em] text-amber-950 mt-0.5">
                  {selectedJar.secret}
                </p>
              </div>
            )}

            <div className="text-left text-xs space-y-1 bg-white p-3 rounded-xl border border-amber-100">
              <p className="font-bold text-gray-800">
                {createdBatch.honeyType}
              </p>
              <p className="text-gray-500 text-[11px]">
                Qty: {createdBatch.quantity} KG • Hive:{" "}
                {createdBatch.hive?.hiveCode || formData.hiveCode}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/verify/${createdBatch.batchId}`}
              className="bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-5 text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              {isHi ? "पब्लिक सत्यापन पृष्ठ देखें →" : "View Public Consumer Page →"}
            </Link>

            <button
              onClick={() => window.print()}
              className="bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 py-2.5 px-5 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              🖨️ {isHi ? "क्यूआर लेबल प्रिंट करें" : "Print QR Label"}
            </button>

            <button
              onClick={() => {
                setCreatedBatch(null);
                setFormData({
                  ...formData,
                  batchId: `HC-2026-${Math.floor(
                    100000 + Math.random() * 900000
                  )}`,
                });
              }}
              className="px-4 py-2 text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
            >
              + {isHi ? "एक और बैच दर्ज करें" : "Create Another"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
