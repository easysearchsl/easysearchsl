import { SectionShell } from '@/components/listings/SectionShell';
import { Button } from '@/components/ui/button';
import { Globe, Mail, MessageSquare, Phone } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { Listing } from '@/types';
import { useNavigate } from 'react-router-dom';

interface CommunicationSectionProps {
  listing: Listing;
}

export const CommunicationSection = ({ listing }: CommunicationSectionProps) => {
  const navigate = useNavigate();

  const socialEntries = [
    { key: 'facebook', url: listing.social_links?.facebook, Icon: FaFacebook, label: 'Facebook' },
    { key: 'instagram', url: listing.social_links?.instagram, Icon: FaInstagram, label: 'Instagram' },
    { key: 'twitter', url: listing.social_links?.twitter, Icon: FaXTwitter, label: 'X / Twitter' },
    { key: 'linkedin', url: listing.social_links?.linkedin, Icon: FaLinkedin, label: 'LinkedIn' },
    { key: 'youtube', url: listing.social_links?.youtube, Icon: FaYoutube, label: 'YouTube' },
    { key: 'tiktok', url: listing.social_links?.tiktok, Icon: FaTiktok, label: 'TikTok' },
  ] as const;
  const hasSocials = socialEntries.some((s) => !!s.url);

  return (
    <SectionShell title="Communication" Icon={MessageSquare} accent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          {listing.website_url && (
            <a href={listing.website_url} target="_blank" rel="noreferrer" className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="p-4 rounded-lg flex flex-col items-center justify-center h-full border border-primary/20 bg-muted group-hover:bg-primary/5 transition-colors">
                <Globe className="h-8 w-8 mb-2" />
                <span className="font-semibold">Website</span>
                <span className="text-sm text-secondary">Visit Website</span>
              </div>
            </a>
          )}

          {listing.contact_email && (
            <a href={`mailto:${listing.contact_email}`} className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="p-4 rounded-lg flex flex-col items-center justify-center h-full border border-primary/20 bg-muted group-hover:bg-primary/5 transition-colors">
                <Mail className="h-8 w-8 mb-2" />
                <span className="font-semibold">Contact</span>
                <Button variant="link" className="text-sm">Send Email</Button>
              </div>
            </a>
          )}

          {listing.whatsapp_number && (
            <a
              href={`https://wa.me/${listing.whatsapp_number.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="p-4 rounded-lg flex flex-col items-center justify-center h-full border border-primary/20 bg-muted group-hover:bg-primary/5 transition-colors">
                <FaWhatsapp className="h-8 w-8 mb-2" />
                <span className="font-semibold">WhatsApp</span>
                <Button variant="link" className="text-sm">Send Message</Button>
              </div>
            </a>
          )}

          {listing.contact_phone && (
            <a href={`tel:${listing.contact_phone}`} className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="p-4 rounded-lg flex flex-col items-center justify-center h-full border border-primary/20 bg-muted group-hover:bg-primary/5 transition-colors">
                <Phone className="h-8 w-8 mb-2" />
                <span className="font-semibold">Call</span>
                <span className="text-sm text-secondary">Call Now</span>
              </div>
            </a>
          )}

          <div>
            <div className="p-4 rounded-lg flex flex-col items-center justify-center h-full border border-primary/20 bg-muted hover:bg-primary/5 focus-within:ring-2 focus-within:ring-primary transition-colors">
              <MessageSquare className="h-8 w-8 mb-2" />
              <span className="font-semibold">Message</span>
              <Button
                variant="link"
                className="text-sm"
                onClick={() => navigate('/inbox', { state: { listingId: listing.id } })}
              >
                Send Message
              </Button>
            </div>
          </div>

          {hasSocials && (
            <div>
              <div className="p-4 bg-muted rounded-lg flex flex-col items-center justify-center h-full">
                <span className="font-semibold mb-2">Social</span>
                <div className="mt-1 flex w-full items-center justify-center gap-2 sm:gap-3 md:gap-4 flex-wrap overflow-x-auto sm:overflow-visible">
                  {socialEntries.filter(s => !!s.url).map(({ url, Icon, label }) => (
                    <a
                      key={label}
                      href={url as string}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      title={label}
                      className="shrink-0 inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-primary/30 text-primary bg-background hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105"
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
    </SectionShell>
  );
};
