import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Search className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold text-foreground mb-2">404</CardTitle>
          <p className="text-xl text-muted-foreground">Page Not Found</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Or explore these popular sections:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/listings')}
              >
                Browse Listings
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/listings')}
              >
                My Listings
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/analytics')}
              >
                Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}