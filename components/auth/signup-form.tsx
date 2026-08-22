"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
  Globe2,
  HelpCircle,
  KeyRound,
} from "lucide-react";

type SocialProvider = "google" | "apple";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      // Step 1: Create the account
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Sign-up failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Auto-login after successful signup
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Fallback to manual login redirect if credentials auto-login returns an issue
        router.push("/login?signup=success");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setMessage("We could not complete sign-up. Please try again.");
      setIsSubmitting(false);
    }
  }

  async function handleProviderSignIn(provider: SocialProvider) {
    setMessage("");
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  function showUnavailableMessage(providerName: string) {
    setMessage(`${providerName} sign-up is not configured yet.`);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8 text-[#37352f] antialiased">
      <main className="flex w-full max-w-[380px] flex-col items-center">
        {/* Logo */}
        <div className="mb-4 h-9 w-9" aria-label="Notion">
          <NotionMark />
        </div>

        {/* Heading */}
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#050505]">
            Create your workspace.
          </h1>
          <p className="mt-1 text-sm font-medium text-[#73726e]">
            Sign up for a Notion account
          </p>
        </header>

        {/* Error Alert Box */}
        {message ? (
          <div
            role="status"
            className="mb-6 flex w-full items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 shadow-sm"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <span className="leading-snug">{message}</span>
          </div>
        ) : null}

        {/* Form */}
        <form className="w-full space-y-4" onSubmit={handleEmailSubmit}>
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-[#73726e]">
              Full Name <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              autoComplete="name"
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-[#37352f] outline-none transition placeholder:text-[#a4a29e] focus:border-[#0078df] focus:ring-2 focus:ring-[#0078df]/30"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-[#73726e]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              autoComplete="email"
              required
              autoFocus
              className="h-10 w-full rounded-md border border-[#0078df] bg-white px-3 text-sm text-[#37352f] outline-none shadow-[0_0_0_1px_rgba(0,120,223,0.2)] transition placeholder:text-[#a4a29e] focus:border-[#0060b5] focus:ring-2 focus:ring-[#0078df]/30"
            />
            <p className="text-[11px] text-[#a4a29e]">
              Use an organization email to collaborate with teammates
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-[#73726e]">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (8+ chars)..."
                autoComplete="new-password"
                required
                minLength={8}
                className="h-10 w-full rounded-md border border-neutral-300 bg-white pl-3 pr-10 text-sm text-[#37352f] outline-none transition placeholder:text-[#a4a29e] focus:border-[#0078df] focus:ring-2 focus:ring-[#0078df]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-[#a4a29e]">
              Must be at least 8 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-md bg-[#0078df] font-medium text-white shadow-sm transition hover:bg-[#0067c2] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex w-full items-center text-xs text-[#a4a29e]">
          <span className="flex-1 border-t border-neutral-200" />
          <span className="px-3">or sign up with</span>
          <span className="flex-1 border-t border-neutral-200" />
        </div>

        {/* Social Logins */}
        <div className="w-full space-y-3">
          <div className="grid grid-cols-3 gap-2.5">
            <SocialButton label="Google" onClick={() => handleProviderSignIn("google")}>
              <GoogleIcon />
            </SocialButton>
            <SocialButton label="Apple" onClick={() => handleProviderSignIn("apple")}>
              <AppleIcon />
            </SocialButton>
            <SocialButton label="Microsoft" onClick={() => showUnavailableMessage("Microsoft")}>
              <MicrosoftIcon />
            </SocialButton>
          </div>
          <div className="grid grid-cols-2 gap-2.5 px-6">
            <SocialButton label="Passkey" onClick={() => showUnavailableMessage("Passkey")}>
              <KeyRound size={18} strokeWidth={1.8} />
            </SocialButton>
            <SocialButton label="SSO" onClick={() => showUnavailableMessage("SSO")}>
              <Building2 size={18} strokeWidth={1.7} />
            </SocialButton>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-xs text-[#73726e]">
          <p className="mb-4">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#0078df] hover:underline">
              Log in
            </Link>
          </p>
          <p className="text-[11px] leading-relaxed text-[#a4a29e]">
            By continuing, you acknowledge that you understand and agree to the{" "}
            <Link href="/" className="underline hover:text-[#37352f]">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/" className="underline hover:text-[#37352f]">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6 text-xs text-[#a4a29e]">
        <button
          type="button"
          onClick={() => setMessage("Language selection is coming soon.")}
          className="flex items-center gap-1.5 transition hover:text-[#37352f]"
        >
          <Globe2 size={14} />
          <span>English (US)</span>
          <ChevronDown size={12} />
        </button>
        <button
          type="button"
          aria-label="Help"
          onClick={() => setMessage("How can we help?")}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-800"
        >
          <HelpCircle size={15} />
        </button>
      </footer>
    </div>
  );
}

function SocialButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 flex-col items-center justify-center gap-1 rounded-md border border-neutral-200 bg-white py-2 text-xs font-medium text-[#37352f] transition hover:bg-neutral-50 active:bg-neutral-100"
    >
      <span className="flex h-5 w-5 items-center justify-center">{children}</span>
      <span>{label}</span>
    </button>
  );
}

function NotionMark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-full w-full">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.716 29.2178L2.27664 24.9331C1.44913 23.9023 1 22.6346 1 21.3299V5.81499C1 3.86064 2.56359 2.23897 4.58071 2.10125L20.5321 1.01218C21.691 0.933062 22.8428 1.24109 23.7948 1.8847L29.3992 5.67391C30.4025 6.35219 31 7.46099 31 8.64426V26.2832C31 28.1958 29.4626 29.7793 27.4876 29.9009L9.78333 30.9907C8.20733 31.0877 6.68399 30.4237 5.716 29.2178Z" fill="black" />
      <path d="M11.2481 13.5787V13.3756C11.2481 12.8607 11.6605 12.4337 12.192 12.3982L16.0633 12.1397L21.417 20.0235V13.1041L20.039 12.9204V12.824C20.039 12.303 20.4608 11.8732 20.9991 11.8456L24.5216 11.6652V12.1721C24.5216 12.41 24.3446 12.6136 24.1021 12.6546L23.2544 12.798V24.0037L22.1906 24.3695C21.3018 24.6752 20.3124 24.348 19.8036 23.5803L14.6061 15.7372V23.223L16.2058 23.5291L16.1836 23.6775C16.1137 24.1423 15.7124 24.4939 15.227 24.5155L11.2481 24.6926C11.1955 24.1927 11.5701 23.7456 12.0869 23.6913L12.6103 23.6363V13.6552L11.2481 13.5787Z" fill="white" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09A7.2 7.2 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
      <path d="M15.53 3.83c.84-1.01 1.4-2.43 1.25-3.83-1.21.05-2.66.8-3.53 1.82-.69.79-1.35 2.23-1.17 3.61 1.35.1 2.61-.72 3.45-1.6ZM20.78 17.36c-1.16 1.69-1.64 3.32-1.66 3.42-.04-.02-3.18-1.22-3.22-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.62-2.32-4.39-2.38-2-.16-3.67 1.09-4.6 1.09-.95 0-2.42-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.21 3.09 3.79 3.04 1.52-.07 2.09-.99 3.94-.99 1.83 0 2.35.99 3.96.95 1.64-.03 2.67-1.48 3.67-2.95 1.16-1.69 1.64-3.32 1.66-3.41-.04-.02-1.02-.4-2.05-1.41-.93-.91-1.52-2.17-1.64-3.42Z" fill="#111" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" aria-hidden="true" className="h-full w-full">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}
