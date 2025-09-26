import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Percent, Tag, Calendar, Search, Plus, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  code: string;
  business: string;
  category: string;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  terms: string;
}

export default function Coupons() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const mockCoupons: Coupon[] = [
    {
      id: "1",
      title: "20% Off First Visit",
      description: "Get 20% off your first spa treatment at Serenity Spa",
      discountType: "percentage",
      discountValue: 20,
      code: "WELCOME20",
      business: "Serenity Spa & Wellness",
      category: "beauty",
      expiryDate: "2024-12-31",
      usageLimit: 100,
      usedCount: 23,
      isActive: true,
      terms: "Valid for new customers only. Cannot be combined with other offers."
    },
    {
      id: "2",
      title: "$10 Off Pizza Orders",
      description: "Save $10 on orders over $30 at Mario's Pizza Palace",
      discountType: "fixed",
      discountValue: 10,
      code: "PIZZA10",
      business: "Mario's Pizza Palace",
      category: "restaurant",
      expiryDate: "2024-09-15",
      usageLimit: 200,
      usedCount: 145,
      isActive: true,
      terms: "Minimum order $30. Valid for dine-in and takeout only."
    },
    {
      id: "3",
      title: "Buy 2 Get 1 Free",
      description: "Buy 2 coffees and get the 3rd one free at Bean There Cafe",
      discountType: "percentage",
      discountValue: 33,
      code: "COFFEE3FOR2",
      business: "Bean There Cafe",
      category: "restaurant",
      expiryDate: "2024-08-31",
      usedCount: 67,
      isActive: true,
      terms: "Valid on regular-sized drinks only. Lowest priced item will be free."
    }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "restaurant", label: "Restaurants" },
    { value: "beauty", label: "Beauty & Spa" },
    { value: "retail", label: "Retail" },
    { value: "services", label: "Services" },
    { value: "entertainment", label: "Entertainment" }
  ];

  const filteredCoupons = mockCoupons.filter(coupon => {
    const matchesSearch = coupon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.business.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || coupon.category === selectedCategory;
    return matchesSearch && matchesCategory && coupon.isActive;
  });

  const formatDiscount = (coupon: Coupon) => {
    return coupon.discountType === 'percentage' 
      ? `${coupon.discountValue}% OFF`
      : `$${coupon.discountValue} OFF`;
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied!",
      description: `Coupon code "${code}" has been copied to clipboard.`,
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return { label: "Expired", color: "bg-red-100 text-red-800" };
    if (days <= 7) return { label: `${days} days left`, color: "bg-orange-100 text-orange-800" };
    return { label: `${days} days left`, color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Coupons & Deals</h1>
            <p className="text-xl text-muted-foreground">
              Discover amazing discounts from local businesses
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="title">Coupon Title</Label>
                  <Input id="title" placeholder="e.g., 20% Off First Visit" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the offer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discountValue">Discount Value</Label>
                    <Input id="discountValue" type="number" placeholder="20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input id="code" placeholder="WELCOME20" />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input id="expiryDate" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                  <Input id="usageLimit" type="number" placeholder="100" />
                </div>
                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea id="terms" placeholder="Enter terms and conditions" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Create Coupon
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons or businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            const expiryStatus = getExpiryStatus(coupon.expiryDate);
            
            return (
              <Card key={coupon.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                        <Percent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          {formatDiscount(coupon)}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={expiryStatus.color}>
                      {expiryStatus.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{coupon.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {coupon.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">{coupon.business}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span className="font-mono font-semibold">{coupon.code}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyCode(coupon.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {formatExpiryDate(coupon.expiryDate)}
                      </div>
                      {coupon.usageLimit && (
                        <div>
                          Used: {coupon.usedCount} / {coupon.usageLimit}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {coupon.terms}
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    Redeem Coupon
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <Percent className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No coupons found</h3>
            <p className="text-muted-foreground mb-4">
              No active coupons match your current search and filters.
            </p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}