import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainNavigation } from "@/components/layout/MainNavigation";
import { Building2, Users, Star, TrendingUp, Heart, Shield, Zap } from "lucide-react";

const About = () => {
  const stats = [
    { icon: Building2, label: "Active Businesses", value: "2,500+" },
    { icon: Users, label: "Happy Customers", value: "50,000+" },
    { icon: Star, label: "Reviews Posted", value: "15,000+" },
    { icon: TrendingUp, label: "Cities Covered", value: "25+" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Community First",
      description: "We believe in strengthening local communities by connecting businesses with customers who value them."
    },
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "Every review is verified, every business is checked, ensuring a trustworthy platform for all."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge features to serve our users better."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "Former small business owner with 15 years of experience in local commerce."
    },
    {
      name: "Mike Chen",
      role: "CTO",
      description: "Tech veteran who previously built platforms for Fortune 500 companies."
    },
    {
      name: "Lisa Rodriguez",
      role: "Head of Community",
      description: "Community advocate passionate about supporting local businesses."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              About BusinessHub
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              We're on a mission to empower local businesses and help communities thrive by creating 
              meaningful connections between businesses and customers.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-6">
                BusinessHub was born from a simple observation: local businesses are the heart of our communities, 
                yet they often struggle to reach the customers who would value them most. In 2020, during challenging 
                times for small businesses, our founders saw an opportunity to bridge this gap.
              </p>
              <p className="mb-6">
                What started as a small directory for a single neighborhood has grown into a comprehensive platform 
                serving thousands of businesses across multiple cities. But our mission remains the same: to help 
                local businesses thrive by connecting them with their ideal customers.
              </p>
              <p>
                Today, BusinessHub is more than just a directory. We're a community where businesses can showcase 
                their unique value, customers can discover hidden gems, and meaningful relationships are built 
                every day.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <Badge variant="secondary">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Whether you're a business owner looking to grow or a customer seeking great local services, 
            BusinessHub is here to help you succeed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;