import { Eyebrow } from "@/components/landing/eyebrow";
import { Reveal } from "@/components/landing/reveal";

const steps = [
  {
    number: "01",
    title: "Verify your mobile number",
    description:
      "Sign in with a one-time code sent straight to your phone. No passwords to remember.",
  },
  {
    number: "02",
    title: "Access government services",
    description:
      "Submit a report, ask the AI assistant a question, or summarize a document.",
  },
  {
    number: "03",
    title: "Track everything in one place",
    description:
      "Follow your report status and revisit your AI chat history whenever you need to.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-6 py-20">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 max-w-xl text-3xl font-bold tracking-tighter text-balance sm:text-4xl">
            Three steps, no queue number
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-3">
            {steps.map(({ number, title, description }) => (
              <li
                key={number}
                className="bg-background p-6 transition-colors hover:bg-muted/50"
              >
                <span className="font-mono text-xs tracking-[0.2em] text-primary">
                  {number}
                </span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
