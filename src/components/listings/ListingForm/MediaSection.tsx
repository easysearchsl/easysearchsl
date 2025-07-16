import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, Video, X, Plus } from 'lucide-react';
import { useState } from 'react';

interface MediaSectionProps {
  data: any;
  onChange: (data: any) => void;
}

export function MediaSection({ data, onChange }: MediaSectionProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    // In a real app, you would upload files to a storage service
    const newImages = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    
    onChange({
      ...data,
      images: [...data.images, ...newImages]
    });
  };

  const removeImage = (id: string) => {
    onChange({
      ...data,
      images: data.images.filter((img: any) => img.id !== id)
    });
  };

  const addVideoUrl = (url: string) => {
    if (url.trim()) {
      onChange({
        ...data,
        videos: [...data.videos, { id: Date.now(), url: url.trim() }]
      });
    }
  };

  const removeVideo = (id: string) => {
    onChange({
      ...data,
      videos: data.videos.filter((video: any) => video.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Image Gallery
          </CardTitle>
          <CardDescription>
            Upload high-quality images to showcase your business. First image will be used as the cover.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop images here or click to upload</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supported formats: JPG, PNG, WebP (max 5MB each)
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              id="image-upload"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <Button asChild variant="outline">
              <label htmlFor="image-upload" className="cursor-pointer">
                Choose Images
              </label>
            </Button>
          </div>

          {data.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {data.images.map((image: any, index: number) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      Cover
                    </div>
                  )}
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Content
          </CardTitle>
          <CardDescription>
            Add video URLs from YouTube, Vimeo, or other platforms to engage customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Paste video URL (YouTube, Vimeo, etc.)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addVideoUrl((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="video URL"]') as HTMLInputElement;
                  if (input) {
                    addVideoUrl(input.value);
                    input.value = '';
                  }
                }}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {data.videos.length > 0 && (
              <div className="space-y-2">
                {data.videos.map((video: any) => (
                  <div key={video.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{video.url}</span>
                    <button
                      onClick={() => removeVideo(video.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}