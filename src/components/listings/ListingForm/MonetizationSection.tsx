import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Star, TrendingUp, Target, Calendar, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface MonetizationSectionProps {
  data: any;
  onChange: (data: any) => void;
}

export function MonetizationSection({ data, onChange }: MonetizationSectionProps) {
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'featured',
    budget: '',
    duration: '7'
  });

  const campaignTypes = [
    { value: 'featured', label: 'Featured Listing', description: 'Appear at the top of search results' },
    { value: 'promoted', label: 'Promoted Listing', description: 'Highlighted in category browse' },
    { value: 'sponsored', label: 'Sponsored Content', description: 'Show in sponsored sections' }
  ];

  const addCampaign = () => {
    if (newCampaign.name.trim()) {
      onChange({
        ...data,
        adCampaigns: [...data.adCampaigns, { 
          id: Date.now(), 
          ...newCampaign,
          status: 'pending',
          createdAt: new Date().toISOString()
        }]
      });
      setNewCampaign({ name: '', type: 'featured', budget: '', duration: '7' });
    }
  };

  const removeCampaign = (id: string) => {
    onChange({
      ...data,
      adCampaigns: data.adCampaigns.filter((campaign: any) => campaign.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Listing Visibility
          </CardTitle>
          <CardDescription>
            Boost your listing's visibility and reach more customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="featured-listing">Featured Listing</Label>
              <p className="text-sm text-muted-foreground">
                Display your listing prominently in search results
              </p>
            </div>
            <Switch
              id="featured-listing"
              checked={data.featured}
              onCheckedChange={(checked) => onChange({ ...data, featured: checked })}
            />
          </div>

          {data.featured && (
            <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium text-primary">Featured Listing Active</h4>
                  <p className="text-sm text-muted-foreground">
                    Your listing will appear at the top of relevant searches
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="secondary">Premium</Badge>
                    <span className="text-sm">$29.99/month</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="verified-badge">Verified Badge</Label>
              <p className="text-sm text-muted-foreground">
                Show a verified checkmark on your listing
              </p>
            </div>
            <Switch
              id="verified-badge"
              checked={data.verifiedBadge || false}
              onCheckedChange={(checked) => onChange({ ...data, verifiedBadge: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="priority-support">Priority Support</Label>
              <p className="text-sm text-muted-foreground">
                Get faster customer support response times
              </p>
            </div>
            <Switch
              id="priority-support"
              checked={data.prioritySupport || false}
              onCheckedChange={(checked) => onChange({ ...data, prioritySupport: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Advertising Campaigns
          </CardTitle>
          <CardDescription>
            Create targeted campaigns to reach specific customer segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.adCampaigns.map((campaign: any) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {campaignTypes.find(type => type.value === campaign.type)?.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Budget: ${campaign.budget}</span>
                      <span>Duration: {campaign.duration} days</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCampaign(campaign.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
              <Input
                placeholder="Campaign name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              />
              
              <Select 
                value={newCampaign.type} 
                onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="campaign-budget">Budget ($)</Label>
                  <Input
                    id="campaign-budget"
                    type="number"
                    placeholder="50"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-duration">Duration (days)</Label>
                  <Select 
                    value={newCampaign.duration} 
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={addCampaign} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Tracking
          </CardTitle>
          <CardDescription>
            Monitor your listing's performance and ROI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">1,234</div>
              <div className="text-sm text-muted-foreground">Monthly Views</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">89</div>
              <div className="text-sm text-muted-foreground">Inquiries</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">7.2%</div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">$248</div>
              <div className="text-sm text-muted-foreground">Ad Spend</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics-tracking">Enhanced Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Get detailed insights into customer behavior
              </p>
            </div>
            <Switch
              id="analytics-tracking"
              checked={data.analyticsEnabled || false}
              onCheckedChange={(checked) => onChange({ ...data, analyticsEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="competitor-analysis">Competitor Analysis</Label>
              <p className="text-sm text-muted-foreground">
                Compare your performance with similar businesses
              </p>
            </div>
            <Switch
              id="competitor-analysis"
              checked={data.competitorAnalysis || false}
              onCheckedChange={(checked) => onChange({ ...data, competitorAnalysis: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}