import { Listing } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Info, Globe, UserCheck, Flag, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FaWhatsapp, FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useRef, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createOrGetThreadForListing, sendMessage, getCurrentUserId } from '@/lib/messaging';
import { SectionShell } from '@/components/listings/SectionShell';

function formatWhatsAppLink(raw?: string) {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return undefined;
  return `https://wa.me/${digits}`;
}

function makeMapsQuery(listing: Listing) {
  const parts: string[] = [];
  if (listing.full_address) parts.push(listing.full_address);
  const loc = listing.location || { province: '', district: listing.district || '', chiefdom: listing.chiefdom || '' };
  if (loc.chiefdom) parts.push(loc.chiefdom);
  if (loc.district) parts.push(loc.district.replace(' District', ''));
  if (loc.province) parts.push(loc.province);
  const query = parts.join(', ');
  if (!query) return undefined;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Simple Google Maps embed without API key
function makeMapsEmbedSrc(listing: Listing) {
  const parts: string[] = [];
  if (listing.full_address) parts.push(listing.full_address);
  const loc = listing.location || { province: '', district: listing.district || '', chiefdom: listing.chiefdom || '' };
  if (loc.chiefdom) parts.push(loc.chiefdom);
  if (loc.district) parts.push(loc.district.replace(' District', ''));
  if (loc.province) parts.push(loc.province);
  const query = parts.join(', ');
  if (!query) return undefined;
  // Public embed form that doesn't require a key
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function formatAddress(listing: Listing) {
  if (listing.full_address) return listing.full_address;
  const loc = listing.location || { province: '', district: listing.district || '', chiefdom: listing.chiefdom || '' };
  const parts = [loc.chiefdom, loc.district?.replace(' District', ''), loc.province].filter(Boolean);
  return parts.join(' / ');
}

export function AboutContactSection({ listing }: { listing: Listing }) {
  const waHref = formatWhatsAppLink(listing.whatsapp_number);
  const mapsHref = makeMapsQuery(listing);
  const mapsEmbed = makeMapsEmbedSrc(listing);
  const phoneHref = listing.contact_phone ? `tel:${listing.contact_phone}` : undefined;
  const emailHref = listing.contact_email ? `mailto:${listing.contact_email}` : undefined;
  const { toast } = useToast();
  const [showPhone, setShowPhone] = useState(false);
  const [showWa, setShowWa] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: '', details: '', name: '', email: '' });
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimForm, setClaimForm] = useState({
    firstName: '',
    lastName: '',
    businessEmail: '',
    phone: '',
    details: '',
    isReturning: false,
    loginEmail: '',
    loginPassword: '',
    signupEmail: '',
  });
  const [claimFile, setClaimFile] = useState<File | null>(null);
  const [claimFileName, setClaimFileName] = useState<string>('');
  const claimFileInputRef = useRef<HTMLInputElement | null>(null);
  const [msgText, setMsgText] = useState<string>('');
  const [msgSubmitting, setMsgSubmitting] = useState<boolean>(false);

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reportForm.reason.trim() || !reportForm.details.trim()) {
      toast({ title: 'Missing information', description: 'Please provide a reason and details.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('listing_reports').insert({
      listing_id: listing.id,
      listing_slug: listing.slug,
      listing_title: listing.title,
      reason: reportForm.reason,
      details: reportForm.details,
      reporter_name: reportForm.name || null,
      reporter_email: reportForm.email || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Failed to submit report', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Report submitted', description: 'Thank you for helping us keep listings accurate.' });
      setReportOpen(false);
      setReportForm({ reason: '', details: '', name: '', email: '' });
    }
  }

  async function handleMessageSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = msgText.trim();
    if (!body) {
      toast({ title: 'Message is empty', description: 'Please write a message before sending.', variant: 'destructive' });
      return;
    }
    const userId = await getCurrentUserId();
    if (!userId) {
      toast({ title: 'Sign in required', description: 'Please sign in to send a message to the business owner.', variant: 'destructive' });
      return;
    }
    setMsgSubmitting(true);
    try {
      const threadId = await createOrGetThreadForListing(listing.id);
      if (!threadId) {
        toast({ title: 'Failed to start conversation', description: 'Please try again later.' , variant: 'destructive'});
        setMsgSubmitting(false);
        return;
      }
      const ok = await sendMessage(threadId, body);
      setMsgSubmitting(false);
      if (ok) {
        toast({ title: 'Message sent', description: 'Your message has been delivered to the listing owner.' });
        setMsgText('');
      } else {
        toast({ title: 'Failed to send message', description: 'Please try again.' , variant: 'destructive'});
      }
    } catch (err: unknown) {
      setMsgSubmitting(false);
      const message = err instanceof Error ? err.message : 'Please try again.';
      toast({ title: 'Unexpected error', description: message , variant: 'destructive'});
    }
  }

  async function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!claimForm.firstName.trim() || !claimForm.lastName.trim() || !claimForm.businessEmail.trim() || !claimForm.phone.trim() || !claimForm.details.trim()) {
      toast({ title: 'Missing information', description: 'Please complete all required fields.', variant: 'destructive' });
      return;
    }
    setClaimSubmitting(true);
    let attachment_url: string | null = null;
    try {
      if (claimFile) {
        const path = `${listing.id}/${Date.now()}_${claimFile.name}`;
        const { error: upErr } = await supabase.storage.from('listing_claim_attachments').upload(path, claimFile);
        if (!upErr) {
          const { data } = supabase.storage.from('listing_claim_attachments').getPublicUrl(path);
          attachment_url = data?.publicUrl ?? null;
        }
      }
    } catch (err) {
      // ignore attachment errors for now; user can resubmit without file
    }
    const { data: auth } = await supabase.auth.getUser();
    const reporter_user_id = auth?.user?.id ?? null;
    const { error: insertError } = await supabase.from('listing_claims').insert({
      listing_id: listing.id,
      listing_slug: listing.slug,
      listing_title: listing.title,
      first_name: claimForm.firstName,
      last_name: claimForm.lastName,
      business_email: claimForm.businessEmail,
      phone: claimForm.phone,
      details: claimForm.details,
      is_returning: claimForm.isReturning,
      login_email: claimForm.isReturning ? claimForm.loginEmail || null : null,
      signup_email: !claimForm.isReturning ? claimForm.signupEmail || null : null,
      attachment_url,
      reporter_user_id,
    });
    setClaimSubmitting(false);
    if (insertError) {
      toast({ title: 'Failed to submit claim', description: insertError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Claim submitted', description: 'We will verify and contact you shortly.' });
      setClaimOpen(false);
      setClaimForm({ firstName: '', lastName: '', businessEmail: '', phone: '', details: '', isReturning: false, loginEmail: '', loginPassword: '', signupEmail: '' });
      setClaimFile(null);
    }
  }

  const hasAbout = !!(listing.description || listing.mission_statement || listing.vision_statement);
  const hasContact = !!(formatAddress(listing) || listing.contact_phone || listing.whatsapp_number || listing.contact_email);

  if (!hasAbout && !hasContact) return null;

  return (
    <SectionShell title="About & Contact" Icon={Info} accent>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: Description + Accordion */}
      <div className="lg:col-span-2 space-y-4">
        {/* Top description card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Info className="h-5 w-5" /> About Us
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm md:text-base">
            {listing.description ? (
              <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
            ) : (
              <p className="text-muted-foreground">No description provided.</p>
            )}
          </CardContent>
        </Card>

        {/* Details accordion (Team Members, Mission, Vision, Registration Status, Specialties) */}
        <Card>
          <CardContent className="p-0">
            <Accordion type="single" collapsible defaultValue="team">
              <AccordionItem value="team">
                <AccordionTrigger className="px-6">Team Members</AccordionTrigger>
                <AccordionContent className="px-6">
                  {Array.isArray(listing.team_members) && listing.team_members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {listing.team_members.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {m.photo_url ? (
                              <AvatarImage src={m.photo_url} alt={m.full_name} loading="lazy" />
                            ) : (
                              <AvatarFallback>
                                {(m.full_name || '')
                                  .split(' ')
                                  .map((p) => p[0])
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase() || 'TM'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium">{m.full_name || '—'}</div>
                            {m.position && (
                              <div className="text-xs text-muted-foreground">{m.position}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </AccordionContent>
              </AccordionItem>
              {listing.mission_statement && (
                <AccordionItem value="mission">
                  <AccordionTrigger className="px-6">Mission</AccordionTrigger>
                  <AccordionContent className="px-6">
                    <p className="text-sm md:text-base text-muted-foreground whitespace-pre-line">
                      {listing.mission_statement}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}
              {listing.vision_statement && (
                <AccordionItem value="vision">
                  <AccordionTrigger className="px-6">Vision</AccordionTrigger>
                  <AccordionContent className="px-6">
                    <p className="text-sm md:text-base text-muted-foreground whitespace-pre-line">
                      {listing.vision_statement}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="registration">
                <AccordionTrigger className="px-6">Registration Status</AccordionTrigger>
                <AccordionContent className="px-6">
                  <div className="text-sm md:text-base text-muted-foreground space-y-2">
                    <div>
                      <span className="font-medium">Legal Status:</span>{' '}
                      {listing.legal_status || '—'}
                    </div>
                    <div>
                      <span className="font-medium">Year Registered:</span>{' '}
                      {listing.year_registered ? String(listing.year_registered) : '—'}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="specialties">
                <AccordionTrigger className="px-6">Specialties</AccordionTrigger>
                <AccordionContent className="px-6">
                  {Array.isArray(listing.tags) && listing.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((t, i) => (
                        <Badge key={i} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Map + Contact + Socials */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-0">
            {/* Map */}
            <div className="p-3">
              {mapsEmbed ? (
                <iframe
                  title="Location Map"
                  src={mapsEmbed}
                  className="w-full h-48 md:h-56 rounded-md border"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="w-full h-48 md:h-56 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                  No location
                </div>
              )}
            </div>

            {/* Contact list */}
            <div className="border-t p-4 space-y-3 text-sm md:text-base">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  {mapsHref ? (
                    <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {formatAddress(listing) || '—'}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{formatAddress(listing) || '—'}</span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  {phoneHref ? (
                    showPhone ? (
                      <div className="flex items-center gap-2">
                        <a href={phoneHref} className="text-primary hover:underline">{listing.contact_phone}</a>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:underline"
                          onClick={() => setShowPhone(false)}
                        >
                          Hide
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setShowPhone(true)}
                      >
                        Show
                      </button>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaWhatsapp className="h-5 w-5 mt-0.5 text-green-600 shrink-0" />
                <div>
                  {waHref ? (
                    showWa ? (
                      <div className="flex items-center gap-2">
                        <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{listing.whatsapp_number}</a>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:underline"
                          onClick={() => setShowWa(false)}
                        >
                          Hide
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setShowWa(true)}
                      >
                        Show
                      </button>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  {emailHref ? (
                    showEmail ? (
                      <div className="flex items-center gap-2">
                        <a href={emailHref} className="text-primary hover:underline">{listing.contact_email}</a>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:underline"
                          onClick={() => setShowEmail(false)}
                        >
                          Hide
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setShowEmail(true)}
                      >
                        Show
                      </button>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <div className="font-medium">Website</div>
                  {listing.website_url ? (
                    <a href={listing.website_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {listing.website_url}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>

              {/* Social icons row */}
              <TooltipProvider>
                <div className="flex gap-2 pt-1">
                  {listing.social_links?.facebook && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={listing.social_links.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <FaFacebook className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Facebook</TooltipContent>
                    </Tooltip>
                  )}
                  {listing.social_links?.instagram && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={listing.social_links.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <FaInstagram className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Instagram</TooltipContent>
                    </Tooltip>
                  )}
                  {listing.social_links?.twitter && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={listing.social_links.twitter} target="_blank" rel="noreferrer" aria-label="X (Twitter)" title="X / Twitter" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <FaXTwitter className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>X / Twitter</TooltipContent>
                    </Tooltip>
                  )}
                  {listing.social_links?.linkedin && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={listing.social_links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <FaLinkedin className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>LinkedIn</TooltipContent>
                    </Tooltip>
                  )}
                  {listing.social_links?.youtube && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={listing.social_links.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" title="YouTube" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <FaYoutube className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>YouTube</TooltipContent>
                    </Tooltip>
                  )}
                  {listing.social_links?.tiktok && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a href={listing.social_links.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" title="TikTok" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <FaTiktok className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>TikTok</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
        {(() => {
          const cp = listing.contact_person;
          const hasCP = !!(cp && (cp.full_name || cp.position || cp.phone || cp.email || cp.avatar_url));
          if (!hasCP) return null;
          const cpPhoneHref = cp?.phone ? `tel:${cp.phone}` : undefined;
          const cpEmailHref = cp?.email ? `mailto:${cp.email}` : undefined;
          const cpWaHref = cp?.phone ? formatWhatsAppLink(cp.phone) : undefined;
          const nameForInitials = (cp?.full_name?.trim() || 'Contact Person');
          const initials = nameForInitials
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(p => p[0]?.toUpperCase())
            .join(' ');
          return (
            <Card className="mb-4 border-primary/30 bg-primary/5 ring-1 ring-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Contact Person</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 ring-2 ring-primary shadow-sm bg-background">
                    {cp?.avatar_url ? (
                      <AvatarImage src={cp.avatar_url} alt={cp?.full_name || 'Contact Person'} />
                    ) : null}
                    <AvatarFallback delayMs={0}>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{cp?.full_name || '—'}</div>
                    {cp?.position && (
                      <div className="text-xs text-muted-foreground truncate">{cp.position}</div>
                    )}
                  </div>
                  <TooltipProvider>
                    <div className="flex items-center gap-2">
                      {cpPhoneHref && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a href={cpPhoneHref} aria-label="Call contact person" title="Call" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105">
                              <Phone className="h-4 w-4" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>Call</TooltipContent>
                        </Tooltip>
                      )}
                      {cpEmailHref && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a href={cpEmailHref} aria-label="Email contact person" title="Email" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105">
                              <Mail className="h-4 w-4" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>Email</TooltipContent>
                        </Tooltip>
                      )}
                      {cpWaHref && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a href={cpWaHref} target="_blank" rel="noreferrer" aria-label="WhatsApp contact person" title="WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105">
                              <FaWhatsapp className="h-4 w-4" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>WhatsApp</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Claim / Report Cards */}
        <Card className="border-primary/30 bg-primary/5 ring-1 ring-primary/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="text-sm md:text-base">Own or work here?</span>
            </div>
            <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
              <DialogTrigger asChild>
                <Button type="button" size="sm" variant="default">Claim Now!</Button>
              </DialogTrigger>
              <DialogContent className="w-[96vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>Claiming Your Business Listing</DialogTitle>
                  <DialogDescription className="mb-3 sm:mb-4">Complete the form below to claim “{listing.title}”. Claim requests are processed after verification.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleClaimSubmit} className="space-y-5 my-3 sm:my-5 py-2 sm:py-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="claim-first">First</Label>
                      <Input id="claim-first" value={claimForm.firstName} onChange={(e) => setClaimForm({ ...claimForm, firstName: e.target.value })} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="claim-last">Last</Label>
                      <Input id="claim-last" value={claimForm.lastName} onChange={(e) => setClaimForm({ ...claimForm, lastName: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="claim-bemail">Business E-mail</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex"><Info className="h-3.5 w-3.5 text-muted-foreground" aria-label="Business email info" /></span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Please Provide Your Business Email Which Will Be Use For Claim Procedure.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input id="claim-bemail" type="email" placeholder="business@email.com" value={claimForm.businessEmail} onChange={(e) => setClaimForm({ ...claimForm, businessEmail: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="claim-phone">Phone</Label>
                    <Input id="claim-phone" placeholder="111-111-234" value={claimForm.phone} onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })} required />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="claim-details">Verification details</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex"><Info className="h-3.5 w-3.5 text-muted-foreground" aria-label="Verification details info" /></span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Please Provide Your Verification Details Which Will Be Used For Claim Procedure.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          ref={claimFileInputRef}
                          id="claim-attachment"
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf,.doc,.docx"
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            setClaimFile(f);
                            setClaimFileName(f ? f.name : '');
                          }}
                        />
                        <Button
                          type="button"
                          variant="link"
                          className="px-0 h-auto text-xs"
                          onClick={() => claimFileInputRef.current?.click()}
                        >
                          Attach File
                        </Button>
                      </div>
                    </div>
                    <Textarea id="claim-details" rows={4} placeholder="Detail description about your listing" value={claimForm.details} onChange={(e) => setClaimForm({ ...claimForm, details: e.target.value })} required />
                    {claimFileName ? (
                      <div className="text-xs text-muted-foreground">Selected: {claimFileName}</div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Attachment optional</div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox id="claim-returning" checked={claimForm.isReturning} onCheckedChange={(v) => setClaimForm({ ...claimForm, isReturning: Boolean(v) })} />
                      <Label htmlFor="claim-returning" className="cursor-pointer">Returning user? Check this box to sign in</Label>
                    </div>
                    {claimForm.isReturning ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="claim-login-email">Username or Email</Label>
                          <Input id="claim-login-email" value={claimForm.loginEmail} onChange={(e) => setClaimForm({ ...claimForm, loginEmail: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="claim-login-pass">Password</Label>
                          <Input id="claim-login-pass" type="password" value={claimForm.loginPassword} onChange={(e) => setClaimForm({ ...claimForm, loginPassword: e.target.value })} />
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Label htmlFor="claim-signup-email">New user? To signup enter an email</Label>
                        <Input id="claim-signup-email" type="email" value={claimForm.signupEmail} onChange={(e) => setClaimForm({ ...claimForm, signupEmail: e.target.value })} />
                      </div>
                    )}
                  </div>
                  <DialogFooter className="mt-3 sm:mt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={claimSubmitting}>{claimSubmitting ? 'Submitting…' : 'Claim Your Business Now!'}</Button>
                  </DialogFooter>
                  <p className="text-xs text-muted-foreground mt-2">Claim request is processed after verification.</p>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5 ring-1 ring-primary/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              <span className="text-sm md:text-base">See something wrong?</span>
            </div>
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <Button type="button" size="sm" variant="default">Report Now!</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Listing</DialogTitle>
                  <DialogDescription>
                    You are reporting “{listing.title}”. Please provide a brief reason and details.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="report-reason">Reason</Label>
                    <Input
                      id="report-reason"
                      placeholder="Incorrect info, fraud, duplicate..."
                      value={reportForm.reason}
                      onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="report-details">Details</Label>
                    <Textarea
                      id="report-details"
                      rows={5}
                      placeholder="Describe the issue in detail. Include what’s wrong and any evidence."
                      value={reportForm.details}
                      onChange={(e) => setReportForm({ ...reportForm, details: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="report-name">Your name (optional)</Label>
                      <Input
                        id="report-name"
                        value={reportForm.name}
                        onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="report-email">Your email (optional)</Label>
                      <Input
                        id="report-email"
                        type="email"
                        value={reportForm.email}
                        onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Report'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        {/* Message / Inbox Form */}
        <Card className="mt-4 border-primary/30 bg-primary/5 ring-1 ring-primary/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-1 ring-border">
                <AvatarImage src={listing.logo_url || ''} alt={listing.title} />
                <AvatarFallback>{listing.title?.slice(0,2)?.toUpperCase() || 'B'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-base truncate">Message {listing.title}</CardTitle>
                <div className="text-xs text-muted-foreground truncate">Send a message to the business owner</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleMessageSubmit} className="space-y-3">
              <Textarea
                id="listing-message"
                rows={4}
                placeholder={`Write your message to ${listing.title}...`}
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={msgSubmitting}>{msgSubmitting ? 'Sending…' : 'Send Message'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </SectionShell>
  );
}
