import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Listing } from "@/types";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, PenSquare, BarChart3, Search, Filter, Plus, Bookmark, Heart } from "lucide-react";
import { CreateListingForm } from "@/components/forms/CreateListingForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTenant } from "@/contexts/TenantContext";
import { useSavedCount } from "@/hooks/useSavedCount";
import { useLikesCount } from "@/hooks/useLikesCount";
import { categoryTree, type CategoryNode } from "@/data/categories";
import { provinces } from "@/data/locations";

export default function ManageListings() {
  const navigate = useNavigate();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft" | "archived">("all");
  const [category, setCategory] = useState<string>("all");
  const [district, setDistrict] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    | "created_at"
    | "views"
    | "saves"
    | "likes"
    | "messages"
    | "status"
  >("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [savesCounts, setSavesCounts] = useState<Record<string, number>>({});
  const [likesCounts, setLikesCounts] = useState<Record<string, number>>({});
  const [messageCounts, setMessageCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { currentOrgId } = useTenant();

  // Edit dialog state
  const [editItem, setEditItem] = useState<Listing | null>(null);
  // Legacy minimal edit state kept for reference but no longer used

  // Derived options
  const categoryOptions = useMemo(() => {
    const out: { label: string; value: string }[] = [];
    const walk = (nodes: CategoryNode[]) =>
      nodes.forEach((n) => {
        out.push({ label: n.label, value: n.value });
        if (n.children) walk(n.children);
      });
    walk(categoryTree);
    return out;
  }, []);

  const districtOptions = useMemo(() => {
    return provinces.flatMap((p) => p.districts).map((d) => ({ label: d, value: d }));
  }, []);

  // Base filtering before sorting
  const filteredBase = useMemo(() => {
    let arr = allListings;
    // Tenant scope first
    if (currentOrgId) {
      arr = arr.filter((l) => l.organization_id === currentOrgId);
    }
    // Status filter
    if (status !== "all") arr = arr.filter((l) => l.status === status);
    // Category filter
    if (category !== "all") arr = arr.filter((l) => (l.category || "") === category);
    // District filter
    if (district !== "all") {
      arr = arr.filter((l) => (l.location?.district || (l as any).district || "") === district);
    }
    // Date range filter (created_at)
    if (dateFrom) {
      const fromTs = new Date(dateFrom).getTime();
      arr = arr.filter((l) => {
        const ts = new Date(l.created_at).getTime();
        return !isNaN(ts) && ts >= fromTs;
      });
    }
    if (dateTo) {
      const toTs = new Date(dateTo).getTime();
      arr = arr.filter((l) => {
        const ts = new Date(l.created_at).getTime();
        return !isNaN(ts) && ts <= toTs;
      });
    }
    // Text search
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (l) =>
          (l.title || "").toLowerCase().includes(q) ||
          (l.description || "").toLowerCase().includes(q) ||
          (l.category || "").toLowerCase().includes(q) ||
          (l.tags || []).some((t) => (t || "").toLowerCase().includes(q)) ||
          ((l.location?.district || (l as any).district || "").toLowerCase().includes(q))
      );
    }
    return arr;
  }, [allListings, currentOrgId, status, category, district, dateFrom, dateTo, search]);

  // Fetch counts as needed for sorting modes that require them
  useEffect(() => {
    const ids = filteredBase.map((l) => String(l.id));
    if (!ids.length) return;
    const run = async () => {
      try {
        if (sortBy === "saves") {
          const map: Record<string, number> = {};
          await Promise.all(
            ids.map(async (id) => {
              const { count } = await supabase
                .from("saved_listings")
                .select("id", { count: "exact", head: true })
                .eq("listing_id", id);
              map[id] = typeof count === "number" ? count : 0;
            })
          );
          setSavesCounts(map);
        } else if (sortBy === "likes") {
          const map: Record<string, number> = {};
          await Promise.all(
            ids.map(async (id) => {
              const { count } = await supabase
                .from("listing_likes")
                .select("id", { count: "exact", head: true })
                .eq("listing_id", id);
              map[id] = typeof count === "number" ? count : 0;
            })
          );
          setLikesCounts(map);
        } else if (sortBy === "messages") {
          const map: Record<string, number> = {};
          await Promise.all(
            ids.map(async (id) => {
              const { count } = await supabase
                .from("message_threads")
                .select("id", { count: "exact", head: true })
                .eq("listing_id", id);
              map[id] = typeof count === "number" ? count : 0;
            })
          );
          setMessageCounts(map);
        }
      } catch {
        // ignore failures; leave maps as-is
      }
    };
    run();
  }, [sortBy, filteredBase]);

  // Final sorted array
  const filtered = useMemo(() => {
    const arr = [...filteredBase];
    const dir = sortDir === "asc" ? 1 : -1;
    const statusOrder: Record<string, number> = { published: 0, draft: 1, archived: 2 };
    const getVal = (l: Listing) => {
      switch (sortBy) {
        case "created_at":
          return new Date(l.created_at).getTime() || 0;
        case "views":
          return (l.view_count as any) ?? 0;
        case "saves":
          return savesCounts[String(l.id)] ?? 0;
        case "likes":
          return likesCounts[String(l.id)] ?? 0;
        case "messages":
          return messageCounts[String(l.id)] ?? 0;
        case "status":
          return statusOrder[(l.status as any) || "archived"] ?? 99;
        default:
          return 0;
      }
    };
    arr.sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filteredBase, sortBy, sortDir, savesCounts, likesCounts, messageCounts]);

  const onView = (l: Listing) => navigate(`/listings/${l.slug}`);
  const onEdit = (l: Listing) => {
    setEditItem(l);
  };
  const onMonitor = (l: Listing) => navigate(`/analytics?listingId=${encodeURIComponent(l.id)}`);

  // Live-update view_count if an open ListingView increments it
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ id: string; view_count: number }>;
        const id = String(ce?.detail?.id);
        const vc = ce?.detail?.view_count;
        if (!id || typeof vc !== 'number') return;
        setAllListings((prev) => prev.map((l) => (String(l.id) === id ? { ...l, view_count: vc } : l)));
      } catch {
        // ignore
      }
    };
    window.addEventListener('listing-view-count-updated', handler as EventListener);
    return () => window.removeEventListener('listing-view-count-updated', handler as EventListener);
  }, []);

  // Load listings for current organization (if selected), otherwise load current user's listings
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const sUser = userData?.user;
        let q = supabase.from('listings').select('*');
        if (currentOrgId) q = q.eq('organization_id', currentOrgId);
        else if (sUser) q = q.eq('created_by', sUser.id);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (error) throw error;
        if (mounted) setAllListings((data || []) as any as Listing[]);
      } catch {
        if (mounted) setAllListings([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, [currentOrgId]);

  // Use CreateListingForm to update an existing listing inline
  const handleUpdateListing = async (
    updatedData: Omit<Listing, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>,
    imageFiles: File[],
    logoFile?: File | null,
    contactPersonAvatarFile?: File | null,
    teamMemberPhotoFiles?: (File | null)[],
    retainedMedia?: {
      existingImageUrls?: string[];
      existingLogoUrl?: string;
      existingContactAvatarUrl?: string;
      existingTeamMemberPhotoUrls?: (string | undefined)[];
    }
  ) => {
    if (!editItem) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated for updating a listing.");

      const bucket = 'listing-images';

      // Upload new gallery images
      const uploadPromises = (imageFiles || []).slice(0, 5).map(async (file, index) => {
        const path = `listings/${updatedData.slug}/${Date.now()}-${index}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
        return publicUrlData.publicUrl;
      });
      const uploadedImageUrls = await Promise.all(uploadPromises);

      // Contact person avatar
      let contactPersonAvatarUrl: string | undefined = retainedMedia?.existingContactAvatarUrl;
      if (contactPersonAvatarFile) {
        const avatarPath = `listings/${updatedData.slug}/contact-person/${Date.now()}-${contactPersonAvatarFile.name}`;
        const { error: avatarUploadError } = await supabase.storage
          .from(bucket)
          .upload(avatarPath, contactPersonAvatarFile, { upsert: false });
        if (avatarUploadError) throw avatarUploadError;
        const { data: avatarPublic } = supabase.storage.from(bucket).getPublicUrl(avatarPath);
        contactPersonAvatarUrl = avatarPublic.publicUrl;
      }

      // Team member photos
      let uploadedTeamMemberPhotoUrls: (string | undefined)[] = [];
      if (teamMemberPhotoFiles && teamMemberPhotoFiles.length > 0) {
        uploadedTeamMemberPhotoUrls = await Promise.all(
          teamMemberPhotoFiles.map(async (file, index) => {
            if (!file) return undefined;
            const tmPath = `listings/${updatedData.slug}/team/${Date.now()}-${index}-${file.name}`;
            const { error: tmUploadError } = await supabase.storage
              .from(bucket)
              .upload(tmPath, file, { upsert: false });
            if (tmUploadError) throw tmUploadError;
            const { data: tmPublic } = supabase.storage.from(bucket).getPublicUrl(tmPath);
            return tmPublic.publicUrl;
          })
        );
      }

      // Business logo (optional)
      let finalLogoUrl: string | undefined = retainedMedia?.existingLogoUrl;
      if (logoFile) {
        const logoPath = `listings/${updatedData.slug}/logo/${Date.now()}-${logoFile.name}`;
        const { error: logoUploadError } = await supabase.storage
          .from(bucket)
          .upload(logoPath, logoFile, { upsert: false });
        if (logoUploadError) throw logoUploadError;
        const { data: logoPublic } = supabase.storage.from(bucket).getPublicUrl(logoPath);
        finalLogoUrl = logoPublic.publicUrl;
      }

      // Compose final media arrays
      const finalImages = [
        ...((retainedMedia?.existingImageUrls || []) as string[]),
        ...uploadedImageUrls,
      ].slice(0, 5);

      const finalContactPerson = (updatedData.contact_person || contactPersonAvatarUrl)
        ? {
            ...(updatedData.contact_person || {}),
            avatar_url: contactPersonAvatarUrl,
          }
        : undefined;

      const finalTeamMembers = (updatedData.team_members && updatedData.team_members.length > 0)
        ? updatedData.team_members.map((m, idx) => ({
            ...m,
            photo_url: uploadedTeamMemberPhotoUrls[idx] || retainedMedia?.existingTeamMemberPhotoUrls?.[idx],
          }))
        : undefined;

      const listingToUpdate = {
        ...updatedData,
        images: finalImages,
        logo_url: finalLogoUrl,
        contact_person: finalContactPerson,
        team_members: finalTeamMembers,
        updated_at: new Date().toISOString(),
      } as Partial<Listing>;

      const { error } = await supabase
        .from('listings')
        .update(listingToUpdate)
        .eq('id', editItem.id);
      if (error) throw error;

      // Update local state and UI
      const merged: Listing = {
        ...editItem,
        ...(listingToUpdate as Listing),
      } as Listing;
      setAllListings((prev) => prev.map((x) => (x.id === merged.id ? merged : x)));
      setEditItem(null);
      toast({ title: 'Saved', description: `Listing "${updatedData.title}" has been updated.` });
    } catch (error: any) {
      toast({ title: 'Error updating listing', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Listings</h1>
          <p className="text-muted-foreground mt-1">Manage, monitor, and edit the listings you created.</p>
        </div>
        <div>
          <Button onClick={() => navigate('/listings/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Listing
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {/* Row 1: Search, Category, District */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-72 max-w-full">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                  placeholder="Search listings..."
                />
              </div>
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="all">All Districts</option>
                {districtOptions.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Row 2: Status, Date Range, Sort By */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">From</span>
                <Input type="date" className="h-9" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">To</span>
                <Input type="date" className="h-9" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="created_at">Date Created</option>
                <option value="views">Views</option>
                <option value="saves">Saves</option>
                <option value="likes">Likes</option>
                <option value="messages">Messages</option>
                <option value="status">Status</option>
              </select>
              <Button variant="outline" size="sm" onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}>
                Sort: {sortDir === "asc" ? "Asc" : "Desc"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listings ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Views</TableHead>
                <TableHead className="hidden lg:table-cell">Saved</TableHead>
                <TableHead className="hidden lg:table-cell">Likes</TableHead>
                <TableHead className="hidden lg:table-cell">Rating</TableHead>
                <TableHead className="hidden xl:table-cell">Created</TableHead>
                <TableHead className="hidden xl:table-cell">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="flex items-center gap-3 max-w-[420px]">
                      <Avatar className="h-9 w-9 ring-1 ring-border shadow-sm">
                        <AvatarImage src={l.logo_url} alt={l.title} />
                        <AvatarFallback>
                          {(l.title || "L").split(" ").slice(0, 2).map((p) => p[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="truncate">
                        <div className="font-medium truncate">{l.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{l.location?.chiefdom || l.chiefdom} · {l.location?.district || l.district}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{l.category}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={
                        l.status === "published"
                          ? "default"
                          : l.status === "draft"
                          ? "secondary"
                          : "outline"
                      }
                      className={l.status === "published" ? "bg-secondary text-secondary-foreground" : ""}
                    >
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{l.view_count ?? 0}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <SavedCountCell listingId={l.id} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <LikesCountCell listingId={l.id} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{l.rating?.toFixed?.(1) ?? "-"}</TableCell>
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">{new Date(l.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onView(l)} aria-label="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onEdit(l)} aria-label="Edit">
                            <PenSquare className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onMonitor(l)} aria-label="Monitor">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Monitor</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="py-10 text-center text-sm text-muted-foreground">No listings found</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableCaption className="text-xs">Tip: Use the search and filters to find listings quickly.</TableCaption>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog - full form reuse (responsive) */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="p-0 w-[96vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[90vh]">
          <DialogHeader className="sticky top-0 z-10 bg-background px-6 pt-6 pb-4 border-b">
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editItem && (
            <ScrollArea className="max-h-[calc(90vh-64px)]">
              <div className="px-6 pb-6">
                <CreateListingForm
                  initialValues={editItem}
                  onSubmit={handleUpdateListing}
                  onCancel={() => setEditItem(null)}
                />
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SavedCountCell({ listingId }: { listingId: string | number }) {
  const count = useSavedCount(listingId);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1.5">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{count}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>Number of users who saved this listing</TooltipContent>
    </Tooltip>
  );
}

function LikesCountCell({ listingId }: { listingId: string | number }) {
  const count = useLikesCount(listingId);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{count}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>Number of likes</TooltipContent>
    </Tooltip>
  );
}
