import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Star, 
  Users, 
  MessageSquare,
  Calendar,
  Download
} from "lucide-react";

export function Analytics() {
  const timeRanges = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "1y", label: "Last year" }
  ];

  const overviewStats = [
    {
      title: "Total Views",
      value: "12,847",
      change: "+12.5%",
      trend: "up",
      icon: Eye,
      color: "text-brand-blue"
    },
    {
      title: "Total Reviews",
      value: "324",
      change: "+8.2%",
      trend: "up", 
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "New Visitors",
      value: "2,891",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Inquiries",
      value: "156",
      change: "-2.1%",
      trend: "down",
      icon: MessageSquare,
      color: "text-brand-orange"
    }
  ];

  const topListings = [
    {
      name: "Premium Coffee Shop",
      views: 4567,
      reviews: 89,
      rating: 4.8,
      inquiries: 45
    },
    {
      name: "Tech Repair Services", 
      views: 3421,
      reviews: 67,
      rating: 4.5,
      inquiries: 32
    },
    {
      name: "Fitness Studio",
      views: 2890,
      reviews: 43,
      rating: 4.7,
      inquiries: 28
    },
    {
      name: "Local Bakery",
      views: 2156,
      reviews: 35,
      rating: 4.6,
      inquiries: 19
    }
  ];

  const recentActivity = [
    {
      type: "review",
      title: "New 5-star review for Premium Coffee Shop",
      time: "2 hours ago",
      user: "Sarah M."
    },
    {
      type: "view",
      title: "High traffic spike on Tech Repair Services",
      time: "4 hours ago",
      user: "System"
    },
    {
      type: "inquiry",
      title: "New inquiry for Fitness Studio",
      time: "6 hours ago",
      user: "Mike J."
    },
    {
      type: "review",
      title: "New review for Local Bakery",
      time: "8 hours ago",
      user: "Emma L."
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'view':
        return <Eye className="h-4 w-4 text-brand-blue" />;
      case 'inquiry':
        return <MessageSquare className="h-4 w-4 text-brand-orange" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your business performance and visitor insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-muted-foreground">
                  from last period
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Listings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-orange" />
              Top Performing Listings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topListings.map((listing, index) => (
              <div key={listing.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{listing.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {listing.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {listing.rating} ({listing.reviews})
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {listing.inquiries}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-blue" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                    {activity.user !== "System" && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          by {activity.user}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <Button variant="ghost" className="w-full text-sm">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-800">Strong Performance</h4>
              </div>
              <p className="text-sm text-green-700">
                Your Premium Coffee Shop listing is performing 25% above average with high engagement rates.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">Optimization Tip</h4>
              </div>
              <p className="text-sm text-yellow-700">
                Add more photos to your Tech Repair Services listing to increase view duration by 40%.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-800">Review Opportunity</h4>
              </div>
              <p className="text-sm text-blue-700">
                Your Fitness Studio has high views but few reviews. Consider asking satisfied customers to leave feedback.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}