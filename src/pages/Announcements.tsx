import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Trash2, Trophy, Plus, Eye, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  getAnnouncements, 
  addAnnouncement, 
  deleteAnnouncement, 
  type Announcement as AnnouncementType 
} from "@/lib/announcements-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CTA_TYPES = [
  "Announcement",
  "Book Now",
  "Buy Tickets",
  "Contact Us",
  "Get Offer",
  "Get Quote",
  "Join Now",
  "Learn More",
  "Print Coupon",
  "Reserve Now",
  "Schedule Appointment",
];

export default function Announcements() {
  const [listingOptions, setListingOptions] = useState<Array<{ id: string; title: string }>>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id, title, status')
          .eq('status', 'published')
          .order('title');
        if (!error && Array.isArray(data)) {
          const opts = data.map((l: any) => ({ id: String(l.id), title: l.title || 'Listing' }));
          if (active) setListingOptions(opts);
        } else if (active) setListingOptions([]);
      } catch {
        if (active) setListingOptions([]);
      }
    })();
    return () => { active = false; };
  }, []);

  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [ctaType, setCtaType] = useState<string>("Announcement");
  // Single image (<= 1MB)
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [buttonText, setButtonText] = useState<string>("Announcement");
  const [buttonLink, setButtonLink] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [items, setItems] = useState<AnnouncementType[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [viewItem, setViewItem] = useState<AnnouncementType | null>(null);
  const [editItem, setEditItem] = useState<AnnouncementType | null>(null);
  const [editFields, setEditFields] = useState({
    listingId: "",
    listingIds: [] as string[],
    ctaType: "Announcement",
    imageDataUrl: "",
    title: "",
    description: "",
    buttonText: "Announcement",
    buttonLink: "",
    expiresAt: "",
  });

  const selectedListingTitles = useMemo(
    () => listingOptions.filter(o => selectedListingIds.includes(o.id)).map(o => o.title),
    [selectedListingIds, listingOptions]
  );

  // Image handlers (Create)
  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size > 1048576) { // 1MB
      setImageError("Image must be 1MB or less.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setImageError("");
    };
    reader.readAsDataURL(file);
  };

  // Image handlers (Edit)
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size > 1048576) {
      // For edit, we won't keep a separate error state; inline feedback is enough
      e.target.value = "";
      alert("Image must be 1MB or less.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditFields((f) => ({ ...f, imageDataUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const loaded = getAnnouncements();
    // Backfill missing status for older saved data
    const normalized = loaded.map((a) => ({
      ...a,
      status: (a as any).status ?? "draft",
      viewCount: (a as any).viewCount ?? 0,
      clickCount: (a as any).clickCount ?? 0,
    })) as AnnouncementType[];
    setItems(normalized);
    // When there are no announcements, keep the form hidden until user clicks the button
    setShowForm(false);
  }, []);

  const handleSaveWithStatus = (status: "draft" | "published") => {
    if (!selectedListingIds.length || !title || !description) return;
    const listingTitles = listingOptions
      .filter(o => selectedListingIds.includes(o.id))
      .map(o => o.title);
    const primaryListingId = selectedListingIds[0] || "";
    const primaryListingTitle = listingTitles[0] || "";
    const ann: AnnouncementType = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      listingId: primaryListingId,
      listingTitle: primaryListingTitle,
      listingIds: selectedListingIds,
      listingTitles,
      ctaType,
      title,
      description,
      buttonText,
      buttonLink,
      imageDataUrl,
      status,
      viewCount: 0,
      clickCount: 0,
      expiresAt: expiresAt || undefined,
      createdAt: new Date().toISOString(),
    };
    addAnnouncement(ann);
    setItems((prev) => [ann, ...prev]);
    // Hide form and reset fields
    setShowForm(false);
    setSelectedListingIds([]);
    setCtaType("Announcement");
    setTitle("");
    setDescription("");
    setButtonText("Announcement");
    setButtonLink("");
    setImageDataUrl("");
    setImageError("");
    setExpiresAt("");
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-1">Create and preview call-to-action announcements for your listings</p>
        </div>
        {items.length > 0 && (
          <Button
            onClick={() => {
              setShowForm(true);
              setTimeout(() => {
                formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => titleInputRef.current?.focus(), 350);
              }, 0);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Announcement
          </Button>
        )}
      </div>
      

      {/* Form (hidden until button is clicked) */}
      {showForm && (
      <Card ref={formCardRef}>
        <CardContent className="p-6 space-y-4">
              {/* Live Preview (Inside Form) */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Live Preview</div>
                <div className="rounded-md border p-4 flex items-start gap-3">
                  {imageDataUrl ? (
                    <img src={imageDataUrl} alt="Announcement" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="mt-1 text-secondary">
                      <Megaphone className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">
                      {title || "e.g. 46% Off - Two Vouchers Each Valid for One Large Specialty Pizza"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {description || "We are proud to announce launch of new branch"}
                    </div>
                  </div>
                  {buttonLink?.trim() ? (
                    <Button asChild className="ml-auto whitespace-nowrap">
                      <a
                        href={buttonLink.trim().startsWith("http") ? buttonLink.trim() : `https://${buttonLink.trim()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ctaType || buttonText?.trim() || "Announcement"}
                      </a>
                    </Button>
                  ) : (
                    <Button className="ml-auto whitespace-nowrap" disabled>
                      {ctaType || buttonText?.trim() || "Announcement"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose Listings<span className="text-destructive"> *</span></label>
                  <ScrollArea className="h-40 rounded border p-2">
                    <div className="space-y-2 pr-2">
                      {listingOptions.map((opt) => {
                        const checked = selectedListingIds.includes(opt.id);
                        return (
                          <label key={opt.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                setSelectedListingIds((prev) => {
                                  if (v) return prev.includes(opt.id) ? prev : [...prev, opt.id];
                                  return prev.filter((id) => id !== opt.id);
                                });
                              }}
                            />
                            <span>{opt.title}</span>
                          </label>
                        );
                      })}
                    </div>
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                  {selectedListingTitles.length > 0 && (
                    <p className="text-xs text-muted-foreground flex flex-wrap gap-1 pt-1">
                      Selected:
                      {selectedListingTitles.map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Choose Call To Action Type<span className="text-destructive"> *</span></label>
                  <Select value={ctaType} onValueChange={setCtaType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Announcement" />
                    </SelectTrigger>
                    <SelectContent>
                      {CTA_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Expires On <span className="text-muted-foreground">(optional)</span></label>
                  <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Announcement Image <span className="text-muted-foreground">(max 1MB, 1 image)</span></label>
                  <Input type="file" accept="image/*" onChange={handleCreateImageChange} />
                  {imageError && <p className="text-xs text-destructive">{imageError}</p>}
                  {imageDataUrl && (
                    <div className="flex items-center gap-3">
                      <img src={imageDataUrl} alt="Preview" className="h-12 w-12 rounded object-cover border" />
                      <Button variant="ghost" onClick={() => setImageDataUrl("")}>Remove</Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Call To Action Title<span className="text-destructive"> *</span></label>
                  <Input
                    placeholder="e.g. 46% Off - Two Vouchers Each Valid for One Large Specialty Pizza"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    ref={titleInputRef}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Description<span className="text-destructive"> *</span></label>
                  <Textarea
                    placeholder="We are proud to announce launch of new branch"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Text</label>
                  <Input
                    placeholder="Announcement"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Link</label>
                  <Input
                    placeholder="www.example.com/special-offer"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => handleSaveWithStatus("draft")} disabled={!selectedListingIds.length || !title || !description}>
                    Save as Draft
                  </Button>
                  <Button onClick={() => handleSaveWithStatus("published")} disabled={!selectedListingIds.length || !title || !description}>
                    Publish Announcement
                  </Button>
                </div>
              </div>
        </CardContent>
      </Card>
      )}

      {/* Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <Trophy className="h-20 w-20 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Nothing but this golden trophy!</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                You must be here for the first time. If you like to add something, click the button below.
              </p>
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => {
                  setShowForm(true);
                  setTimeout(() => {
                    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setTimeout(() => titleInputRef.current?.focus(), 350);
                  }, 0);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                + ADD NEW ANNOUNCEMENT
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listings</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>CTA</TableHead>
                    <TableHead>Button</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-wrap gap-1">
                          {(a.listingTitles && a.listingTitles.length > 0 ? a.listingTitles : [a.listingTitle]).map((t) => (
                            <Badge key={t} variant="secondary">{t}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{a.title}</TableCell>
                      <TableCell><Badge variant="secondary">{a.ctaType}</Badge></TableCell>
                      <TableCell>{a.buttonText}</TableCell>
                      <TableCell className="truncate max-w-[240px]">{a.buttonLink}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === "published" ? "default" : "secondary"}>{a.status}</Badge>
                      </TableCell>
                      <TableCell>{a.viewCount ?? 0}</TableCell>
                      <TableCell>{a.clickCount ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setViewItem(a)} aria-label="View announcement">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditItem(a);
                              setEditFields({
                                listingId: a.listingId,
                                listingIds: a.listingIds && a.listingIds.length ? a.listingIds : [a.listingId],
                                ctaType: a.ctaType,
                                imageDataUrl: a.imageDataUrl || "",
                                title: a.title,
                                description: a.description,
                                buttonText: a.buttonText || "",
                                buttonLink: a.buttonLink || "",
                                expiresAt: a.expiresAt || "",
                              });
                            }}
                            aria-label="Edit announcement"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} aria-label="Delete announcement">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="sm:max-w-[520px] md:max-w-xl w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
            <DialogDescription>Preview of the announcement</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3">
              <div className="rounded-md border p-4 flex items-start gap-3">
                {viewItem.imageDataUrl ? (
                  <img src={viewItem.imageDataUrl} alt="Announcement" className="h-10 w-10 rounded object-cover" />
                ) : (
                  <div className="mt-1 text-secondary">
                    <Megaphone className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold">{viewItem.title}</div>
                  <div className="text-sm text-muted-foreground">{viewItem.description}</div>
                </div>
                {viewItem.buttonLink?.trim() ? (
                  <Button asChild className="ml-auto whitespace-nowrap">
                    <a
                      href={viewItem.buttonLink.trim().startsWith("http") ? viewItem.buttonLink.trim() : `https://${viewItem.buttonLink.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {viewItem.ctaType || viewItem.buttonText || "Announcement"}
                    </a>
                  </Button>
                ) : (
                  <Button className="ml-auto whitespace-nowrap" disabled>
                    {viewItem.ctaType || viewItem.buttonText || "Announcement"}
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>
                  Status: <Badge variant={viewItem.status === "published" ? "default" : "secondary"}>{viewItem.status}</Badge>
                </span>
                <span>•</span>
                <span>Views {viewItem.viewCount ?? 0}</span>
                <span>•</span>
                <span>Clicks {viewItem.clickCount ?? 0}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-[520px] md:max-w-3xl w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>Update details and save</DialogDescription>
          </DialogHeader>
          {editItem && (
            <div className="space-y-3">
              {/* Live Preview (Edit) */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Live Preview</div>
                <div className="rounded-md border p-4 flex items-start gap-3">
                  {editFields.imageDataUrl ? (
                    <img src={editFields.imageDataUrl} alt="Announcement" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="mt-1 text-secondary">
                      <Megaphone className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">
                      {editFields.title || "e.g. 46% Off - Two Vouchers Each Valid for One Large Specialty Pizza"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {editFields.description || "We are proud to announce launch of new branch"}
                    </div>
                  </div>
                  {editFields.buttonLink?.trim() ? (
                    <Button asChild className="ml-auto whitespace-nowrap">
                      <a
                        href={editFields.buttonLink.trim().startsWith("http") ? editFields.buttonLink.trim() : `https://${editFields.buttonLink.trim()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {editFields.ctaType || editFields.buttonText?.trim() || "Announcement"}
                      </a>
                    </Button>
                  ) : (
                    <Button className="ml-auto whitespace-nowrap" disabled>
                      {editFields.ctaType || editFields.buttonText?.trim() || "Announcement"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Listings</label>
                  <ScrollArea className="h-40 rounded border p-2">
                    <div className="space-y-2 pr-2">
                      {listingOptions.map((opt) => {
                        const checked = editFields.listingIds.includes(opt.id);
                        return (
                          <label key={opt.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                setEditFields((f) => {
                                  const current = new Set(f.listingIds);
                                  if (v) current.add(opt.id); else current.delete(opt.id);
                                  return { ...f, listingIds: Array.from(current) };
                                });
                              }}
                            />
                            <span>{opt.title}</span>
                          </label>
                        );
                      })}
                    </div>
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">CTA Type</label>
                  <Select value={editFields.ctaType} onValueChange={(v) => setEditFields((f) => ({ ...f, ctaType: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CTA_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium">Announcement Image <span className="text-muted-foreground">(max 1MB, 1 image)</span></label>
                  <Input type="file" accept="image/*" onChange={handleEditImageChange} />
                  {editFields.imageDataUrl && (
                    <div className="flex items-center gap-3 pt-1">
                      <img src={editFields.imageDataUrl} alt="Preview" className="h-12 w-12 rounded object-cover border" />
                      <Button variant="ghost" onClick={() => setEditFields((f) => ({ ...f, imageDataUrl: "" }))}>Remove</Button>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={editFields.title} onChange={(e) => setEditFields((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea rows={4} value={editFields.description} onChange={(e) => setEditFields((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Button Text</label>
                  <Input value={editFields.buttonText} onChange={(e) => setEditFields((f) => ({ ...f, buttonText: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Button Link</label>
                  <Input
                    placeholder="www.example.com/special-offer"
                    value={editFields.buttonLink}
                    onChange={(e) => setEditFields((f) => ({ ...f, buttonLink: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Expires On <span className="text-muted-foreground">(optional)</span></label>
                  <Input type="date" value={editFields.expiresAt} onChange={(e) => setEditFields((f) => ({ ...f, expiresAt: e.target.value }))} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {editItem?.status === 'published' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!editItem) return;
                      const ids = editFields.listingIds && editFields.listingIds.length ? editFields.listingIds : [editFields.listingId];
                      const titles = listingOptions.filter((o) => ids.includes(o.id)).map((o) => o.title);
                      const primaryId = ids[0] || editItem.listingId;
                      const primaryTitle = titles[0] || editItem.listingTitle;
                      const updated = {
                        ...editItem,
                        ctaType: editFields.ctaType,
                        imageDataUrl: editFields.imageDataUrl,
                        title: editFields.title,
                        description: editFields.description,
                        buttonText: editFields.buttonText,
                        buttonLink: editFields.buttonLink,
                        expiresAt: editFields.expiresAt || undefined,
                        listingId: primaryId,
                        listingTitle: primaryTitle,
                        listingIds: ids,
                        listingTitles: titles,
                        status: 'draft',
                      } as AnnouncementType;
                      (async () => {
                        const { updateAnnouncement } = await import("@/lib/announcements-store");
                        updateAnnouncement(updated);
                      })();
                      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                      setEditItem(null);
                    }}
                  >
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (!editItem) return;
                      const ids = editFields.listingIds && editFields.listingIds.length ? editFields.listingIds : [editFields.listingId];
                      const titles = listingOptions.filter((o) => ids.includes(o.id)).map((o) => o.title);
                      const primaryId = ids[0] || editItem.listingId;
                      const primaryTitle = titles[0] || editItem.listingTitle;
                      const updated = {
                        ...editItem,
                        ctaType: editFields.ctaType,
                        imageDataUrl: editFields.imageDataUrl,
                        title: editFields.title,
                        description: editFields.description,
                        buttonText: editFields.buttonText,
                        buttonLink: editFields.buttonLink,
                        expiresAt: editFields.expiresAt || undefined,
                        listingId: primaryId,
                        listingTitle: primaryTitle,
                        listingIds: ids,
                        listingTitles: titles,
                        status: 'published',
                      } as AnnouncementType;
                      (async () => {
                        const { updateAnnouncement } = await import("@/lib/announcements-store");
                        updateAnnouncement(updated);
                      })();
                      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                      setEditItem(null);
                    }}
                  >
                    Publish
                  </Button>
                )}
              </div>
              <Button
                onClick={() => {
                  if (!editItem) return;
                  const ids = editFields.listingIds && editFields.listingIds.length ? editFields.listingIds : [editFields.listingId];
                  const titles = listingOptions.filter((o) => ids.includes(o.id)).map((o) => o.title);
                  const primaryId = ids[0] || editItem.listingId;
                  const primaryTitle = titles[0] || editItem.listingTitle;
                  const updated = {
                    ...editItem,
                    ctaType: editFields.ctaType,
                    imageDataUrl: editFields.imageDataUrl,
                    title: editFields.title,
                    description: editFields.description,
                    buttonText: editFields.buttonText,
                    buttonLink: editFields.buttonLink,
                    expiresAt: editFields.expiresAt || undefined,
                    listingId: primaryId,
                    listingTitle: primaryTitle,
                    listingIds: ids,
                    listingTitles: titles,
                  } as AnnouncementType;
                  // persist
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  (async () => {
                    const { updateAnnouncement } = await import("@/lib/announcements-store");
                    updateAnnouncement(updated);
                  })();
                  setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
                  setEditItem(null);
                }}
              >
                {editItem?.status === 'published' ? 'Save Changes' : 'Save as Draft'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
