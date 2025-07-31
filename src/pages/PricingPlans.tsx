import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Star, Zap, Crown, Users } from "lucide-react";

export default function PricingPlans() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Basic",
      icon: Users,
      description: "Perfect for small businesses",
      monthlyPrice: 29,
      annualPrice: 290,
      features: [
        "Up to 3 listings",
        "Basic analytics",
        "Email support",
        "Standard listing features",
        "Customer reviews",
        "Basic search visibility"
      ],
      popular: false,
      color: "text-blue-600"
    },
    {
      name: "Premium",
      icon: Star,
      description: "Most popular for growing businesses",
      monthlyPrice: 79,
      annualPrice: 790,
      features: [
        "Up to 15 listings",
        "Advanced analytics",
        "Priority support",
        "Featured listing placement",
        "Advanced booking system",
        "Custom business hours",
        "Multiple photos & videos",
        "Social media integration",
        "Customer messaging inbox"
      ],
      popular: true,
      color: "text-purple-600"
    },
    {
      name: "Enterprise",
      icon: Crown,
      description: "For large businesses and franchises",
      monthlyPrice: 199,
      annualPrice: 1990,
      features: [
        "Unlimited listings",
        "Enterprise analytics",
        "24/7 phone support",
        "Priority featured placement",
        "Advanced booking & events",
        "Custom branding options",
        "API access",
        "White-label solutions",
        "Multi-location management",
        "Advanced reporting",
        "Custom integrations"
      ],
      popular: false,
      color: "text-amber-600"
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const annualCost = plan.annualPrice;
    return monthlyCost - annualCost;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Flexible pricing for businesses of all sizes
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`font-medium ${!isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch 
              checked={isAnnual} 
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`font-medium ${isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2">
                Save up to 20%
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = getPrice(plan);
            const savings = getSavings(plan);
            
            return (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'ring-2 ring-primary scale-105' : ''} transition-all hover:shadow-lg`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-6 w-6 ${plan.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold mb-2">
                      ${price}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    {isAnnual && savings > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        Save ${savings} per year
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.popular ? (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Get Started
                      </>
                    ) : (
                      "Choose Plan"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">All Plans Include</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              "SSL Security",
              "Mobile Responsive",
              "SEO Optimization",
              "Regular Backups"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Need a custom solution? 
          </p>
          <Button variant="outline">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}