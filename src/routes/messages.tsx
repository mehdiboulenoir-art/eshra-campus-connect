
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  Send,
  ArrowLeft,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { PageHeader, card } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/messages")({
  component: Page,
});

type Student = {
  id: string;
  full_name: string;
};

type Conversation = {
  id: string;
  otherUserId: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

function Page() {
  const [userId, setUserId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadConversations() {
    setError("");

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError("Please log in again.");
      setLoading(false);
      return;
    }

    const currentUser = userData.user.id;
    setUserId(currentUser);

    const { data: memberships, error: membershipError } = await supabase
      .from("conversation_members")
      .select("conversation_id, last_read_at")
      .eq("user_id", currentUser);

    if (membershipError) {
      setError(membershipError.message);
      setLoading(false);
      return;
    }

    const ids = [
      ...new Set((memberships ?? []).map((m) => m.conversation_id)),
    ];

    if (ids.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const { data: participants, error: participantError } = await supabase
      .from("conversation_members")
      .select("conversation_id, user_id")
      .in("conversation_id", ids)
      .neq("user_id", currentUser);

    if (participantError) {
      setError(participantError.message);
      setLoading(false);
      return;
    }

    const otherIds = [
      ...new Set((participants ?? []).map((p) => p.user_id)),
    ];

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", otherIds);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    const { data: recentMessages, error: messageError } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false });

    if (messageError) {
      setError(messageError.message);
      setLoading(false);
      return;
    }

    const result: Conversation[] = await Promise.all(
      (participants ?? []).map(async (participant) => {
        const profile = (profiles ?? []).find(
          (item) => item.id === participant.user_id
        );

        const membership = (memberships ?? []).find(
          (item) => item.conversation_id === participant.conversation_id
        );

        const lastMessage = (recentMessages ?? []).find(
          (message) =>
            message.conversation_id === participant.conversation_id
        );

        let unreadCount = 0;

        let unreadQuery = supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", participant.conversation_id)
          .neq("sender_id", currentUser);

        if (membership?.last_read_at) {
          unreadQuery = unreadQuery.gt(
            "created_at",
            membership.last_read_at
          );
        }

        const { count, error: unreadError } = await unreadQuery;

        if (!unreadError) {
          unreadCount = count ?? 0;
        }

        return {
          id: participant.conversation_id,
          otherUserId: participant.user_id,
          name: profile?.full_name || "Unknown",
          lastMessage: lastMessage?.content || "Start your conversation",
          unreadCount,
        };
      })
    );

    result.sort((a, b) => b.unreadCount - a.unreadCount);

    setConversations(result);
    setLoading(false);
  }

  async function loadMessages(conversationId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setMessages(data ?? []);
  }

  async function markConversationAsRead(conversationId: string) {
    const { error } = await supabase
      .from("conversation_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);

    if (error) {
      setError(error.message);
      return false;
    }

    return true;
  }

  useEffect(() => {
    void loadConversations();

    const channel = supabase
      .channel("messages-page-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage = payload.new as Message & {
            conversation_id: string;
          };

          if (newMessage.sender_id === userId) return;

          if (active?.id === newMessage.conversation_id) {
            await markConversationAsRead(newMessage.conversation_id);
            await loadMessages(newMessage.conversation_id);
          }

          await loadConversations();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, active?.id]);

  useEffect(() => {
    if (!search.trim() || !showSearch) {
      setStudents([]);
      return;
    }

    let cancelled = false;

    const searchStudents = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .ilike("full_name", `%${search.trim()}%`)
        .neq("id", userId)
        .limit(15);

      if (!cancelled) {
        if (error) {
          setError(error.message);
        } else {
          setStudents(data ?? []);
        }
      }
    };

    void searchStudents();

    return () => {
      cancelled = true;
    };
  }, [search, showSearch, userId]);

  async function openConversation(conversation: Conversation) {
    setActive(conversation);
    setMessages([]);

    const marked = await markConversationAsRead(conversation.id);

    await loadMessages(conversation.id);

    if (marked) {
      await loadConversations();
    }
  }

  async function startConversation(student: Student) {
    setError("");

    const { data, error } = await supabase.rpc("start_conversation", {
      p_other_user: student.id,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const conversation: Conversation = {
      id: data,
      otherUserId: student.id,
      name: student.full_name || "Unknown",
      lastMessage: "Start your conversation",
      unreadCount: 0,
    };

    setShowSearch(false);
    setSearch("");

    await loadConversations();
    await openConversation(conversation);
  }

  async function sendMessage() {
    const content = text.trim();

    if (!content || !active || !userId) return;

    setError("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: active.id,
      sender_id: userId,
      content,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setText("");
    await loadMessages(active.id);
    await loadConversations();
  }

  function formatTime(value: string) {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const totalUnread = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0
  );

  return (
    <>
      <PageHeader
        eyebrow="Discussions"
        title="Messages"
      >
        {totalUnread > 0 && (
          <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
            {totalUnread} unread {totalUnread === 1 ? "message" : "messages"}
          </span>
        )}
      </PageHeader>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm"
        >
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        {/* Conversations list */}
        <div className={`${card} p-3 ${active ? "hidden md:block" : ""}`}>
          <div className="mb-3 flex gap-2">
            <Button
              onClick={() => {
                setShowSearch(!showSearch);
                setSearch("");
              }}
              className="flex-1 gap-2"
            >
              <Search className="h-4 w-4" />
              Find students
            </Button>

            <Button
              variant="outline"
              size="icon"
              aria-label="Refresh conversations"
              onClick={() => void loadConversations()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {showSearch && (
            <div className="mb-4 space-y-2">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name..."
                className="w-full rounded-lg border bg-input/30 px-3 py-3 text-sm outline-none focus:border-brand"
              />

              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => void startConversation(student)}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-accent"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                    {student.full_name.slice(0, 2).toUpperCase()}
                  </span>

                  <span className="text-sm font-medium">
                    {student.full_name}
                  </span>
                </button>
              ))}

              {search.trim() && students.length === 0 && (
                <p className="p-2 text-sm text-muted-foreground">
                  No students found.
                </p>
              )}
            </div>
          )}

          <h2 className="mb-2 text-sm font-semibold">
            Your conversations
          </h2>

          {loading && (
            <p className="p-3 text-sm text-muted-foreground">
              Loading conversations...
            </p>
          )}

          {!loading && conversations.length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">
              No conversations yet. Search for a student to start one.
            </p>
          )}

          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => void openConversation(conversation)}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-accent ${
                active?.id === conversation.id ? "bg-accent" : ""
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                {conversation.name.slice(0, 2).toUpperCase()}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {conversation.name}
                </span>

                <span className="block truncate text-xs text-muted-foreground">
                  {conversation.unreadCount > 0
                    ? `${conversation.unreadCount} new ${
                        conversation.unreadCount === 1
                          ? "message"
                          : "messages"
                      }`
                    : conversation.lastMessage}
                </span>
              </span>

              {conversation.unreadCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
                  {conversation.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active conversation */}
        <div
          className={`${card} flex h-[65vh] flex-col p-0 ${
            active ? "flex" : "hidden md:flex"
          }`}
        >
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Back to conversations"
                  onClick={() => setActive(null)}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                  {active.name.slice(0, 2).toUpperCase()}
                </span>

                <p className="font-semibold">{active.name}</p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No messages yet. Say hello!
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === userId ? "justify-end" : ""
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                        message.sender_id === userId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}

                      <p className="mt-1 text-right text-[10px] opacity-70">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-t p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void sendMessage();
                  }}
                  placeholder="Write a message..."
                  className="min-w-0 flex-1 rounded-lg border bg-input/30 px-4 text-sm outline-none focus:border-brand"
                />

                <Button
                  aria-label="Send message"
                  onClick={() => void sendMessage()}
                  disabled={!text.trim()}
                  className="grid h-11 w-11 place-items-center"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
              <MessageCircle className="h-10 w-10" />
              Select a conversation or search for a student to start messaging.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
