import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CoreInfoSection } from './CoreInfoSection';
import { MediaSection } from './MediaSection';
import { ContentEngagementSection } from './ContentEngagementSection';
import { CommunicationSection } from './CommunicationSection';
import { InteractionSection } from './InteractionSection';
import { MonetizationSection } from './MonetizationSection';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, Sparkles, ChevronRight } from 'lucide-react';

interface ListingFormProps {
  initialData?: any;
  onSubmit?: (data: any) => void;
  onClose?: () => void;
}

export function ListingForm({ initialData, onSubmit, onClose }: ListingFormProps) {
  const [formData, setFormData] = useState({
    // Core Info
    title: initialData?.title || '',
    tagline: initialData?.tagline || '',
    category: initialData?.category || '',
    tags: initialData?.tags || [],
    businessHours: initialData?.businessHours || {},
    priceRange: initialData?.priceRange || '',
    
    // Media
    images: initialData?.images || [],
    videos: initialData?.videos || [],
    
    // Content & Engagement
    faqs: initialData?.faqs || [],
    announcements: initialData?.announcements || [],
    deals: initialData?.deals || [],
    menu: initialData?.menu || [],
    events: initialData?.events || [],
    
    // Communication
    website: initialData?.website || '',
    socialLinks: initialData?.socialLinks || {},
    leadForm: initialData?.leadForm || {},
    
    // Interaction
    reviewsEnabled: initialData?.reviewsEnabled !== false,
    bookingEnabled: initialData?.bookingEnabled || false,
    
    // Monetization
    featured: initialData?.featured || false,
    adCampaigns: initialData?.adCampaigns || []
  });

  const [activeTab, setActiveTab] = useState('core');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const tabs = [
    { id: 'core', label: 'Core Info', icon: '📝' },
    { id: 'media', label: 'Media', icon: '📸' },
    { id: 'content', label: 'Content & Engagement', icon: '💬' },
    { id: 'communication', label: 'Communication', icon: '📞' },
    { id: 'interaction', label: 'Interaction', icon: '⭐' },
    { id: 'monetization', label: 'Monetization', icon: '💰' }
  ];

  const handleSubmit = async () => {
    try {
      onSubmit?.(formData);
      toast({
        title: "Listing saved successfully!",
        description: "Your listing has been updated and is now live.",
      });
    } catch (error) {
      toast({
        title: "Error saving listing",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiSuggestions = {
        tagline: "Discover exceptional service that exceeds your expectations",
        tags: ["premium", "professional", "trusted", "local"],
        faqs: [
          {
            question: "What are your business hours?",
            answer: "We're open Monday to Friday, 9 AM to 6 PM, and weekends by appointment."
          },
          {
            question: "Do you offer consultations?",
            answer: "Yes, we provide free initial consultations to understand your needs."
          }
        ]
      };
      
      setFormData(prev => ({
        ...prev,
        ...aiSuggestions,
        tags: [...prev.tags, ...aiSuggestions.tags.filter(tag => !prev.tags.includes(tag))]
      }));
      
      toast({
        title: "AI content generated!",
        description: "Smart suggestions have been added to your listing.",
      });
    } catch (error) {
      toast({
        title: "AI generation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {initialData ? 'Edit Listing' : 'Create New Listing'}
            </h1>
            <p className="text-muted-foreground">
              Build a comprehensive listing to attract more customers
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateAIContent}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'AI Assist'}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span>Complete all sections for maximum visibility</span>
          <Badge variant="secondary">4/6 sections completed</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col gap-1 p-2">
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs hidden sm:block">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="core" className="mt-6">
          <CoreInfoSection
            data={formData}
            onChange={setFormData}
          />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaSection
            data={formData}
            onChange={setFormData}
          />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ContentEngagementSection
            data={formData}
            onChange={setFormData}
          />
        </TabsContent>

        <TabsContent value="communication" className="mt-6">
          <CommunicationSection
            data={formData}
            onChange={setFormData}
          />
        </TabsContent>

        <TabsContent value="interaction" className="mt-6">
          <InteractionSection
            data={formData}
            onChange={setFormData}
          />
        </TabsContent>

        <TabsContent value="monetization" className="mt-6">
          <MonetizationSection
            data={formData}
            onChange={setFormData}
          />
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 bg-success rounded-full"></div>
          Auto-saved 30 seconds ago
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save & Publish
          </Button>
        </div>
      </div>
    </div>
  );
}