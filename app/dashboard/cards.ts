import { FileText, ClipboardList, Bot, Sparkles } from "lucide-react";

export const dashboardCards = [
  {
    title: "Submit Report",
    description: "File a new report with the relevant government agency.",
    href: "/dashboard/report/new",
    icon: FileText,
  },
  {
    title: "My Reports",
    description: "Track the status of reports you've submitted.",
    href: "/dashboard/reports",
    icon: ClipboardList,
  },
  {
    title: "AI Assistant",
    description: "Ask government-related questions and get instant answers.",
    href: "/assistant",
    icon: Bot,
  },
  {
    title: "Document Summarizer",
    description: "Summarize lengthy government documents in seconds.",
    href: "/dashboard/summarize",
    icon: Sparkles,
  },
];
