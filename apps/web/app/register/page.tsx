"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Shield,
  Leaf,
  FlaskConical,
  Truck,
  Package,
  Store,
} from "lucide-react";

const ROLES = [
  { value: "BEEKEEPER", label: "Beekeeper", icon: <Leaf size={18} />, group: "Production" },
  { value: "PROCESSOR", label: "Factory / Processor", icon: <Truck size={18} />, group: "Supply Chain" },
  { value: "LAB", label: "Quality Lab", icon: <FlaskConical size={18} />, group: "Supply Chain" },
  { value: "DISTRIBUTOR", label: "Distributor", icon: <Truck size={18} />, group: "Supply Chain" },
  { value: "WHOLESALER", label: "Wholesaler", icon: <Package size={18} />, group: "Supply Chain" },
  { value: "RETAILER", label: "Retailer", icon: <Store size={18} />, group: "Supply Chain" },
];

export default function Register() {
  const { register, user, isLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("BEEKEEPER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "BEEKEEPER") router.push("/dashboard/beekeeper");
      else if (user.role === "ADMIN") router.push("/dashboard/admin");
      else router.push("/dashboard/supply-chain");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password, role, phone });
    } catch (err: any) {
      setError(err.message || "Failed to register");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branded Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[var(--honey-600)] via-[var(--honey-700)] to-[var(--orange-700)] text-white p-8 xl:p-12 flex-col justify-center">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto w-full space-y-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-white/15 flex items-center justify-center backdrop-blur-sm overflow-hidden border border-white/20 shadow-sm">
                <Image src="/favicon.png" alt="HoneyChain" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl font-[family-name:var(--font-outfit)] tracking-tight">
                HoneyChain
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold tracking-wider uppercase">
                🏛️ SIH Problem Statement ID: 26021
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-300/30 text-[11px] font-semibold text-amber-100">
                Ministry of MSME · KVIC
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-outfit)] text-3xl xl:text-4xl font-bold leading-tight">
              HoneyChain: Smart Beekeeping & Blockchain Traceability
            </h1>
            <p className="text-white/85 mt-2.5 text-sm leading-relaxed">
              Engineered for KVIC&apos;s Honey Mission — eliminating counterfeit honey adulteration and hive colony loss through ₹1,100 solar IoT nodes, IEEE bioacoustic AI, and cryptographic farm-to-jar batch provenance.
            </p>

            <div className="space-y-2 pt-2 text-xs text-white/90">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0" />
                <span><strong>Zero-Camera IoT (₹1,100 BOM):</strong> Acoustic sensing solves lens propolis coating and bee blindness.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0" />
                <span><strong>IEEE Bioacoustic ML:</strong> 87.4% ROC-AUC Varroa mite detection via spectral entropy.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-300 shrink-0" />
                <span><strong>Cryptographic Provenance:</strong> SHA-256 hash notary on-chain with consumer QR verification.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {[
              { value: "87.4%", label: "Bioacoustic ML", detail: "Varroa Mite ROC-AUC (IEEE 8718621)" },
              { value: "₹1,100", label: "Solar IoT Node", detail: "Zero-Camera Hardware BOM" },
              { value: "< 20%", label: "FSSAI Pure Moisture", detail: "HMF < 80mg · 0% Added Sugar" },
              { value: "SHA-256", label: "On-Chain Notary", detail: "Immutable Batch Hash Provenance" },
            ].map((stat) => (
              <div key={stat.label} className="p-3.5 rounded-[var(--radius-lg)] bg-white/10 backdrop-blur-sm border border-white/15 shadow-xs">
                <p className="text-xl font-bold font-[family-name:var(--font-outfit)]">{stat.value}</p>
                <p className="text-xs font-semibold text-white/90 mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-white/70 mt-0.5">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[var(--bg-base)] overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-[var(--radius-md)] overflow-hidden shadow-md border border-amber-500/30">
              <Image src="/favicon.png" alt="HoneyChain" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
              HoneyChain
            </span>
          </div>

          <div className="mb-6">
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
              Create Account
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5">
              Join the HoneyChain ecosystem
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm rounded-[var(--radius-md)] border border-[var(--color-danger-border)] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Full Name / Organization
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input !pl-10"
                  placeholder="Your name or organization"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input !pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Phone Number <span className="text-[var(--text-muted)] font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="reg-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input !pl-10"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input !pl-10 !pr-10"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex items-center gap-2 p-3 rounded-[var(--radius-md)] border text-xs font-semibold transition-all cursor-pointer text-left ${
                      role === r.value
                        ? "border-[var(--honey-500)] bg-[var(--honey-50)] text-[var(--honey-700)] shadow-sm"
                        : "border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-muted)]"
                    }`}
                  >
                    <span className={role === r.value ? "text-[var(--honey-600)]" : "text-[var(--text-muted)]"}>
                      {r.icon}
                    </span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-4 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Create Account
                  <ArrowRight size={14} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--honey-600)] hover:text-[var(--honey-700)] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
