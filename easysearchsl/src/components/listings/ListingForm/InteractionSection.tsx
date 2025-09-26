import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Calendar, MessageSquare, Settings, Clock, Users } from 'lucide-react';

interface InteractionSectionProps {
  data: any;
  onChange: (data: any) => void;
}

export function InteractionSection({ data, onChange }: InteractionSectionProps) {
  const bookingDurations = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: 'custom', label: 'Custom duration' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Reviews & Ratings
          </CardTitle>
          <CardDescription>
            Configure how customers can leave reviews and ratings for your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-reviews">Enable Reviews</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to leave reviews and ratings
              </p>
            </div>
            <Switch
              id="enable-reviews"
              checked={data.reviewsEnabled}
              onCheckedChange={(checked) => onChange({ ...data, reviewsEnabled: checked })}
            />
          </div>

          {data.reviewsEnabled && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="review-moderation">Review Moderation</Label>
                <Switch
                  id="review-moderation"
                  checked={data.reviewModeration || false}
                  onCheckedChange={(checked) => onChange({ ...data, reviewModeration: checked })}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {data.reviewModeration 
                  ? 'Reviews will be reviewed before being published'
                  : 'Reviews will be published immediately'
                }
              </p>

              <div className="flex items-center justify-between">
                <Label htmlFor="ai-review-summary">AI Review Summary</Label>
                <Switch
                  id="ai-review-summary"
                  checked={data.aiReviewSummary || false}
                  onCheckedChange={(checked) => onChange({ ...data, aiReviewSummary: checked })}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Generate AI-powered summaries of customer reviews
              </p>

              <div>
                <Label htmlFor="review-response-template">Auto-response Template</Label>
                <Textarea
                  id="review-response-template"
                  value={data.reviewResponseTemplate || ''}
                  onChange={(e) => onChange({ ...data, reviewResponseTemplate: e.target.value })}
                  placeholder="Thank you for your review! We appreciate your feedback and look forward to serving you again."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Optional template for responding to reviews
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking System
          </CardTitle>
          <CardDescription>
            Allow customers to book appointments or services directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-booking">Enable Booking</Label>
              <p className="text-sm text-muted-foreground">
                Let customers book appointments online
              </p>
            </div>
            <Switch
              id="enable-booking"
              checked={data.bookingEnabled}
              onCheckedChange={(checked) => onChange({ ...data, bookingEnabled: checked })}
            />
          </div>

          {data.bookingEnabled && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="booking-duration">Default Duration</Label>
                  <Select 
                    value={data.bookingDuration || '60'} 
                    onValueChange={(value) => onChange({ ...data, bookingDuration: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bookingDurations.map(duration => (
                        <SelectItem key={duration.value} value={duration.value}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="booking-buffer">Buffer Time</Label>
                  <Select 
                    value={data.bookingBuffer || '15'} 
                    onValueChange={(value) => onChange({ ...data, bookingBuffer: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="booking-advance">Advance Booking</Label>
                <Select 
                  value={data.bookingAdvance || '7'} 
                  onValueChange={(value) => onChange({ ...data, bookingAdvance: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="14">2 weeks</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  How far in advance customers can book
                </p>
              </div>

              <div>
                <Label htmlFor="booking-instructions">Booking Instructions</Label>
                <Textarea
                  id="booking-instructions"
                  value={data.bookingInstructions || ''}
                  onChange={(e) => onChange({ ...data, bookingInstructions: e.target.value })}
                  placeholder="Please arrive 10 minutes early. Bring a valid ID and any relevant documents."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="booking-confirmation">Confirmation Email</Label>
                <Switch
                  id="booking-confirmation"
                  checked={data.bookingConfirmation !== false}
                  onCheckedChange={(checked) => onChange({ ...data, bookingConfirmation: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="booking-reminders">Reminder Notifications</Label>
                <Switch
                  id="booking-reminders"
                  checked={data.bookingReminders || false}
                  onCheckedChange={(checked) => onChange({ ...data, bookingReminders: checked })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Engagement
          </CardTitle>
          <CardDescription>
            Additional features to improve customer interaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-chat">Live Chat Widget</Label>
              <p className="text-sm text-muted-foreground">
                Add a chat widget to your listing page
              </p>
            </div>
            <Switch
              id="enable-chat"
              checked={data.chatEnabled || false}
              onCheckedChange={(checked) => onChange({ ...data, chatEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-newsletter">Newsletter Signup</Label>
              <p className="text-sm text-muted-foreground">
                Collect email addresses for marketing
              </p>
            </div>
            <Switch
              id="enable-newsletter"
              checked={data.newsletterEnabled || false}
              onCheckedChange={(checked) => onChange({ ...data, newsletterEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-sharing">Social Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to share your listing
              </p>
            </div>
            <Switch
              id="enable-sharing"
              checked={data.sharingEnabled !== false}
              onCheckedChange={(checked) => onChange({ ...data, sharingEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}