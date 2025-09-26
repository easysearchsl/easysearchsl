import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Listing, BusinessHours, DayHours, SocialLinks, ContactPerson, FAQ } from "@/types";
import { provinces } from "@/data/locations";
import { UploadCloud, Image as ImageIcon, Trash2, PlusCircle } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CategoryMultiSelect from "@/components/controls/CategoryMultiSelect";
import { categoryTree } from "@/data/categories";

const quillStyle = `
  .ql-editor {
    min-height: 120px; 
  }
`;

const targetAudiences = ['Youth', 'Women', 'Girls', 'Boys', 'PWD\'s', 'Students', 'Vulnerable Groups', 'Entrepreneurs', 'Traders', 'Others'];

// Gallery image constraints and compression helpers
const MAX_GALLERY_IMAGES = 8;
const TOTAL_GALLERY_SIZE_LIMIT_BYTES = 20 * 1024 * 1024; // 20MB total after compression
const MAX_DIMENSION = 1600; // Max width/height for gallery images
const OUTPUT_QUALITY = 0.82; // JPEG quality
// Category selection limit
const MAX_CATEGORIES = 5;

function fileFromBlob(blob: Blob, filename: string, type: string): File {
  return new File([blob], filename, { type });
}

async function compressImage(file: File): Promise<File> {
  // Skip compression for GIF to preserve animation
  if (file.type === 'image/gif') return file;

  // Prefer JPEG output for better compression on photos
  const outType = 'image/jpeg';
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = objectUrl;
      i.decoding = 'async';
    });
    const { width, height } = img;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    // If no resize needed and JPEG already, we can keep original
    if (scale === 1 && (file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, outType, OUTPUT_QUALITY)
    );
    if (!blob) return file;

    const base = file.name.replace(/\.[^.]+$/, '');
    const optimized = fileFromBlob(blob, `${base}-opt.jpg`, outType);
    return optimized;
  } catch (_) {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

type TeamMemberForm = { full_name: string; position?: string; photoFile?: File | null };

interface CreateListingFormProps {
  initialValues?: Partial<Listing>;
  onSubmit: (
    listingData: Omit<Listing, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>,
    imageFiles: File[],
    logoFile?: File | null,
    contactPersonAvatarFile?: File | null,
    teamMemberPhotoFiles?: (File | null)[],
    retainedMedia?: {
      existingImageUrls?: string[];
      existingLogoUrl?: string;
      existingContactAvatarUrl?: string;
      existingTeamMemberPhotoUrls?: (string | undefined)[];
    }
  ) => void;
  onCancel?: () => void;
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

// categories are now provided by `categoryTree` in `@/data/categories`

export function CreateListingForm({ initialValues, onSubmit, onCancel }: CreateListingFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categoriesSelected, setCategoriesSelected] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultHours);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [chiefdom, setChiefdom] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [videoUrl, setVideoUrl] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [logo, setLogo] = useState<File | null>(null);
  const [contactPersonAvatar, setContactPersonAvatar] = useState<File | null>(null);
  const [legalStatus, setLegalStatus] = useState<'Registered' | 'Not Registered' | 'Registration in Progress' | 'Hope to Register' | ''>('');
  const [yearRegistered, setYearRegistered] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<ContactPerson>({});
  const [teamMembers, setTeamMembers] = useState<TeamMemberForm[]>([]);
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([{ question: '', answer: '' }]);
  const [fullAddress, setFullAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [visionStatement, setVisionStatement] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Existing media URLs for edit mode
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | undefined>(undefined);
  const [existingContactAvatarUrl, setExistingContactAvatarUrl] = useState<string | undefined>(undefined);
  const [existingTeamMemberPhotoUrls, setExistingTeamMemberPhotoUrls] = useState<(string | undefined)[]>([]);

  // Initialize state from initialValues when provided (edit mode)
  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title || "");
    setDescription(initialValues.description || "");
    setCategory(initialValues.category || "");
    setTags(initialValues.tags || []);
    setBusinessHours(initialValues.business_hours || defaultHours);
    setContactEmail(initialValues.contact_email || "");
    setContactPhone(initialValues.contact_phone || "");
    setWebsite(initialValues.website_url || "");
    const lv = initialValues.location as any;
    setProvince(lv?.province || "");
    setDistrict(lv?.district || "");
    setChiefdom(lv?.chiefdom || "");
    setSocialLinks(initialValues.social_links || {});
    setVideoUrl((initialValues.videos && initialValues.videos[0]) || "");
    setLegalStatus(initialValues.legal_status || "");
    setYearRegistered(initialValues.year_registered ? String(initialValues.year_registered) : "");
    setContactPerson(initialValues.contact_person || {});
    setTeamMembers((initialValues.team_members || []).map(tm => ({ full_name: tm.full_name, position: tm.position, photoFile: null })));
    setTargetAudience(initialValues.target_audience || []);
    setFaqs((initialValues.faqs || []).map(f => ({ question: f.question, answer: f.answer })));
    setFullAddress(initialValues.full_address || "");
    setWhatsappNumber(initialValues.whatsapp_number || "");
    setVisionStatement(initialValues.vision_statement || "");
    setMissionStatement(initialValues.mission_statement || "");

    // Existing media
    setExistingImageUrls(initialValues.images || []);
    setExistingLogoUrl(initialValues.logo_url);
    setExistingContactAvatarUrl(initialValues.contact_person?.avatar_url);
    setExistingTeamMemberPhotoUrls((initialValues.team_members || []).map(tm => tm.photo_url));
    // Initialize categories (multi-select) from initialValues (clamped to max)
    if (Array.isArray((initialValues as any).categories) && (initialValues as any).categories.length > 0) {
      const incoming = (initialValues as any).categories as string[];
      setCategoriesSelected(incoming.slice(0, MAX_CATEGORIES));
      // Keep single category string in sync for compatibility (take first top-level label)
      const first = incoming[0] as string;
      const top = first.split('/')[0];
      const node = categoryTree.find(t => t.value === top);
      if (node) setCategory(node.label);
    } else if (initialValues.category) {
      // Map legacy single label to a top-level value
      const node = categoryTree.find(t => t.label.toLowerCase() === String(initialValues.category).toLowerCase());
      if (node) setCategoriesSelected([node.value]);
    }
  }, [initialValues]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleProvinceChange = (selectedProvince: string) => {
    setProvince(selectedProvince);
    setDistrict(""); // Reset district when province changes
    const provinceData = provinces.find(p => p.name === selectedProvince);
    setAvailableDistricts(provinceData ? provinceData.districts : []);
  };

  const handleRemoveSocialLink = (platform: keyof SocialLinks) => {
    setSocialLinks(prev => {
      const newLinks = { ...prev };
      delete newLinks[platform];
      return newLinks;
    });
  };

  const handleDescriptionChange = (content: string) => {
    const plainText = content.replace(/<[^>]*>?/gm, '');
    if (plainText.length <= 2500) {
      setDescription(content);
    }
  };

  const handleImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFiles = async (files: File[]) => {
    if (!files?.length) return;

    // Enforce max image count
    const remaining = MAX_GALLERY_IMAGES - images.length;
    if (remaining <= 0) {
      toast({ title: "Limit reached", description: `You can upload a maximum of ${MAX_GALLERY_IMAGES} images.`, variant: "destructive" });
      return;
    }
    const toProcess = files.slice(0, remaining);

    // Validate types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const invalidFiles = toProcess.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({ title: "Invalid file type", description: `Only JPG, PNG, or GIF are allowed.`, variant: "destructive" });
      return;
    }

    // Compress/resize before adding
    const optimized = await Promise.all(toProcess.map(f => compressImage(f)));

    // Enforce total size limit AFTER optimization
    const currentTotal = images.reduce((acc, f) => acc + f.size, 0);
    const incomingTotal = optimized.reduce((acc, f) => acc + f.size, 0);
    if (currentTotal + incomingTotal > TOTAL_GALLERY_SIZE_LIMIT_BYTES) {
      const mb = Math.round(TOTAL_GALLERY_SIZE_LIMIT_BYTES / (1024 * 1024));
      toast({ title: "Total size too large", description: `Total gallery size after optimization must not exceed ${mb}MB. Try fewer images or smaller files.`, variant: "destructive" });
      return;
    }

    setImages(prev => [...prev, ...optimized]);
  };

  const handleContactPersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactPerson(prev => ({ ...prev, [name]: value }));
  };

  const handleAudienceChange = (audience: string) => {
    setTargetAudience(prev => 
      prev.includes(audience) 
        ? prev.filter(item => item !== audience) 
        : [...prev, audience]
    );
  };

  const handleFaqChange = (index: number, field: keyof typeof faqs[0], value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index: number) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(newFaqs);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast({ title: "Error", description: "Logo size cannot exceed 2MB.", variant: "destructive" });
        return;
      }
      setLogo(file);
    }
  };

  const handleContactPersonAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Error", description: "Invalid file type. Please upload JPG, PNG, or GIF.", variant: "destructive" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast({ title: "Error", description: "Avatar size cannot exceed 2MB.", variant: "destructive" });
        return;
      }
      setContactPersonAvatar(file);
    }
  };

  const addTeamMember = () => {
    setTeamMembers(prev => [...prev, { full_name: '', position: '', photoFile: null }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleTeamMemberChange = (index: number, field: 'full_name' | 'position', value: string) => {
    setTeamMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const handleTeamMemberPhotoSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Error", description: "Invalid file type. Please upload JPG, PNG, or GIF.", variant: "destructive" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB per member
        toast({ title: "Error", description: "Team member photo cannot exceed 2MB.", variant: "destructive" });
        return;
      }
    }
    setTeamMembers(prev => prev.map((m, i) => i === index ? { ...m, photoFile: file } : m));
  };

  const handleSocialLinkChange = (platform: keyof SocialLinks, url: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: url,
    }));
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
        };
        
        setTitle(mockGenerated.title);
        setDescription(mockGenerated.description);
        setCategory(mockGenerated.category);
        // Sync multi-select based on generated category label
        const node = categoryTree.find(t => t.label.toLowerCase() === mockGenerated.category.toLowerCase());
        if (node) setCategoriesSelected([node.value]);
        setTags(mockGenerated.tags);
      }
      setIsGeneratingAI(false);
    }, 2000);
  };

    const handleHoursChange = (day: keyof BusinessHours, field: keyof DayHours, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (status: 'draft' | 'published') => {
    // Validate at least one category selected
    if (categoriesSelected.length === 0) {
      toast({ title: "Category required", description: "Please select at least one category.", variant: "destructive" });
      return;
    }
    // Enforce max categories (defensive check)
    if (categoriesSelected.length > MAX_CATEGORIES) {
      toast({ title: "Too many categories", description: `Please select at most ${MAX_CATEGORIES} categories.`, variant: "destructive" });
      return;
    }
    const filteredTeamMembers = teamMembers.filter(m => m.full_name && m.full_name.trim());
    const teamMemberPhotoFiles = filteredTeamMembers.map(m => m.photoFile || null);
    
    // Keep legacy single category string in sync (use top-level label of first selected)
    const compatCategory = category || (() => {
      const first = categoriesSelected[0];
      const top = first.split('/')[0];
      const node = categoryTree.find(t => t.value === top);
      return node?.label || "";
    })();

    const listingData = {
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-') || `listing-${Date.now()}`,
      tagline: "", // Placeholder
      description,
      vision_statement: visionStatement,
      mission_statement: missionStatement,
      category: compatCategory,
      categories: categoriesSelected,
      tags,
      location: {
        province,
        district,
        chiefdom,
      },
      full_address: fullAddress,
      business_hours: businessHours,
      price_range: 'moderate' as const,
      videos: videoUrl ? [videoUrl] : [],
      images: [],
      announcements: [],
      deals: [],
      menu: [],
      events: [],
      contact_email: contactEmail,
      contact_phone: contactPhone,
      whatsapp_number: whatsappNumber,
      website_url: website,
      social_links: socialLinks,
      contact_person: contactPerson,
      team_members: filteredTeamMembers.map(m => ({ full_name: m.full_name.trim(), position: m.position?.trim() || undefined })),
      target_audience: targetAudience,
      faqs: faqs.filter(faq => faq.question && faq.answer).map((faq, index) => ({ ...faq, id: `temp-faq-${index}`, order: index })),
      reviews: [],
      rating: 0,
      review_count: 0,
      view_count: 0,
      likes_count: 0,
      booking_enabled: false,
      status,
      featured_until: "",
      legal_status: legalStatus || undefined,
      year_registered: yearRegistered ? parseInt(yearRegistered) : undefined,
      verified: false,
    };
    onSubmit(
      listingData as Omit<Listing, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>,
      images,
      logo,
      contactPersonAvatar,
      teamMemberPhotoFiles,
      {
        existingImageUrls,
        existingLogoUrl,
        existingContactAvatarUrl,
        existingTeamMemberPhotoUrls,
      }
    );
    
    toast({
      title: status === 'draft' ? "Draft Saved!" : "Listing Published!",
      description: status === 'draft' 
        ? "Your listing has been saved as a draft." 
        : "Your listing is now live and visible to customers.",
    });

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Create New Listing</h1>
        <p className="text-muted-foreground">
          Add your business to our directory and reach more customers
        </p>
      </div>

      {/* AI Listing Assistant */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <span>AI Listing Assistant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Generate a compelling business description using AI. Provide a few keywords about your business, and let our assistant craft a professional summary for you.
            </p>
            <Textarea
              id="ai-description"
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              placeholder="e.g., local artisan coffee, eco-friendly, live music events"
            />
            <Button 
              onClick={handleGenerateWithAI} 
              disabled={isGeneratingAI || !aiDescription}
              className="w-full"
            >
              {isGeneratingAI ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Generate with AI</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Business Name */}
        <Card>
          <CardHeader>
            <CardTitle>Business Name *</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your business name"
            />
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">Province / Region</Label>
                <Select value={province} onValueChange={handleProvinceChange}>
                  <SelectTrigger id="province" className="mt-2">
                    <SelectValue placeholder="Select a province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Select value={district} onValueChange={setDistrict} disabled={!province}>
                  <SelectTrigger id="district" className="mt-2">
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d.replace(' District', '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="chiefdom">Chiefdom / Town / Area</Label>
              <Input
                id="chiefdom"
                value={chiefdom}
                onChange={(e) => setChiefdom(e.target.value)}
                placeholder="e.g., Western Urban, Kakua"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="full-address">Full Address</Label>
              <Textarea
                id="full-address"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="e.g. 123 Main Street, Freetown"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <style>{quillStyle}</style>
              <div className="mt-2 bg-white rounded-md">
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your business, services, and what makes you unique..."
                  modules={{ toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link'],
                    ['clean']
                  ]}}
                />
              </div>
              <p className="text-sm text-muted-foreground text-right mt-1">
                {description.replace(/<[^>]*>?/gm, '').length} / 2500
              </p>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <div id="category" className="mt-2">
                <CategoryMultiSelect
                  tree={categoryTree}
                  value={categoriesSelected}
                  onChange={(vals) => {
                    // Component enforces, but clamp defensively as well
                    const next = vals.slice(0, MAX_CATEGORIES);
                    setCategoriesSelected(next);
                    const first = vals[0];
                    const top = first ? first.split('/')[0] : "";
                    const node = categoryTree.find(t => t.value === top);
                    setCategory(node?.label || "");
                  }}
                  placeholder="Select one or more categories"
                  maxSelected={MAX_CATEGORIES}
                />
              </div>
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
          </CardContent>
        </Card>

        {/* Vision & Mission */}
        <Card>
          <CardHeader>
            <CardTitle>Vision & Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="vision-statement">Vision Statement</Label>
              <Textarea
                id="vision-statement"
                value={visionStatement}
                onChange={(e) => setVisionStatement(e.target.value)}
                placeholder="e.g., To be the leading provider of..."
                className="mt-2 min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="mission-statement">Mission Statement</Label>
              <Textarea
                id="mission-statement"
                value={missionStatement}
                onChange={(e) => setMissionStatement(e.target.value)}
                placeholder="e.g., Our mission is to empower..."
                className="mt-2 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contact-email">Contact Email *</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="info@yourbusiness.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
              <Input
                id="whatsapp-number"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+232 77 123456"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Contact Phone</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(socialLinks) as Array<keyof SocialLinks>).map((platform) => (
              <div key={platform} className="flex items-center gap-2">
                <Label className="capitalize w-24">{platform}</Label>
                <Input
                  type="url"
                  value={socialLinks[platform] || ''}
                  onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                  placeholder={`https://{platform}.com/yourpage`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSocialLink(platform)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <Label>Add a new social link</Label>
              <div className="flex items-center gap-2">
                <Select 
                  onValueChange={(value) => {
                    if (value && !socialLinks.hasOwnProperty(value)) {
                      handleSocialLinkChange(value as keyof SocialLinks, '');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="youtube">Youtube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Person */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Person</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="cp-full-name">Full Name (Contact Person)</Label>
              <Input id="cp-full-name" name="full_name" value={contactPerson.full_name || ''} onChange={handleContactPersonChange} placeholder="Full Name (Contact Person)" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="cp-position">Position (Contact Person)</Label>
              <Input id="cp-position" name="position" value={contactPerson.position || ''} onChange={handleContactPersonChange} placeholder="Position" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="cp-phone">Phone (Contact Person)</Label>
              <Input id="cp-phone" name="phone" value={contactPerson.phone || ''} onChange={handleContactPersonChange} placeholder="Phone" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="cp-email">Email (Contact Person)</Label>
              <Input id="cp-email" name="email" type="email" value={contactPerson.email || ''} onChange={handleContactPersonChange} placeholder="Email" className="mt-2" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="cp-avatar">Contact Person Avatar</Label>
              <p className="text-sm text-muted-foreground">This photo will appear on your listing next to the contact details to help customers recognize the contact person. Use a clear, professional headshot. Recommended square (1:1).</p>
              <div className="flex items-center gap-4">
                {contactPersonAvatar && (
                  <img
                    src={URL.createObjectURL(contactPersonAvatar)}
                    alt="Avatar preview"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-muted"
                  />
                )}
                <Input id="cp-avatar" type="file" accept="image/*" onChange={handleContactPersonAvatarSelect} className="max-w-sm" />
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG, or GIF up to 2MB.</p>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {teamMembers.length === 0 && (
              <p className="text-sm text-muted-foreground">Add your team members with their name, position, and photo.</p>
            )}
            {teamMembers.map((member, index) => (
              <div key={index} className="p-4 border rounded-md relative space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`tm-name-${index}`}>Full Name</Label>
                    <Input
                      id={`tm-name-${index}`}
                      value={member.full_name}
                      onChange={(e) => handleTeamMemberChange(index, 'full_name', e.target.value)}
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`tm-position-${index}`}>Position</Label>
                    <Input
                      id={`tm-position-${index}`}
                      value={member.position || ''}
                      onChange={(e) => handleTeamMemberChange(index, 'position', e.target.value)}
                      placeholder="e.g. Marketing Manager"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Photo (JPG, PNG, GIF; max 2MB)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleTeamMemberPhotoSelect(index, e)}
                  />
                  {member.photoFile && (
                    <p className="text-xs text-muted-foreground">Selected: {member.photoFile.name}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeTeamMember(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTeamMember} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add team member
            </Button>
          </CardContent>
        </Card>

        

        {/* Media Section */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="video">Your Business Video (Optional)</Label>
              <Input
                id="video"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="ex: https://youtu.be/your-video-id"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Gallery</Label>
              <p className="text-sm text-muted-foreground">Upload up to {MAX_GALLERY_IMAGES} images (JPG, PNG, GIF). Images are optimized on upload. Total size after optimization must not exceed {Math.round(TOTAL_GALLERY_SIZE_LIMIT_BYTES / (1024 * 1024))}MB.</p>
              <div 
                className="mt-2 border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer"
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Drop files here or click to upload</p>
                <Button type="button" variant="outline" className="mt-4">Browse Files</Button>
                <Input id="image-upload" type="file" multiple accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleImageSelect} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {images.length} / {MAX_GALLERY_IMAGES} images • {(images.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} / {Math.round(TOTAL_GALLERY_SIZE_LIMIT_BYTES / (1024 * 1024))}MB
              </p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img src={URL.createObjectURL(file)} alt={`preview ${index}`} className="rounded-md object-cover h-24 w-full" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveImage(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Upload Business Logo</Label>
              <p className="text-sm text-muted-foreground">Upload your business logo. Max size 2MB.</p>
              <div 
                className="mt-2 border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                {logo ? (
                  <p>{logo.name}</p>
                ) : (
                  <p className="text-muted-foreground">Choose a file...</p>
                )}
                <Button type="button" variant="outline" className="mt-2">Browse</Button>
                <Input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
              </div>
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
            {(Object.keys(businessHours) as Array<keyof BusinessHours>).map((day) => {
              const hours = businessHours[day];
              return (
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
              );
            })}
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="p-4 border rounded-md relative space-y-4">
                 <div className="flex flex-col space-y-2">
                  <Label htmlFor={`faq-question-${index}`}>Frequently Asked Questions</Label>
                  <Input
                    id={`faq-question-${index}`}
                    value={faq.question}
                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                    placeholder="Frequently Asked Questions"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor={`faq-answer-${index}`}>Answer</Label>
                  <Textarea
                    id={`faq-answer-${index}`}
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                    placeholder="Answer to the question"
                    className="min-h-[80px]"
                  />
                </div>
                {faqs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeFaq(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addFaq} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add another FAQ
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Save Listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Accept terms and conditions
                </label>
                <p className="text-sm text-muted-foreground">
                  You agree to our <a href="/terms" target="_blank" className="underline hover:text-primary">Terms of Service</a> and <a href="/privacy" target="_blank" className="underline hover:text-primary">Privacy Policy</a>.
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <Button 
              onClick={() => handleSubmit('draft')}
              variant="outline" 
              className="w-full"
              disabled={!title || !description || categoriesSelected.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button 
              onClick={() => handleSubmit('published')}
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={!title || !description || categoriesSelected.length === 0 || !termsAccepted}
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
  );
}