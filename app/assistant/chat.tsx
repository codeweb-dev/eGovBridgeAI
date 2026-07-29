"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  Check,
  Copy,
  MapPin,
  MessageSquarePlus,
  Mic,
  PanelLeft,
  Square,
  Trash2,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/markdown";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { LatLng } from "@/components/location-map";
import {
  deleteChat,
  describeLocation,
  sendMessage,
  type ChatEntry,
} from "./actions";

// Leaflet touches `window` on import, so it can only load in the browser.
const LocationMap = dynamic(() => import("@/components/location-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-xl border">
      <Spinner />
    </div>
  ),
});
import { Logo } from "@/components/logo";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I renew my passport?",
  "What documents do I need for a barangay clearance?",
  "How do I get a digital TIN ID?",
  "Where do I report a broken streetlight?",
  "What are the requirements for a business permit?",
  "How do I apply for a driver's license?",
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
    stopSpeaking();
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

  function appendToPrompt(text: string) {
    setPrompt((p) => (p ? `${p.trimEnd()} ${text}` : text));
    inputRef.current?.focus();
  }

  function openChat(chat: ChatEntry) {
    stopSpeaking();
    setActiveId(chat.id);
    setMessages([
      { role: "user", content: chat.prompt },
      { role: "assistant", content: chat.response },
    ]);
  }

  function newChat() {
    stopSpeaking();
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
          <div className="flex items-center gap-2 border-b px-3 py-4">
            <Logo />
          </div>
          <div className="p-3 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className={`${buttonVariants({ variant: "default" })} w-full justify-start`}
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

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
          </div>
        </header>

        {messages.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-6">
              <Logo />
            </div>
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
                      // Keyed by chat so switching remounts the read-aloud buttons.
                      key={`${activeId}-${i}`}
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
                            <BubbleContent>
                              {m.role === "user" ? (
                                <span className="whitespace-pre-wrap">
                                  {m.content}
                                </span>
                              ) : (
                                <Markdown className="max-w-[37em]">
                                  {m.content}
                                </Markdown>
                              )}
                            </BubbleContent>
                          </Bubble>
                          {m.role === "assistant" && (
                            <MessageFooter>
                              <CopyButton text={m.content} />
                              <SpeakButton text={m.content} />
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
              <div className="flex items-center gap-1">
                <LocationButton disabled={sending} onPick={appendToPrompt} />
                <MicButton disabled={sending} onTranscript={appendToPrompt} />
                <Button
                  type="submit"
                  size="icon-sm"
                  disabled={sending || !prompt.trim()}
                  aria-label="Send"
                >
                  {sending ? <Spinner /> : <ArrowUp className="size-4" />}
                </Button>
              </div>
            </div>
          </form>

          {/* The empty state already shows these as cards — don't repeat them there. */}
          <div className="mx-auto mt-2 flex w-full max-w-3xl flex-wrap gap-1.5 empty:mt-0">
            {(messages.length === 0 ? [] : SUGGESTIONS).map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="h-auto cursor-pointer py-1 whitespace-normal hover:bg-muted hover:text-foreground"
                render={
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => ask(s)}
                  />
                }
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationButton({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState<LatLng | null>(null);
  const [resolving, setResolving] = useState(false);

  async function confirm() {
    if (!pin) return;
    setResolving(true);
    try {
      onPick(`(near ${await describeLocation(pin[0], pin[1])})`);
      setOpen(false);
      setPin(null);
    } finally {
      setResolving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label="Add a location to your question"
          />
        }
      >
        <MapPin className="size-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pin a location</DialogTitle>
          <DialogDescription>
            Click the map to drop a pin. The address gets added to your
            question.
          </DialogDescription>
        </DialogHeader>
        {/* Leaflet needs `window`, and only mount it once the dialog is open. */}
        {open && (
          <LocationMap
            value={pin}
            onChange={setPin}
            className="z-0 h-80 min-h-0 rounded-xl border"
          />
        )}
        <DialogFooter>
          <p className="mr-auto self-center font-mono text-xs text-muted-foreground">
            {pin ? `${pin[0].toFixed(5)}, ${pin[1].toFixed(5)}` : "No pin yet"}
          </p>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button onClick={confirm} disabled={!pin || resolving}>
            {resolving ? <Spinner /> : null}
            Use this location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Web Speech API, Chrome/Safari/Edge only — webkit-prefixed everywhere but Chrome. */
function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult:
    | ((e: {
        resultIndex: number;
        results: ArrayLike<
          ArrayLike<{ transcript: string }> & { isFinal: boolean }
        >;
      }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function MicButton({
  onTranscript,
  disabled,
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  // Feature-detect after mount so the server and client markup agree.
  useEffect(() => setSupported(getSpeechRecognition() !== null), []);
  useEffect(() => () => recRef.current?.stop(), []);

  function toggle() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;

    const rec = new Ctor();
    recRef.current = rec;
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = navigator.language || "en-US";
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal)
          onTranscript(e.results[i][0].transcript.trim());
      }
    };
    rec.onerror = (e) => {
      setListening(false);
      if (e.error !== "aborted" && e.error !== "no-speech") {
        toast.error(
          e.error === "not-allowed"
            ? "Microphone access was blocked."
            : "Dictation stopped unexpectedly.",
        );
      }
    };
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  }

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant={listening ? "destructive" : "ghost"}
      size="icon-sm"
      disabled={disabled}
      onClick={toggle}
      aria-label={listening ? "Stop dictation" : "Dictate your question"}
      aria-pressed={listening}
    >
      <Mic className={cn("size-4", listening && "animate-pulse")} />
    </Button>
  );
}

function stopSpeaking() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/** Speech synthesis reads plain text, so flatten the markdown first. */
function speakable(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => stopSpeaking, []);

  function toggle() {
    if (!window.speechSynthesis) return;
    stopSpeaking();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(speakable(text));
    utterance.lang = navigator.language || "en-US";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={speaking ? "Stop reading" : "Read answer aloud"}
    >
      {speaking ? (
        <Square className="size-3.5" />
      ) : (
        <Volume2 className="size-3.5" />
      )}
    </Button>
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
