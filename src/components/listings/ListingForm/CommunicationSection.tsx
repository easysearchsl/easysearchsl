import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Globe, Facebook, Instagram, Twitter, Mail, Phone, MessageSquare, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface CommunicationSectionProps {
  data: any;
  onChange: (data: any) => void;
}

export function CommunicationSection({ data, onChange }: CommunicationSectionProps) {
  const [newFormField, setNewFormField] = useState({ label: '', type: 'text', required: false });

  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourbusiness' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourbusiness' },
    { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/yourbusiness' },
  ];

  const addFormField = () => {
    if (newFormField.label.trim()) {
      onChange({
        ...data,
        leadForm: {
          ...data.leadForm,
          fields: [...(data.leadForm.fields || []), { id: Date.now(), ...newFormField }]
        }
      });
      setNewFormField({ label: '', type: 'text', required: false });
    }
  };

  const removeFormField = (id: string) => {
    onChange({
      ...data,
      leadForm: {
        ...data.leadForm,
        fields: (data.leadForm.fields || []).filter((field: any) => field.id !== id)
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website & Online Presence
          </CardTitle>
          <CardDescription>
            Connect your external website and social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              value={data.website}
              onChange={(e) => onChange({ ...data, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            <Label>Social Media Links</Label>
            {socialPlatforms.map(platform => {
              const Icon = platform.icon;
              return (
                <div key={platform.key} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={data.socialLinks?.[platform.key] || ''}
                    onChange={(e) => onChange({
                      ...data,
                      socialLinks: {
                        ...data.socialLinks,
                        [platform.key]: e.target.value
                      }
                    })}
                    placeholder={platform.placeholder}
                    className="flex-1"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Lead Capture Form
          </CardTitle>
          <CardDescription>
            Create a custom form for potential customers to contact you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-lead-form">Enable Lead Form</Label>
              <Switch
                id="enable-lead-form"
                checked={data.leadForm?.enabled || false}
                onCheckedChange={(checked) => onChange({
                  ...data,
                  leadForm: { ...data.leadForm, enabled: checked }
                })}
              />
            </div>

            {data.leadForm?.enabled && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="form-title">Form Title</Label>
                  <Input
                    id="form-title"
                    value={data.leadForm?.title || ''}
                    onChange={(e) => onChange({
                      ...data,
                      leadForm: { ...data.leadForm, title: e.target.value }
                    })}
                    placeholder="Get in touch with us"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="form-description">Description</Label>
                  <Textarea
                    id="form-description"
                    value={data.leadForm?.description || ''}
                    onChange={(e) => onChange({
                      ...data,
                      leadForm: { ...data.leadForm, description: e.target.value }
                    })}
                    placeholder="Tell us about your inquiry..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Form Fields</Label>
                  <div className="space-y-2 mt-2">
                    {(data.leadForm?.fields || []).map((field: any) => (
                      <div key={field.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <span className="flex-1">{field.label}</span>
                        <span className="text-sm text-muted-foreground">({field.type})</span>
                        {field.required && (
                          <span className="text-xs text-primary">Required</span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFormField(field.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="border-2 border-dashed rounded-lg p-3 mt-2">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        placeholder="Field label"
                        value={newFormField.label}
                        onChange={(e) => setNewFormField({ ...newFormField, label: e.target.value })}
                      />
                      <select
                        value={newFormField.type}
                        onChange={(e) => setNewFormField({ ...newFormField, type: e.target.value })}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="textarea">Textarea</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={newFormField.required}
                          onCheckedChange={(checked) => setNewFormField({ ...newFormField, required: checked })}
                        />
                        <Label>Required</Label>
                      </div>
                      <Button onClick={addFormField} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Field
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Direct Contact
          </CardTitle>
          <CardDescription>
            Provide direct contact information for immediate inquiries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contact-email">Contact Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={data.contactEmail || ''}
              onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
              placeholder="hello@yourbusiness.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contact-phone">Phone Number</Label>
            <Input
              id="contact-phone"
              type="tel"
              value={data.contactPhone || ''}
              onChange={(e) => onChange({ ...data, contactPhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}