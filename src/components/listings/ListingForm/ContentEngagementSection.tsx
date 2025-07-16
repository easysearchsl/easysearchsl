import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Megaphone, Tag, Calendar, MenuIcon, Plus, X, Edit } from 'lucide-react';
import { useState } from 'react';

interface ContentEngagementSectionProps {
  data: any;
  onChange: (data: any) => void;
}

export function ContentEngagementSection({ data, onChange }: ContentEngagementSectionProps) {
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [newDeal, setNewDeal] = useState({ title: '', description: '', validUntil: '' });
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', description: '' });

  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      onChange({
        ...data,
        faqs: [...data.faqs, { id: Date.now(), ...newFaq }]
      });
      setNewFaq({ question: '', answer: '' });
    }
  };

  const removeFaq = (id: string) => {
    onChange({
      ...data,
      faqs: data.faqs.filter((faq: any) => faq.id !== id)
    });
  };

  const addDeal = () => {
    if (newDeal.title.trim()) {
      onChange({
        ...data,
        deals: [...data.deals, { id: Date.now(), ...newDeal }]
      });
      setNewDeal({ title: '', description: '', validUntil: '' });
    }
  };

  const removeDeal = (id: string) => {
    onChange({
      ...data,
      deals: data.deals.filter((deal: any) => deal.id !== id)
    });
  };

  const addMenuItem = () => {
    if (newMenuItem.name.trim()) {
      onChange({
        ...data,
        menu: [...data.menu, { id: Date.now(), ...newMenuItem }]
      });
      setNewMenuItem({ name: '', price: '', description: '' });
    }
  };

  const removeMenuItem = (id: string) => {
    onChange({
      ...data,
      menu: data.menu.filter((item: any) => item.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Answer common customer questions to reduce inquiries and build trust
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.faqs.map((faq: any) => (
              <div key={faq.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFaq(faq.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
              <Input
                placeholder="Question (e.g., 'What are your payment methods?')"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              />
              <Textarea
                placeholder="Answer"
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                rows={3}
              />
              <Button onClick={addFaq} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Deals & Promotions
          </CardTitle>
          <CardDescription>
            Attract customers with special offers and limited-time deals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.deals.map((deal: any) => (
              <div key={deal.id} className="border rounded-lg p-4 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{deal.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{deal.description}</p>
                    {deal.validUntil && (
                      <Badge variant="outline" className="text-xs">
                        Valid until {new Date(deal.validUntil).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDeal(deal.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
              <Input
                placeholder="Deal title (e.g., '20% off first visit')"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
              />
              <Textarea
                placeholder="Deal description"
                value={newDeal.description}
                onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                rows={2}
              />
              <Input
                type="date"
                value={newDeal.validUntil}
                onChange={(e) => setNewDeal({ ...newDeal, validUntil: e.target.value })}
              />
              <Button onClick={addDeal} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Deal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MenuIcon className="h-5 w-5" />
            Menu / Services
          </CardTitle>
          <CardDescription>
            Showcase your products, services, or menu items with pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.menu.map((item: any) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.price && (
                        <Badge variant="secondary">{item.price}</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMenuItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Item name"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                />
                <Input
                  placeholder="Price (optional)"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                />
              </div>
              <Textarea
                placeholder="Description (optional)"
                value={newMenuItem.description}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                rows={2}
              />
              <Button onClick={addMenuItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}