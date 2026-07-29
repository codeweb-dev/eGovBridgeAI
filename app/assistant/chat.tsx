"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  Check,
  Copy,
  MessageSquarePlus,
  PanelLeft,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteChat, sendMessage, type ChatEntry } from "./actions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I renew my passport?",
  "What documents do I need for a barangay clearance?",
  "How do I get a digital TIN ID?",
  "Where do I report a broken streetlight?",
];

// The API answers in one shot, so these are honest pacing labels, not real steps.
const THINKING = [
  "Reading your question",
  "Working through it",
  "Putting an answer together",
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Today / Yesterday / month buckets, in the order the chats already come in. */
function groupByDay(chats: ChatEntry[]) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();
  const groups = new Map<string, ChatEntry[]>();

  for (const chat of chats) {
    const day = new Date(chat.created_at).toDateString();
    const label =
      day === today
        ? "Today"
        : day === yesterday
          ? "Yesterday"
          : new Date(chat.created_at).toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            });
    groups.set(label, [...(groups.get(label) ?? []), chat]);
  }
  return [...groups];
}

export function Chat({
  history,
  firstName,
}: {
  history: ChatEntry[];
  firstName: string;
}) {
  const [chats, setChats] = useState(history);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [phase, setPhase] = useState(0);
  const [showHistory, setShowHistory] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!sending) return;
    const id = setInterval(
      () => setPhase((p) => (p + 1) % THINKING.length),
      2600,
    );
    return () => clearInterval(id);
  }, [sending]);

  async function ask(question: string) {
    if (!question || sending) return;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setPrompt("");
    setPhase(0);
    setSending(true);
    try {
      const entry = await sendMessage(question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: entry.response },
      ]);
      setChats((prev) => [entry, ...prev]);
      setActiveId(entry.id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to get a response.",
      );
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  function openChat(chat: ChatEntry) {
    setActiveId(chat.id);
    setMessages([
      { role: "user", content: chat.prompt },
      { role: "assistant", content: chat.response },
    ]);
  }

  function newChat() {
    setActiveId(null);
    setMessages([]);
    inputRef.current?.focus();
  }

  async function removeChat(chat: ChatEntry) {
    const before = chats;
    setChats(before.filter((c) => c.id !== chat.id));
    if (activeId === chat.id) newChat();
    try {
      await deleteChat(chat.id);
    } catch (err) {
      setChats(before);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete chat.",
      );
    }
  }

  return (
    <div className="flex h-svh min-h-0 w-full">
      {showHistory && (
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar/40 md:flex">
          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <span
              aria-hidden
              className="flex size-7 shrink-0 flex-col justify-center gap-[2px] rounded-lg bg-primary px-1.5"
            >
              <span className="h-[2px] rounded-full bg-primary-foreground" />
              <span className="h-[2px] rounded-full bg-brand-gold" />
              <span className="h-[2px] w-2/3 rounded-full bg-brand-red" />
            </span>
            <span className="truncate text-sm font-bold tracking-tight">
              eGov<span className="text-primary">Bridge</span>AI
            </span>
          </div>
          <div className="p-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={newChat}
            >
              <MessageSquarePlus className="size-4" />
              New chat
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
            {chats.length === 0 ? (
              <p className="px-2 py-6 text-xs text-muted-foreground">
                Your past questions will show up here.
              </p>
            ) : (
              groupByDay(chats).map(([label, group]) => (
                <div key={label} className="mb-4">
                  <p className="px-2 pb-1 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                    {label}
                  </p>
                  {group.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group/chat relative rounded-md transition-colors hover:bg-accent",
                        activeId === chat.id && "bg-accent",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => openChat(chat)}
                        className={cn(
                          "block w-full truncate rounded-md py-1.5 pr-8 pl-2 text-left text-sm group-hover/chat:text-accent-foreground",
                          activeId === chat.id
                            ? "font-medium text-accent-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {chat.prompt}
                      </button>
                      <DeleteChatButton chat={chat} onConfirm={removeChat} />
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={() => setShowHistory((s) => !s)}
            aria-label="Toggle chat history"
          >
            <PanelLeft className="size-4" />
          </Button>
          <span className="truncate text-sm text-muted-foreground">
            {chats.find((c) => c.id === activeId)?.prompt ?? "New chat"}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={newChat}
              aria-label="New chat"
            >
              <MessageSquarePlus className="size-4" />
            </Button>
            <ModeToggle />
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to dashboard</span>
            </Link>
          </div>
        </header>

        {messages.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
            <span
              aria-hidden
              className="flex size-11 flex-col justify-center gap-[3px] rounded-xl bg-primary px-2.5"
            >
              <span className="h-[3px] rounded-full bg-primary-foreground" />
              <span className="h-[3px] rounded-full bg-brand-gold" />
              <span className="h-[3px] w-2/3 rounded-full bg-brand-red" />
            </span>
            <h1 className="mt-6 text-3xl font-bold tracking-tighter">
              {greeting()}, <span className="text-primary">{firstName}</span>
            </h1>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Ask about permits, IDs, agencies, or anything government-related.
            </p>
            <div className="mt-8 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-xl border bg-card px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="min-h-0 flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent className="mx-auto w-full max-w-3xl px-6 py-6">
                  {messages.map((m, i) => (
                    <MessageScrollerItem
                      key={i}
                      messageId={String(i)}
                      scrollAnchor={m.role === "user"}
                    >
                      <Message align={m.role === "user" ? "end" : "start"}>
                        {m.role === "assistant" && (
                          <MessageAvatar>
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                <Bot className="size-4" />
                              </AvatarFallback>
                            </Avatar>
                          </MessageAvatar>
                        )}
                        <MessageContent>
                          <Bubble
                            variant={m.role === "user" ? "default" : "ghost"}
                          >
                            <BubbleContent className="whitespace-pre-wrap">
                              {m.content}
                            </BubbleContent>
                          </Bubble>
                          {m.role === "assistant" && (
                            <MessageFooter>
                              <CopyButton text={m.content} />
                            </MessageFooter>
                          )}
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}

                  {sending && (
                    <MessageScrollerItem messageId="pending">
                      <Marker role="status">
                        <MarkerIcon>
                          <Spinner />
                        </MarkerIcon>
                        <MarkerContent className="shimmer">
                          {THINKING[phase]}…
                        </MarkerContent>
                      </Marker>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}

        <div className="px-4 pb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(prompt.trim());
            }}
            className="mx-auto w-full max-w-3xl rounded-2xl border bg-card p-2 shadow-sm transition-colors focus-within:border-primary/40"
          >
            <Textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(prompt.trim());
                }
              }}
              rows={1}
              placeholder="Ask anything about government services…"
              className="max-h-40 min-h-0 resize-none border-0 bg-transparent px-2 py-1.5 shadow-none field-sizing-content focus-visible:ring-0"
            />
            <div className="flex items-center justify-between gap-2 px-2 pt-1">
              <span className="text-[11px] text-muted-foreground">
                Enter to send · Shift + Enter for a new line
              </span>
              <Button
                type="submit"
                size="icon-sm"
                disabled={sending || !prompt.trim()}
                aria-label="Send"
              >
                {sending ? <Spinner /> : <ArrowUp className="size-4" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function DeleteChatButton({
  chat,
  onConfirm,
}: {
  chat: ChatEntry;
  onConfirm: (chat: ChatEntry) => void;
}) {
  // AlertDialogAction is a plain Button, so closing is on us.
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete chat: ${chat.prompt}`}
            className="absolute top-1/2 right-1 size-6 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity group-hover/chat:opacity-100 focus-visible:opacity-100 hover:text-destructive"
          />
        }
      >
        <Trash2 className="size-3.5" />
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
          <AlertDialogDescription>
            “{chat.prompt}” and its answer will be permanently removed from your
            history. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              setOpen(false);
              onConfirm(chat);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Copy answer"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}
