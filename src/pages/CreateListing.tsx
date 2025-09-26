import { CreateListingForm } from "@/components/forms/CreateListingForm";
import { supabase } from '@/lib/supabase';
import { Listing } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CreateListing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateListing = async (
    newListingData: Omit<Listing, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>,
    imageFiles: File[],
    logoFile?: File | null,
    contactPersonAvatarFile?: File | null,
    teamMemberPhotoFiles?: (File | null)[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated for creating a listing.");

      // Upload up to 5 images to Supabase Storage and collect public URLs
      const bucket = 'listing-images'; // Ensure this bucket exists and is public in Supabase
      const uploadPromises = (imageFiles || []).slice(0, 5).map(async (file, index) => {
        const path = `listings/${newListingData.slug}/${Date.now()}-${index}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
        return publicUrlData.publicUrl;
      });

      const uploadedImageUrls = await Promise.all(uploadPromises);

      // Optionally upload contact person avatar
      let contactPersonAvatarUrl: string | undefined;
      if (contactPersonAvatarFile) {
        const avatarPath = `listings/${newListingData.slug}/contact-person/${Date.now()}-${contactPersonAvatarFile.name}`;
        const { error: avatarUploadError } = await supabase.storage
          .from(bucket)
          .upload(avatarPath, contactPersonAvatarFile, { upsert: false });
        if (avatarUploadError) throw avatarUploadError;
        const { data: avatarPublic } = supabase.storage.from(bucket).getPublicUrl(avatarPath);
        contactPersonAvatarUrl = avatarPublic.publicUrl;
      }

      // Upload team member photos (if provided), preserving order
      let teamMemberPhotoUrls: (string | undefined)[] = [];
      if (teamMemberPhotoFiles && teamMemberPhotoFiles.length > 0) {
        teamMemberPhotoUrls = await Promise.all(
          teamMemberPhotoFiles.map(async (file, index) => {
            if (!file) return undefined;
            const tmPath = `listings/${newListingData.slug}/team/${Date.now()}-${index}-${file.name}`;
            const { error: tmUploadError } = await supabase.storage
              .from(bucket)
              .upload(tmPath, file, { upsert: false });
            if (tmUploadError) throw tmUploadError;
            const { data: tmPublic } = supabase.storage.from(bucket).getPublicUrl(tmPath);
            return tmPublic.publicUrl;
          })
        );
      }

      const listingToInsert = {
        ...newListingData,
        images: uploadedImageUrls,
        contact_person: (newListingData.contact_person || contactPersonAvatarUrl)
          ? {
              ...(newListingData.contact_person || {}),
              avatar_url: contactPersonAvatarUrl || newListingData.contact_person?.avatar_url,
            }
          : undefined,
        team_members: (newListingData.team_members && newListingData.team_members.length > 0)
          ? newListingData.team_members.map((m, idx) => ({
              ...m,
              photo_url: teamMemberPhotoUrls[idx] || m.photo_url,
            }))
          : undefined,
        // TODO: Replace placeholder with actual organization ID from user profile
        organization_id: 'org1', 
        created_by: user.id,
      };

      const { error } = await supabase
        .from('listings')
        .insert([listingToInsert]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Listing \"${newListingData.title}\" has been created.`,
      });

      navigate('/dashboard/listings'); // Navigate to the listings page after creation

    } catch (error: any) {
      toast({
        title: "Error creating listing",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
            <CreateListingForm 
                onSubmit={handleCreateListing} 
                onCancel={() => navigate('/dashboard/listings')}
            />
        </div>
    </div>
  );
};
