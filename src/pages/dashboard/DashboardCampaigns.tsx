import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Target,
  Play,
  Pause,
  Settings,
  BarChart3
} from "lucide-react";
import { Campaign } from "@/types";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    organization_id: "org1",
    listing_id: "1",
    title: "Premium Coffee Shop - Featured Listing",
    type: "featured",
    budget: 500,
    daily_budget: 25,
    status: "active",
    start_date: "2024-01-15T00:00:00Z",
    end_date: "2024-02-15T00:00:00Z",
    target_audience: {
      categories: ["Food & Beverage"],
      tags: ["coffee", "downtown", "professionals"],
      demographics: {
        age_range: "25-45",
        interests: ["coffee", "work", "meetings"]
      }
    },
    metrics: {
      impressions: 12500,
      clicks: 340,
      conversions: 28,
      cost_per_click: 0.73,
      click_through_rate: 2.72
    },
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    organization_id: "org1",
    listing_id: "2",
    title: "Tech Repair - Promoted Search Results",
    type: "promoted",
    budget: 300,
    daily_budget: 20,
    status: "active",
    start_date: "2024-01-20T00:00:00Z",
    end_date: "2024-02-20T00:00:00Z",
    target_audience: {
      categories: ["Technology"],
      tags: ["repair", "computers", "phones"],
      demographics: {
        age_range: "18-55",
        interests: ["technology", "repair", "electronics"]
      }
    },
    metrics: {
      impressions: 8200,
      clicks: 195,
      conversions: 15,
      cost_per_click: 1.02,
      click_through_rate: 2.38
    },
    created_at: "2024-01-20T14:00:00Z"
  },
  {
    id: "3",
    organization_id: "org1",
    listing_id: "1",
    title: "Coffee Shop - Winter Special",
    type: "sponsored",
    budget: 150,
    daily_budget: 15,
    status: "paused",
    start_date: "2024-01-10T00:00:00Z",
    end_date: "2024-01-31T00:00:00Z",
    target_audience: {
      categories: ["Food & Beverage"],
      tags: ["coffee", "seasonal", "winter"],
      demographics: {
        age_range: "20-50",
        interests: ["coffee", "seasonal drinks", "cozy atmosphere"]
      }
    },
    metrics: {
      impressions: 5400,
      clicks: 127,
      conversions: 8,
      cost_per_click: 0.98,
      click_through_rate: 2.35
    },
    created_at: "2024-01-10T09:00:00Z"
  }
];

export default function DashboardCampaigns() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const navigate = useNavigate();

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const totalSpent = campaigns.reduce((acc, c) => acc + (c.metrics.clicks * c.metrics.cost_per_click), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.metrics.impressions, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.metrics.clicks, 0);
  const avgCTR = totalClicks > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const handleCreateCampaign = () => {
    navigate("/dashboard/campaigns/new");
  };

  const handleToggleCampaign = (id: string) => {
    console.log("Toggle campaign:", id);
  };

  const handleViewAnalytics = (id: string) => {
    navigate(`/dashboard/campaigns/${id}/analytics`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'featured': return 'bg-purple-100 text-purple-800';
      case 'promoted': return 'bg-blue-100 text-blue-800';
      case 'sponsored': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaign Management</h1>
          <p className="text-muted-foreground mt-1">
            Promote your listings and track advertising performance
          </p>
        </div>
        <Button onClick={handleCreateCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-primary">{activeCampaigns.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Active Campaigns</p>
            <p className="text-xs text-muted-foreground mt-1">
              {campaigns.length} total campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-green-600">${totalSpent.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${totalBudget.toFixed(2)} budget
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-blue-600">{totalImpressions.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total Impressions</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-orange-600">{avgCTR.toFixed(2)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Average CTR</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalClicks} total clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{campaign.title}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge className={getTypeColor(campaign.type)}>
                          {campaign.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Budget: ${campaign.budget} | Daily: ${campaign.daily_budget}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleCampaign(campaign.id)}
                      >
                        {campaign.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAnalytics(campaign.id)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Impressions</span>
                      </div>
                      <p className="text-xl font-bold">{campaign.metrics.impressions.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MousePointer className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Clicks</span>
                      </div>
                      <p className="text-xl font-bold">{campaign.metrics.clicks}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Conversions</span>
                      </div>
                      <p className="text-xl font-bold">{campaign.metrics.conversions}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">CPC</span>
                      </div>
                      <p className="text-xl font-bold">${campaign.metrics.cost_per_click.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Usage</span>
                      <span>{((campaign.metrics.clicks * campaign.metrics.cost_per_click) / campaign.budget * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(campaign.metrics.clicks * campaign.metrics.cost_per_click) / campaign.budget * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      ${(campaign.metrics.clicks * campaign.metrics.cost_per_click).toFixed(2)} of ${campaign.budget} spent
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            {campaigns.filter(c => c.status === 'active').map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paused">
          <div className="space-y-4">
            {campaigns.filter(c => c.status === 'paused').map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {campaigns.filter(c => c.status === 'completed').map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first campaign to promote your listings and reach more customers
            </p>
            <Button onClick={handleCreateCampaign}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}