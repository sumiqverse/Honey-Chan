"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Beekeeper", email: "ramesh.sonipat@gmail.com", icon: "🐝" },
  { label: "Processor", email: "contact@abchoney.in", icon: "🏭" },
  { label: "Lab Officer", email: "lab.verify@fssai-approved.gov.in", icon: "🧪" },
  { label: "Distributor", email: "distributor@honeychain.in", icon: "🚚" },
  { label: "Retailer", email: "store@freshmart.in", icon: "🏪" },
  { label: "Admin Console", email: "admin@honeychain.gov.in", icon: "🏛️" },
];

export default function Login() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [web3Loading, setWeb3Loading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "BEEKEEPER") router.push("/dashboard/beekeeper");
      else if (user.role === "ADMIN") router.push("/dashboard/admin");
      else router.push("/dashboard/supply-chain");
    }
  }, [user, isLoading, router]);

  const handleWeb3Login = async () => {
    setError("");
    setWeb3Loading(true);

    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed. Please install it to use Web3 login.");
      setWeb3Loading(false);
      return;
    }

    try {
      // 1. Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // 2. Sign a message
      const message = `Please sign this message to authenticate with HoneyChain.\n\nTimestamp: ${Date.now()}`;
      const signature = await signer.signMessage(message);

      // 3. Send to backend
      await login({ walletAddress, signature, message });
    } catch (err: any) {
      console.error(err);
      if (err.code === "ACTION_REJECTED" || (err.message && err.message.includes("rejected"))) {
        setError("Login cancelled. You rejected the signature request in MetaMask.");
      } else if (err.message && err.message.includes("Wallet not registered")) {
        setError("Wallet not registered. Redirecting to signup...");
        setTimeout(() => {
          router.push("/register");
        }, 2000);
      } else {
        setError(err.message || "Web3 Login failed");
      }
    } finally {
      setWeb3Loading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || "Failed to login");
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

            <h1 className="font-[family-name:var(--font-outfit)] text-3xl xl:text-4xl font-bold leading-tight">
              Join India&apos;s largest blockchain-verified honey ecosystem.
            </h1>
            <p className="text-white/80 mt-2.5 text-sm leading-relaxed">
              Sign in as a beekeeper, processor, lab officer, or retailer to participate in the transparent honey supply chain.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "1,248+", label: "Beekeepers" },
              { value: "8,492", label: "Smart Hives" },
              { value: "182T", label: "Honey Tracked" },
              { value: "99.8%", label: "FSSAI Pass Rate" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-[var(--radius-lg)] bg-white/10 backdrop-blur-sm border border-white/15 shadow-xs">
                <p className="text-xl font-bold font-[family-name:var(--font-outfit)]">{stat.value}</p>
                <p className="text-xs text-white/70 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[var(--bg-base)] overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--radius-md)] overflow-hidden shadow-md border border-amber-500/30">
                <Image src="/favicon.png" alt="HoneyChain" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg text-[var(--text-primary)] font-[family-name:var(--font-outfit)]">
                HoneyChain
              </span>
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-[var(--text-primary)]">
              Sign In
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5">
              Access your HoneyChain dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm rounded-[var(--radius-md)] border border-[var(--color-danger-border)] font-medium">
              {error}
            </div>
          )}

          {/* Web3 1-Click Login */}
          <button
            type="button"
            onClick={handleWeb3Login}
            disabled={web3Loading || loading}
            className="w-full py-2.5 px-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white hover:bg-[var(--bg-muted)] text-[var(--text-primary)] text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span className="text-base">🦊</span>
            <span>{web3Loading ? "Connecting to MetaMask..." : "Sign in with MetaMask"}</span>
          </button>

          <div className="relative my-4 flex items-center">
            <div className="flex-grow border-t border-[var(--border-default)]" />
            <span className="shrink-0 px-3 text-xs text-[var(--text-muted)] font-medium">
              or continue with email
            </span>
            <div className="flex-grow border-t border-[var(--border-default)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="login-email"
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
              <label htmlFor="login-password" className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input !pl-10 !pr-10"
                  placeholder="Enter your password"
                  required
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Sign In
                  <ArrowRight size={14} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--honey-600)] hover:text-[var(--honey-700)] transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Quick Demo Autofill */}
          <div className="mt-6 pt-5 border-t border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Demo Accounts
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Click to autofill
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword("password123");
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--border-default)] bg-white hover:border-[var(--honey-400)] hover:bg-[var(--honey-50)] text-[var(--text-primary)] transition-all cursor-pointer shadow-xs"
                >
                  <span>{account.icon}</span>
                  <span className="truncate">{account.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
