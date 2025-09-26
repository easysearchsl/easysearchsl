
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Zap, Target } from 'lucide-react';

interface MonetizationSectionProps {
  listing: any;
}

export function MonetizationSection({ listing }: MonetizationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          MONETIZATION
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="h-12 w-12 text-primary" />
            </div>
            <h4 className="font-semibold mb-2">Promote This Listing</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Boost visibility with targeted advertising campaigns
            </p>
            <Button variant="outline" className="w-full">
              Create Campaign
            </Button>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-12 w-12 text-secondary" />
            </div>
            <h4 className="font-semibold mb-2">Premium Features</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to unlock advanced listing features
            </p>
            <Button variant="outline" className="w-full">
              Upgrade Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
