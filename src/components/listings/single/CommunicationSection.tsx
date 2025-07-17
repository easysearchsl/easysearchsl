
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Mail, MessageSquare, ExternalLink, Phone } from 'lucide-react';

interface CommunicationSectionProps {
  listing: any;
}

export function CommunicationSection({ listing }: CommunicationSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Phone className="h-6 w-6" />
          COMMUNICATION
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2 hover:bg-muted/80 transition-colors">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-1">Website</h4>
            <a 
              href={listing.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary text-sm hover:underline"
            >
              Visit Website
            </a>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2 hover:bg-muted/80 transition-colors">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-1">Contact</h4>
            <Button size="sm" variant="outline">
              Send Email
            </Button>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2 hover:bg-muted/80 transition-colors">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-1">Message</h4>
            <Button size="sm" variant="outline">
              Send Message
            </Button>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2 hover:bg-muted/80 transition-colors">
              <ExternalLink className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="font-semibold mb-1">Social</h4>
            <div className="flex justify-center gap-1">
              <Button size="sm" variant="outline" className="px-2">
                FB
              </Button>
              <Button size="sm" variant="outline" className="px-2">
                IG
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
