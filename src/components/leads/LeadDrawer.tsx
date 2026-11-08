import React, { useMemo } from "react";
import { Link } from "react-router";
import { CalendarClock, Check, Mail, MessageSquare, Pencil, Phone, X as XIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/system/PersonAvatar";
import { HeatTag } from "@/components/system/HeatTag";
import { BantChip } from "@/components/system/BantChip";
import { mockConversations } from "@/data/mockData";
import { BANT_LABELS, bantDetail, bantFlags, heatWord, leadFullName, relativeDay } from "@/utils/leadInsight";
import { cn } from "@/lib/utils";
import { useLang } from "@/hooks/useLang";

interface LeadDrawerProps {
  lead: Record<string, any> | null;
  open: boolean;
  onClose: () => void;
  onEdit: (lead: any) => void;
  onMessage: (lead: any) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; aside?: React.ReactNode }> = ({ title, children, aside }) => (
  <section className="border-t border-border px-5 py-4 first:border-t-0">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
      {aside}
    </div>
    {children}
  </section>
);

/** Right-hand drawer for one lead: BANT breakdown, activity timeline and the WhatsApp conversation. */
export const LeadDrawer: React.FC<LeadDrawerProps> = ({ lead, open, onClose, onEdit, onMessage }) => {
  const { isRTL } = useLang();
  const messages = useMemo(() => {
    if (!lead) return [];
    const convo = mockConversations.find((c: any) => c.lead_id === lead.id);
    return (convo?.messages ?? []).slice(-6) as { id: string; sender: string; content: string; timestamp: string }[];
  }, [lead]);

  if (!lead) return null;
  const name = leadFullName(lead);
  const flags = bantFlags(lead);
  const details = bantDetail(lead);
  const events = [
    lead.next_followup && { when: lead.next_followup, text: "Follow-up planned", upcoming: true },
    lead.last_contact && { when: lead.last_contact, text: `Last contact, ${lead.interaction_count ?? 0} interactions in total` },
    lead.state && { when: lead.updated_at ?? lead.last_contact ?? lead.created_at, text: `Stage: ${String(lead.state).replace(/_/g, " ")}` },
    lead.created_at && { when: lead.created_at, text: `Lead created${lead.source ? ` from ${lead.source}` : ""}` },
  ].filter(Boolean) as { when: string; text: string; upcoming?: boolean }[];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side={isRTL ? "left" : "right"}
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-[460px]"
        data-testid="lead-drawer"
      >
        <SheetDescription className="sr-only">Lead details, BANT breakdown, activity and conversation</SheetDescription>
        <div className="flex items-start gap-3 px-5 pb-4 pt-5 pe-12">
          <PersonAvatar name={name} size="lg" />
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate text-lg font-semibold leading-6 tracking-[-0.01em]">{name}</SheetTitle>
            <p className="truncate text-sm text-muted-foreground">{lead.company || "No company"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <HeatTag temperature={heatWord(lead.temperature)} />
              <BantChip score={flags.filter(Boolean).length} met={flags} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-5 pb-4">
          <Button size="sm" onClick={() => onMessage(lead)}>
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Message
          </Button>
          {lead.phone && (
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${lead.phone}`}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call
              </a>
            </Button>
          )}
          {lead.email && (
            <Button size="sm" variant="outline" asChild>
              <a href={`mailto:${lead.email}`}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email
              </a>
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onEdit(lead)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Button>
        </div>

        <Section title="BANT breakdown" aside={<span className="num text-xs text-muted-foreground">{flags.filter(Boolean).length} of 4 met</span>}>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {BANT_LABELS.map((label, i) => (
              <li key={label} className="flex items-center gap-3 px-3 py-2.5">
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    flags[i] ? "bg-ember-500 text-white" : "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
                  )}
                >
                  {flags[i] ? <Check className="h-3 w-3" aria-hidden="true" /> : <XIcon className="h-3 w-3" aria-hidden="true" />}
                </span>
                <span className="w-20 text-[13px] font-medium text-foreground">{label}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-secondary-foreground">
                  <span className="sr-only">{flags[i] ? "Met. " : "Not met. "}</span>
                  {details[i] ?? (flags[i] ? "Confirmed in the conversation" : "Not confirmed yet")}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Activity">
          <ol className="relative space-y-4 ps-5 before:absolute before:inset-y-1 before:start-[5px] before:w-px before:bg-border">
            {events.map((e, i) => (
              <li key={i} className="relative">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -start-5 top-1 h-[11px] w-[11px] rounded-full border-2 border-surface",
                    e.upcoming ? "bg-ember-500" : "bg-ink-300 dark:bg-ink-600",
                  )}
                />
                <p className="text-[13px] text-foreground">{e.text}</p>
                <p className="num text-xs text-muted-foreground">{relativeDay(e.when)}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          title="Conversation"
          aside={
            <Link to="/messages" className="rounded-sm text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Open in Messages
            </Link>
          }
        >
          {messages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
              <CalendarClock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">No WhatsApp messages yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">The agent writes first once this lead reaches the queue.</p>
            </div>
          ) : (
            <ul className="space-y-1.5 rounded-lg bg-surface-sunken p-3" aria-label="Last messages">
              {messages.map((m) => (
                <li key={m.id} className={cn("flex", m.sender === "lead" ? "justify-start" : "justify-end")}>
                  <p
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-1.5 text-[13px] leading-5",
                      m.sender === "lead"
                        ? "rounded-ss-sm border border-border bg-surface text-foreground"
                        : "rounded-se-sm bg-whatsapp-bubble text-whatsapp-bubble-foreground",
                    )}
                  >
                    {m.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </SheetContent>
    </Sheet>
  );
};
