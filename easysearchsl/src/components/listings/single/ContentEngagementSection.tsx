
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Megaphone, Gift, MenuIcon, Calendar } from 'lucide-react';

interface ContentEngagementSectionProps {
  listing: any;
}

export function ContentEngagementSection({ listing }: ContentEngagementSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          CONTENT & ENGAGEMENT
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="faqs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">FAQs</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Deals</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <MenuIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Menu</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="faqs" className="space-y-4 mt-4">
            {listing.faqs.map((faq: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <h4 className="font-semibold mb-2">{faq.question}</h4>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="announcements" className="space-y-4 mt-4">
            {listing.announcements.map((announcement: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-blue-600" />
                      {announcement.title}
                    </h4>
                    <p className="text-muted-foreground mb-2">{announcement.content}</p>
                    <span className="text-xs text-blue-600 font-medium">{announcement.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="deals" className="space-y-4 mt-4">
            {listing.deals.map((deal: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-green-50/50 hover:bg-green-50 transition-colors">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{deal.title}</h4>
                    <p className="text-muted-foreground mb-2">{deal.description}</p>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Valid until: {deal.validUntil}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="menu" className="space-y-6 mt-4">
            {listing.menu.map((category: any, index: number) => (
              <div key={index}>
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MenuIcon className="h-5 w-5" />
                  {category.category}
                </h4>
                <div className="space-y-3">
                  {category.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="flex justify-between items-start p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <h5 className="font-medium">{item.name}</h5>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <span className="font-semibold text-primary ml-4">{item.price}</span>
                    </div>
                  ))}
                </div>
                {index < listing.menu.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
