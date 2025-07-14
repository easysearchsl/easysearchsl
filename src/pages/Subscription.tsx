import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  CreditCard, 
  Calendar, 
  Download,
  Settings,
  Zap,
  Users,
  BarChart3,
  Star,
  FileText
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  popular?: boolean;
  features: PlanFeature[];
  color: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    billingCycle: 'monthly',
    color: 'border-gray-200',
    features: [
      { name: 'Basic listings', included: true, limit: 'Up to 2' },
      { name: 'Standard support', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Featured listings', included: false },
      { name: 'AI listing assistant', included: false },
      { name: 'Team members', included: false },
      { name: 'Priority support', included: false },
      { name: 'Custom branding', included: false }
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29,
    billingCycle: 'monthly',
    popular: true,
    color: 'border-brand-blue',
    features: [
      { name: 'Professional listings', included: true, limit: 'Up to 10' },
      { name: 'Priority support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Featured listings', included: true, limit: '2 per month' },
      { name: 'AI listing assistant', included: true, limit: '50 credits/month' },
      { name: 'Team members', included: true, limit: 'Up to 3' },
      { name: 'Custom branding', included: false },
      { name: 'API access', included: false }
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    billingCycle: 'monthly',
    color: 'border-brand-orange',
    features: [
      { name: 'Unlimited listings', included: true },
      { name: 'Premium support', included: true },
      { name: 'Full analytics suite', included: true },
      { name: 'Unlimited featured listings', included: true },
      { name: 'AI listing assistant', included: true, limit: 'Unlimited' },
      { name: 'Team members', included: true, limit: 'Unlimited' },
      { name: 'Custom branding', included: true },
      { name: 'API access', included: true }
    ]
  }
];

export function Subscription() {
  const [currentPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const currentPlanData = plans.find(p => p.id === currentPlan);

  const invoices = [
    {
      id: 'inv_001',
      date: '2024-01-01',
      amount: 29,
      status: 'paid',
      description: 'Professional Plan - January 2024'
    },
    {
      id: 'inv_002', 
      date: '2023-12-01',
      amount: 29,
      status: 'paid',
      description: 'Professional Plan - December 2023'
    },
    {
      id: 'inv_003',
      date: '2023-11-01', 
      amount: 29,
      status: 'paid',
      description: 'Professional Plan - November 2023'
    }
  ];

  const usage = {
    listings: { current: 7, limit: 10 },
    featuredSlots: { current: 1, limit: 2 },
    aiCredits: { current: 23, limit: 50 },
    teamMembers: { current: 2, limit: 3 }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription plan and billing information
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Billing Settings
        </Button>
      </div>

      {/* Current Plan Overview */}
      <Card className="border-l-4 border-l-brand-blue">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-brand-blue" />
              <div>
                <CardTitle className="text-xl">
                  {currentPlanData?.name} Plan
                </CardTitle>
                <p className="text-muted-foreground">
                  ${currentPlanData?.price}/month • Billed monthly
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next billing date</span>
            <span className="font-medium">February 1, 2024</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment method</span>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">•••• 4242</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
            <Button variant="outline" size="sm">
              <CreditCard className="h-4 w-4 mr-1" />
              Update Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
          <p className="text-muted-foreground">Track your current plan usage</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Listings
                </span>
                <span className="text-sm text-muted-foreground">
                  {usage.listings.current}/{usage.listings.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.listings.current, usage.listings.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.listings.current, usage.listings.limit)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Featured Slots
                </span>
                <span className="text-sm text-muted-foreground">
                  {usage.featuredSlots.current}/{usage.featuredSlots.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.featuredSlots.current, usage.featuredSlots.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.featuredSlots.current, usage.featuredSlots.limit)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  AI Credits
                </span>
                <span className="text-sm text-muted-foreground">
                  {usage.aiCredits.current}/{usage.aiCredits.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.aiCredits.current, usage.aiCredits.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.aiCredits.current, usage.aiCredits.limit)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Team Members
                </span>
                <span className="text-sm text-muted-foreground">
                  {usage.teamMembers.current}/{usage.teamMembers.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.teamMembers.current, usage.teamMembers.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.teamMembers.current, usage.teamMembers.limit)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <p className="text-muted-foreground">Upgrade or downgrade your subscription</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-brand-blue' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-brand-blue text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature.name} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {feature.name}
                          {feature.limit && (
                            <span className="text-muted-foreground"> ({feature.limit})</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full ${
                      currentPlan === plan.id 
                        ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                        : plan.popular 
                          ? 'bg-brand-blue hover:bg-brand-blue/90 text-white'
                          : ''
                    }`}
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Billing History</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">${invoice.amount}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Paid
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
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