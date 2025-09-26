import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ThumbsUp, Flag, Reply } from "lucide-react";
import { Review, User } from "@/types";
import { formatDistanceToNow } from "date-fns";

// Extended interface for display purposes
interface ReviewWithUser extends Review {
  user: User;
  listing?: {
    title: string;
    slug: string;
  };
  response?: {
    message: string;
    createdAt: string;
  };
}

interface ReviewCardProps {
  review: ReviewWithUser;
  onReply?: () => void;
  onReport?: () => void;
  onHelpful?: () => void;
  showActions?: boolean;
}

export function ReviewCard({ 
  review, 
  onReply, 
  onReport, 
  onHelpful,
  showActions = true 
}: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="border-l-4 border-l-secondary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user.avatar_url} alt={review.user.full_name} />
              <AvatarFallback>
                {review.user.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-foreground">{review.user.full_name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          
          {review.verified && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">
          {review.content}
        </p>

        {review.pros && review.pros.length > 0 && (
          <div>
            <h5 className="font-medium text-green-700 mb-2">Pros</h5>
            <div className="flex flex-wrap gap-2">
              {review.pros.map((pro, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {pro}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {review.cons && review.cons.length > 0 && (
          <div>
            <h5 className="font-medium text-red-700 mb-2">Cons</h5>
            <div className="flex flex-wrap gap-2">
              {review.cons.map((con, index) => (
                <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {con}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {review.response && (
          <div className="bg-muted/50 rounded-lg p-4 mt-4 border-l-4 border-l-primary/50">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Business Response
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.response.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-foreground">
              {review.response.message}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onHelpful}
              className="hover:bg-secondary/10 hover:text-secondary"
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Helpful ({review.helpful_count})
            </Button>
            
            {onReply && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onReply}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onReport}
              className="hover:bg-red-50 hover:text-red-600 ml-auto"
            >
              <Flag className="h-4 w-4 mr-1" />
              Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}