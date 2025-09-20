import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MainNavigation } from "@/components/layout/MainNavigation";
import { Mail, Phone, MapPin, Clock, MessageSquare, HelpCircle, Users } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch via email",
      details: "hello@businesshub.com",
      subdetails: "We typically respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team",
      details: "+1 (555) 123-4567",
      subdetails: "Monday - Friday, 9AM - 6PM EST"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Our office location",
      details: "123 Business Street, Suite 100",
      subdetails: "San Francisco, CA 94105"
    }
  ];

  const supportTypes = [
    {
      icon: MessageSquare,
      title: "General Inquiries",
      description: "Questions about our platform or services"
    },
    {
      icon: HelpCircle,
      title: "Technical Support",
      description: "Need help with your account or listings?"
    },
    {
      icon: Users,
      title: "Partnership Opportunities",
      description: "Interested in collaborating with us?"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted");
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((info, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <info.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>{info.title}</CardTitle>
                <p className="text-muted-foreground">{info.description}</p>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-foreground mb-2">{info.details}</p>
                <p className="text-sm text-muted-foreground">{info.subdetails}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form and Support Types */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input id="company" placeholder="Your Company" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us more about your inquiry..." 
                    className="min-h-[120px]"
                    required 
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Support Types and Additional Info */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>What can we help you with?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {supportTypes.map((type, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <type.icon className="h-6 w-6 text-primary mt-1" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{type.title}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Before reaching out, you might find your answer in our FAQ section.
                </p>
                <Button variant="outline" className="w-full">
                  View FAQ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Find Us</h2>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Interactive map would be embedded here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      123 Business Street, Suite 100<br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;