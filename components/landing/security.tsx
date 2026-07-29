import { ShieldCheck, Smartphone, Building2, Lock } from "lucide-react";
import { Eyebrow } from "@/components/landing/eyebrow";
import { Reveal } from "@/components/landing/reveal";

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
    <section id="security" className="scroll-mt-20 px-6 py-20">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="flex flex-col items-center text-center">
          <Eyebrow>Security</Eyebrow>
          <ShieldCheck className="mt-6 size-7 text-primary" />
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tighter text-balance sm:text-4xl">
            Secure by design
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Filing with the government should not mean handing your details to
            one more place that might lose them.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {guarantees.map(({ icon: Icon, title, description }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <Icon className="size-5 text-primary" />
                <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
