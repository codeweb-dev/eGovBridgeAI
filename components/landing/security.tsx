import { ShieldCheck, Smartphone, Building2, Lock } from "lucide-react";
import { Eyebrow } from "@/components/landing/eyebrow";

const guarantees = [
  {
    icon: Smartphone,
    title: "One-time codes only",
    description:
      "Every sign-in is verified with a code sent to your phone. There is no password to leak or forget.",
  },
  {
    icon: Building2,
    title: "Straight to the agency",
    description:
      "Reports go directly to the eReport government API. Nothing sits in a middleman's inbox.",
  },
  {
    icon: Lock,
    title: "Private by default",
    description:
      "Your data stays in a database only eGovBridgeAI's servers can reach.",
  },
];

export function Security() {
  return (
    <section
      id="security"
      className="scroll-mt-20 px-6 py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Eyebrow>Security</Eyebrow>
          <ShieldCheck className="mt-6 size-7 text-primary" />
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tighter text-balance sm:text-4xl">
            Secure by design
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Filing with the government should not mean handing your details to
            one more place that might lose them.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {guarantees.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border bg-card p-6">
              <Icon className="size-5 text-primary" />
              <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
