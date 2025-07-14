import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star, Edit, Eye, MoreHorizontal } from "lucide-react";
import { Listing, BusinessHours } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Extended interface for display purposes
interface ListingWithStats extends Listing {
  rating?: number;
  reviewCount?: number;
}

interface ListingCardProps {
  listing: ListingWithStats;
  onEdit?: () => void;
  onView?: () => void;
  onToggleStatus?: () => void;
  showActions?: boolean;
}

export function ListingCard({ 
  listing, 
  onEdit, 
  onView, 
  onToggleStatus,
  showActions = true 
}: ListingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatBusinessHours = (businessHours: BusinessHours): string => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayNames[today] as keyof BusinessHours;
    const todayHours = businessHours[todayKey];
    
    if (todayHours.closed) {
      return 'Closed today';
    }
    
    if (todayHours.open && todayHours.close) {
      return `${todayHours.open} - ${todayHours.close}`;
    }
    
    return 'Hours vary';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
              {listing.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {listing.category}
            </p>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleStatus}>
                  {listing.status === 'published' ? 'Archive' : 'Publish'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {listing.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {listing.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {listing.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{listing.tags.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {listing.rating && listing.reviewCount ? (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{listing.rating.toFixed(1)}</span>
              <span>({listing.reviewCount} reviews)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-gray-300" />
              <span>No reviews</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatBusinessHours(listing.business_hours)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <Badge 
            variant="outline" 
            className={getStatusColor(listing.status)}
          >
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </Badge>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onView}
              className="hover:bg-brand-blue/10 hover:text-brand-blue hover:border-brand-blue"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {showActions && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onEdit}
                className="hover:bg-brand-orange/10 hover:text-brand-orange hover:border-brand-orange"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}