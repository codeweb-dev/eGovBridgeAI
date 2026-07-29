import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Eyebrow } from "@/components/landing/eyebrow";
import { Summarizer } from "./summarizer";

export default async function SummarizePage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  return (
    <div className="relative flex-1 px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[26px_26px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]"
      />
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <Eyebrow>Document Summarizer</Eyebrow>
          <h1 className="mt-5 text-3xl font-bold tracking-tighter">
            The gist, in plain language
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste a memo, ordinance, or notice. You get the key points back in
            seconds.
          </p>
        </div>
        <Summarizer />
      </div>
    </div>
  );
}
