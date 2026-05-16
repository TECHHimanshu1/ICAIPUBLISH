import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2, Mail, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageShell } from "@/components/site-header";
import { setSession } from "@/lib/auth";
import { toast } from "sonner";

type S = { next?: string };
export const Route = createFileRoute("/login")({
  validateSearch: (s): S => ({ next: s.next as string | undefined }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const nav = useNavigate();

  const redirect = () => nav({ to: (next as "/dashboard") ?? "/dashboard" });

  return (
    <PageShell>
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-icai-gold)]/40 bg-[color:var(--color-icai-gold)]/10 px-3 py-1 text-xs font-medium text-[color:var(--color-icai-blue)]">
            <ShieldCheck className="h-3 w-3" /> Secure Sign-in · Demo
          </div>
          <h1 className="mt-3 text-3xl font-bold text-[color:var(--color-icai-blue)]">Sign in to the ICAI Publication Portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ICAI members sign in via Self Service Portal (SSP). Non-members register with email/mobile OTP.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>• Read full publications inside the protected reader</li>
            <li>• Save publications and continue reading</li>
            <li>• Personalised recommendations</li>
          </ul>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <Tabs defaultValue="member">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="member"><User className="mr-1 h-4 w-4" />ICAI Member</TabsTrigger>
              <TabsTrigger value="non"><Mail className="mr-1 h-4 w-4" />Non-Member</TabsTrigger>
            </TabsList>
            <TabsContent value="member" className="mt-4">
              <MemberLogin onDone={(m) => { setSession({ type: "member", name: `Member ${m}`, memberId: m, loginAt: new Date().toISOString() }); toast.success("Logged in via SSP"); redirect(); }} />
            </TabsContent>
            <TabsContent value="non" className="mt-4">
              <NonMemberLogin onDone={(name, email) => { setSession({ type: "non-member", name, email, loginAt: new Date().toISOString() }); toast.success("Verified successfully"); redirect(); }} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageShell>
  );
}

function MemberLogin({ onDone }: { onDone: (memberId: string) => void }) {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!id) return;
        setLoading(true);
        setTimeout(() => onDone(id), 1200);
      }}
      className="space-y-4"
    >
      <div>
        <Label>ICAI Member ID</Label>
        <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. 123456" className="mt-1" required />
      </div>
      <Button disabled={loading} className="w-full gap-2 bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Validating with SSP Portal…</> : <>Login with SSP <ArrowRight className="h-4 w-4" /></>}
      </Button>
      <p className="text-xs text-muted-foreground">Demo: any Member ID works. No real SSP call is made.</p>
    </form>
  );
}

function NonMemberLogin({ onDone }: { onDone: (name: string, email: string) => void }) {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (step === "form") {
    return (
      <form onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); setStep("otp"); toast.success("OTP sent. Use 123456 for demo."); }, 800); }} className="space-y-3">
        <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" /></div>
        <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" /></div>
        <div><Label>Mobile number</Label><Input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} required className="mt-1" /></div>
        <Button disabled={loading} className="w-full bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
        </Button>
      </form>
    );
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (otp === "123456") onDone(name, email); else toast.error("Invalid OTP — use 123456"); }} className="space-y-3">
      <div className="rounded-md border border-[color:var(--color-icai-gold)]/40 bg-[color:var(--color-icai-gold)]/10 p-3 text-xs">
        OTP sent to <b>{email}</b> and <b>{mobile}</b>. Use <b>123456</b> for demo.
      </div>
      <div><Label>Enter OTP</Label><Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="mt-1 tracking-widest" /></div>
      <Button className="w-full bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]">Verify &amp; Continue</Button>
      <button type="button" onClick={() => setStep("form")} className="w-full text-center text-xs text-muted-foreground hover:underline">← Edit details</button>
    </form>
  );
}
