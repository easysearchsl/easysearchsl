import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { createOrGetSupportThread, sendMessage } from "@/lib/messaging";

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const em = email.trim();
    const sj = subject.trim();
    const body = message.trim();
    if (!n || !em || !sj || !body) {
      toast({ title: "Missing information", description: "Please complete all fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Create or reuse a support thread and send the message
      const threadId = await createOrGetSupportThread();
      if (!threadId) {
        throw new Error("Unable to start a support conversation. Please sign in and try again.");
      }
      const combined = `Name: ${n}\nEmail: ${em}\nSubject: ${sj}\n\n${body}`;
      const ok = await sendMessage(threadId, combined);
      if (!ok) throw new Error("Failed to send your message. Please try again.");
      toast({ title: "Message sent", description: "Thanks! We'll get back to you shortly." });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSubmitting(false);
    } catch (err: unknown) {
      setSubmitting(false);
      const msg = err instanceof Error ? err.message : "Please try again.";
      toast({ title: "Unexpected error", description: msg, variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Get in Touch with EasySearch</h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl">
            We’re here to answer your questions, support your business, and help you connect with opportunities.
          </p>
        </div>
      </section>

      {/* Contact content */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5 text-primary" /> <span>EasySearch SL, Freetown, Sierra Leone</span></li>
                <li className="flex items-start gap-3"><Phone className="h-4 w-4 mt-0.5 text-primary" /> <a href="tel:+23276111111" className="hover:underline">+232-76-111111</a></li>
                <li className="flex items-start gap-3"><Mail className="h-4 w-4 mt-0.5 text-primary" /> <a href="mailto:info@easysearch.sl" className="hover:underline">info@easysearch.sl</a></li>
                <li className="flex items-start gap-3"><Clock className="h-4 w-4 mt-0.5 text-primary" /> <span>Monday – Friday, 9:00 AM – 5:00 PM</span></li>
              </ul>
            </div>

            {/* Optional Map */}
            <div className="rounded-lg overflow-hidden border border-border">
              <iframe
                title="EasySearch Office Map"
                className="w-full h-60"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.0189000000003!2d-13.231722!3d8.465700!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sFreetown!5e0!3m2!1sen!2ssl!4v1700000000000"
                allowFullScreen
              />
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
              <input
                id="name"
                className="w-full rounded-md border bg-background px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md border bg-background px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="subject">Subject</label>
              <input
                id="subject"
                className="w-full rounded-md border bg-background px-3 py-2"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
              <textarea
                id="message"
                rows={6}
                className="w-full rounded-md border bg-background px-3 py-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="inline-flex items-center gap-2">
              {submitting ? "Sending..." : (<><Send className="h-4 w-4" /> Send Message</>)}
            </Button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-6 md:pb-10">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="font-medium">How do I register my business on EasySearch?</div>
            <p className="mt-1 text-sm text-foreground/80">Click Register and follow the steps to create your listing.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="font-medium">What is a Featured Listing?</div>
            <p className="mt-1 text-sm text-foreground/80">Featured listings gain more visibility across the platform.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="font-medium">Is EasySearch free to use?</div>
            <p className="mt-1 text-sm text-foreground/80">Browsing is free. Optional paid plans unlock promotional features.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-10 md:py-12">
        <div className="rounded-lg border border-border bg-card p-6 md:p-8 text-center">
          <h3 className="text-2xl font-semibold">Ready to Grow Your Business?</h3>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a href="/register" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90 transition">Register Your Business</a>
            <a href="/listings" className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 hover:bg-accent transition">Browse Listings</a>
          </div>
        </div>
      </section>
    </div>
  );
}
