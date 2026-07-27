"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { sendMessage } from "./actions";
import { Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = prompt.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setPrompt("");
    setSending(true);
    try {
      const answer = await sendMessage(question);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to get a response.",
      );
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="flex h-[70vh] flex-col">
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ask a government-related question to get started.
          </p>
        ) : (
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent>
                  {messages.map((m, i) => (
                    <MessageScrollerItem
                      key={i}
                      messageId={String(i)}
                      scrollAnchor={m.role === "user"}
                    >
                      <Message align={m.role === "user" ? "end" : "start"}>
                        <MessageAvatar>
                          <Avatar>
                            <AvatarFallback>
                              {m.role === "user" ? "You" : <Bot size={16} />}
                            </AvatarFallback>
                          </Avatar>
                        </MessageAvatar>
                        <MessageContent>
                          <Bubble
                            variant={m.role === "user" ? "default" : "muted"}
                          >
                            <BubbleContent className="whitespace-pre-wrap">
                              {m.content}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}
                  {sending && (
                    <MessageScrollerItem messageId="pending">
                      <Message align="start">
                        <MessageAvatar>
                          <Avatar>
                            <AvatarFallback>
                              <Bot size={16} />
                            </AvatarFallback>
                          </Avatar>
                        </MessageAvatar>
                        <MessageContent>
                          <Bubble variant="muted">
                            <BubbleContent className="text-muted-foreground">
                              Thinking…
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 pb-1">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question…"
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !prompt.trim()}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
