import { SectionShell } from '@/components/listings/SectionShell';
import { Button } from '@/components/ui/button';
import { Target, Zap } from 'lucide-react';
import { Listing } from '@/types';

interface MonetizationSectionProps {
  listing: Listing;
}

export const MonetizationSection = ({ listing }: MonetizationSectionProps) => {
  return (
    <SectionShell title="Monetization" Icon={Zap} accent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Promote Listing Card */}
          <div className="border rounded-lg p-6 flex flex-col items-center text-center">
            <div className="bg-orange-100 p-4 rounded-full mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-semibold text-lg">Promote This Listing</h4>
            <p className="text-muted-foreground mt-1 mb-4">Boost visibility with targeted advertising campaigns.</p>
            <Button variant="outline" className="w-full">Create Campaign</Button>
          </div>

          {/* Premium Features Card */}
          <div className="border rounded-lg p-6 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Zap className="h-8 w-8 text-secondary" />
            </div>
            <h4 className="font-semibold text-lg">Premium Features</h4>
            <p className="text-muted-foreground mt-1 mb-4">Upgrade to unlock advanced listing features.</p>
            <Button variant="outline" className="w-full">Upgrade Plan</Button>
          </div>

        </div>
    </SectionShell>
  );
};
