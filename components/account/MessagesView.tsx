"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/messages";

// One list. There are no folders because there is nowhere else a notice could
// be: you cannot send Markaz a message, there are no sellers to write to you,
// and a notice derived from an order cannot be deleted — it would come back the
// moment the page was rebuilt.
const MessagesView = ({ messages, readAt: initialReadAt }: any) => {
    const [readAt, setReadAt] = useState(initialReadAt);
    const [busy, setBusy] = useState(false);

    const isNew = (message: any) => !readAt || new Date(message.date).getTime() > new Date(readAt).getTime();
    const unread = messages.filter(isNew).length;

    const markRead = async () => {
        setBusy(true);

        try {
            const { data } = await axios.put("/api/user/messages");
            setReadAt(data.readAt);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            {unread > 0 && (
                <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-fg-muted">
                        {unread} new since you last looked.
                    </p>
                    <Button variant="outline" size="sm" loading={busy} onClick={markRead}>
                        Mark all as read
                    </Button>
                </div>
            )}

            <ul className="divide-y divide-line rounded-card border border-line bg-surface">
                {messages.map((message: any) => (
                    <li key={message.id}>
                        <Link href={message.href} className="block px-4 py-4 hover:bg-surface-muted">
                            <span className="flex flex-wrap items-center gap-2">
                                <Badge tone={isNew(message) ? "accent" : "neutral"}>{message.kind}</Badge>
                                <span className="text-xs text-fg-subtle">{formatDate(message.date)}</span>
                            </span>
                            <span className="mt-1.5 block text-sm font-medium text-fg">{message.title}</span>
                            <span className="mt-0.5 block text-sm text-fg-muted">{message.body}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default MessagesView;
