import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X, Clock, DollarSign, Tag } from 'lucide-react';
import { useState } from 'react';

interface CoreInfoSectionProps {
  data: any;
  onChange: (data: any) => void;
}

export function CoreInfoSection({ data, onChange }: CoreInfoSectionProps) {
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Restaurant', 'Retail', 'Healthcare', 'Beauty & Spa', 'Fitness', 
    'Professional Services', 'Home Services', 'Education', 'Entertainment', 'Other'
  ];

  const priceRanges = [
    { value: '$', label: '$ - Budget friendly' },
    { value: '$$', label: '$$ - Moderate' },
    { value: '$$$', label: '$$$ - Premium' },
    { value: '$$$$', label: '$$$$ - Luxury' }
  ];

  const businessHours = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const addTag = () => {
    if (newTag.trim() && !data.tags.includes(newTag.trim())) {
      onChange({
        ...data,
        tags: [...data.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange({
      ...data,
      tags: data.tags.filter((tag: string) => tag !== tagToRemove)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Essential details that help customers find and understand your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Business Title *</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => onChange({ ...data, title: e.target.value })}
                placeholder="Enter your business name"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be the main heading customers see
              </p>
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={data.category} onValueChange={(value) => onChange({ ...data, category: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select business category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={data.tagline}
              onChange={(e) => onChange({ ...data, tagline: e.target.value })}
              placeholder="A brief, catchy description of your business"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Example: "Fresh, locally-sourced ingredients in every dish"
            </p>
          </div>

          <div>
            <Label htmlFor="priceRange">Price Range</Label>
            <Select value={data.priceRange} onValueChange={(value) => onChange({ ...data, priceRange: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags & Keywords
          </CardTitle>
          <CardDescription>
            Add relevant tags to help customers discover your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag (e.g. 'organic', 'family-friendly')"
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button onClick={addTag} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Popular tags: organic, family-friendly, wheelchair-accessible, parking-available
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours
          </CardTitle>
          <CardDescription>
            Set your operating hours to help customers know when you're open
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {businessHours.map(day => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">{day}</div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={data.businessHours[day.toLowerCase()]?.open || ''}
                    onChange={(e) => onChange({
                      ...data,
                      businessHours: {
                        ...data.businessHours,
                        [day.toLowerCase()]: {
                          ...data.businessHours[day.toLowerCase()],
                          open: e.target.value
                        }
                      }
                    })}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={data.businessHours[day.toLowerCase()]?.close || ''}
                    onChange={(e) => onChange({
                      ...data,
                      businessHours: {
                        ...data.businessHours,
                        [day.toLowerCase()]: {
                          ...data.businessHours[day.toLowerCase()],
                          close: e.target.value
                        }
                      }
                    })}
                    className="w-32"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChange({
                      ...data,
                      businessHours: {
                        ...data.businessHours,
                        [day.toLowerCase()]: { closed: true }
                      }
                    })}
                  >
                    Closed
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}