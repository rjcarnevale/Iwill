"use client";

import { createClient } from "@/lib/supabase/client";
import { Notification } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchNotifications() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("notifications")
        .select(
          `
          *,
          actor:profiles!notifications_actor_id_fkey(*),
          will:wills(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setNotifications((data as Notification[]) || []);
      setLoading(false);

      // Mark all as read
      if (data && data.length > 0) {
        const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
        if (unreadIds.length > 0) {
          await supabase
            .from("notifications")
            .update({ read: true })
            .in("id", unreadIds);
        }
      }
    }

    fetchNotifications();
  }, [router]);

  const getNotificationContent = (notification: Notification) => {
    const actorName =
      notification.actor?.display_name ||
      notification.actor?.username ||
      "Someone";

    switch (notification.type) {
      case "will_received":
        return {
          icon: "👀",
          text: (
            <>
              <strong>{actorName}</strong> has left you something in their Will 👀
            </>
          ),
        };
      case "will_accepted":
        return {
          icon: "🙏",
          text: (
            <>
              <strong>{actorName}</strong> accepted what you left them
            </>
          ),
        };
      case "will_declined":
        return {
          icon: "👎",
          text: (
            <>
              <strong>{actorName}</strong> passed on what you left them
            </>
          ),
        };
      case "reaction":
        return {
          icon: notification.emoji || "❤️",
          text: (
            <>
              <strong>{actorName}</strong> reacted {notification.emoji} to your
              will
            </>
          ),
        };
      case "funeral_invite":
        return {
          icon: "⚰️",
          text: (
            <>
              <strong>{actorName}</strong> invited you to their funeral
            </>
          ),
        };
      case "will_contested":
        const itemName = notification.will?.item_description || "your Will";
        return {
          icon: "⚖️",
          text: (
            <>
              <strong>{actorName}</strong> has contested your Will for {itemName} ⚖️
            </>
          ),
        };
      default:
        return {
          icon: "🔔",
          text: "New notification",
        };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <main className="min-h-screen">
      <header className="gradient-header sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="hover:opacity-80 transition">
            ← Back
          </Link>
          <h1 className="font-bold tracking-wide">Notifications</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="card-dark rounded-2xl p-12 text-center">
            <p className="text-[var(--text-muted)]">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card-dark rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-[var(--text-muted)]">No notifications yet.</p>
            <p className="text-[var(--text-muted)] text-sm mt-2">
              When someone wills you something or reacts to your wills,
              you&apos;ll see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const content = getNotificationContent(notification);
              return (
                <Link
                  key={notification.id}
                  href={
                    notification.type === "funeral_invite"
                      ? `/profile/${notification.actor?.username}`
                      : notification.type === "will_contested" && notification.will_id
                      ? `/will/${notification.will_id}`
                      : notification.will_id
                      ? `/profile/${notification.actor?.username}`
                      : "#"
                  }
                  className={`block card-dark rounded-xl p-4 hover:bg-white/5 transition ${
                    !notification.read ? "border-l-4 border-[var(--purple)]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {notification.actor?.avatar_url ? (
                        <Image
                          src={notification.actor.avatar_url}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 gradient-avatar rounded-full flex items-center justify-center text-lg">
                          {content.icon}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{content.text}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    <div className="text-2xl flex-shrink-0">{content.icon}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 gradient-cta">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
          <span>💀</span>
          <a
            href="https://instagram.com/gotwilled"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sm tracking-wide hover:opacity-80 transition"
          >
            @gotwilled
          </a>
        </div>
      </footer>
    </main>
  );
}
