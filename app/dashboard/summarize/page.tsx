import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Summarizer } from "./summarizer";

export default async function SummarizePage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <h1 className="text-2xl font-bold tracking-tighter">Document Summarizer</h1>
      <Summarizer />
    </div>
  );
}
