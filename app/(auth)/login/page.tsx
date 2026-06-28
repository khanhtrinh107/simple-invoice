import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { BrandMark } from "@/components/layout/brand-mark";
import { LoginHeroArt } from "@/components/layout/login-hero-art";
import { hasValidSession } from "@/lib/cookies";
import { ROUTES } from "@/shared/constants";

export default async function LoginPage() {
  if (await hasValidSession()) {
    redirect(ROUTES.INVOICES);
  }

  return (
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2">
      {/* Brand panel — desktop only (lg+) */}
      <aside className="relative isolate hidden overflow-hidden bg-[#0b1739] text-slate-100 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_15%,rgba(18,86,230,0.55),transparent_60%),radial-gradient(60%_45%_at_90%_90%,rgba(255,177,16,0.35),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <LoginHeroArt className="pointer-events-none absolute inset-0 mx-auto h-full w-full max-w-xl text-white/15" />

        <div className="relative z-10 flex items-center gap-3 px-10 pt-10">
          <BrandMark variant="light" className="h-9" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 px-10 pb-12">
          <h2
            className="max-w-md text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-[2.75rem]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Invoicing,
            <br />
            <span className="bg-gradient-to-r from-[#3B82F6] via-[#FFB110] to-[#F97316] bg-clip-text text-transparent">
              simplified.
            </span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-300">
            Create, send, and track invoices for your business in one
            beautifully simple place.
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span
              aria-hidden="true"
              className="inline-flex size-1.5 rounded-full bg-[#FFB110]"
            />
            Trusted by finance teams worldwide
          </div>
        </div>
      </aside>

      {/* Mobile: dark hero panel with logo top-left + form */}
      <main className="dark relative isolate flex min-h-svh flex-col bg-[#0b1739] text-white lg:hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(80%_60%_at_15%_10%,rgba(18,86,230,0.55),transparent_60%),radial-gradient(60%_45%_at_90%_85%,rgba(255,177,16,0.30),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <header className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4">
          <BrandMark variant="light" className="h-10" />
        </header>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-12 pt-6">
          <Card className="bg-transparent shadow-none ring-0">
            <CardHeader className="gap-1 px-6">
              <CardTitle
                className="text-2xl font-semibold tracking-tight text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-sm text-slate-300 font-heading">
                Welcome back! Please enter your details.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              <LoginForm />
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-slate-300 font-heading">
            Don&apos;t have an account?{" "}
            <Link
              href="#"
              className="font-semibold text-[#60A5FA] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-sm"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>

      {/* Desktop: light form panel (left half = <aside>, right half = this) */}
      <main className="hidden flex-1 items-center justify-center bg-background lg:flex">
        <div className="w-full max-w-md">
          <Card className="bg-transparent shadow-none ring-0">
            <CardHeader className="gap-1 px-0">
              <CardTitle
                className="text-2xl font-semibold tracking-tight text-[#0F172A]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Sign in to your account
              </CardTitle>
              <CardDescription className="text-sm text-[#64748B] font-heading">
                Welcome back! Please enter your details.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <LoginForm />
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-[#64748B] font-heading">
            Don&apos;t have an account?{" "}
            <Link
              href="#"
              className="font-semibold text-[#1256E6] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256E6]/30 rounded-sm"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}