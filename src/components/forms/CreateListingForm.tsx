import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sparkles, 
  Plus, 
  X, 
  Clock,
  Save,
  Wand2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface CreateListingFormProps {
  onClose?: () => void;
}

interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

const defaultHours: BusinessHours = {
  monday: { open: "09:00", close: "17:00", closed: false },
  tuesday: { open: "09:00", close: "17:00", closed: false },
  wednesday: { open: "09:00", close: "17:00", closed: false },
  thursday: { open: "09:00", close: "17:00", closed: false },
  friday: { open: "09:00", close: "17:00", closed: false },
  saturday: { open: "10:00", close: "16:00", closed: false },
  sunday: { open: "", close: "", closed: true },
};

const categories = [
  "Food & Beverage",
  "Technology", 
  "Health & Fitness",
  "Retail",
  "Services",
  "Entertainment",
  "Education",
  "Automotive",
  "Beauty & Wellness",
  "Professional Services"
];

export function CreateListingForm({ onClose }: CreateListingFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultHours);
  const [callout, setCallout] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleGenerateWithAI = async () => {
    setIsGeneratingAI(true);
    // Simulate AI generation
    setTimeout(() => {
      if (aiDescription.trim()) {
        // Mock AI-generated content based on description
        const mockGenerated = {
          title: "AI-Generated: " + aiDescription.slice(0, 50) + "...",
          description: `Based on your input: "${aiDescription}", this is a comprehensive listing description that highlights the key features and services. We provide excellent customer service and competitive pricing for all your needs.`,
          category: "Services",
          tags: ["professional", "quality", "customer-focused", "reliable"],
          callout: "🌟 Special offer for new customers - 20% off first service!"
        };
        
        setTitle(mockGenerated.title);
        setDescription(mockGenerated.description);
        setCategory(mockGenerated.category);
        setTags(mockGenerated.tags);
        setCallout(mockGenerated.callout);
      }
      setIsGeneratingAI(false);
    }, 2000);
  };

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSubmit = (status: 'draft' | 'published') => {
    const listingData = {
      title,
      description,
      category,
      tags,
      businessHours,
      callout,
      contactEmail,
      contactPhone,
      website,
      status
    };
    
    console.log('Saving listing:', listingData);
    toast({
      title: status === 'draft' ? "Draft Saved!" : "Listing Published!",
      description: status === 'draft' 
        ? "Your listing has been saved as a draft." 
        : "Your listing is now live and visible to customers.",
    });
    onClose?.();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Create New Listing</h1>
        <p className="text-muted-foreground">
          Add your business to our directory and reach more customers
        </p>
      </div>

      {/* AI Assistant Card */}
      <Card className="border-l-4 border-l-brand-orange">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-orange" />
            AI Listing Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ai-description">
              Describe your business and let AI create your listing
            </Label>
            <Textarea
              id="ai-description"
              placeholder="e.g., We are a family-owned coffee shop that serves artisanal coffee and fresh pastries. We focus on sustainable sourcing and provide a cozy atmosphere for remote work..."
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <Button 
            onClick={handleGenerateWithAI}
            disabled={!aiDescription.trim() || isGeneratingAI}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          >
            {isGeneratingAI ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Manual Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Business Name *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your business name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your business, services, and what makes you unique..."
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag (e.g., wifi, parking, organic)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddTag}
                      variant="outline"
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-red-500" 
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="callout">Promotional Callout</Label>
                <Input
                  id="callout"
                  value={callout}
                  onChange={(e) => setCallout(e.target.value)}
                  placeholder="e.g., 20% off for new customers!"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Optional promotional message to attract customers
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-24">
                    <Label className="capitalize">{day}</Label>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      disabled={hours.closed}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      disabled={hours.closed}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant={hours.closed ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => handleHoursChange(day, 'closed', !hours.closed)}
                    >
                      {hours.closed ? 'Closed' : 'Open'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@business.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Save Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => handleSubmit('draft')}
                variant="outline" 
                className="w-full"
                disabled={!title || !description || !category}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button 
                onClick={() => handleSubmit('published')}
                className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
                disabled={!title || !description || !category}
              >
                Publish Listing
              </Button>
              <p className="text-xs text-muted-foreground">
                Published listings will be visible to the public immediately
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}