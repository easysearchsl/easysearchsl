import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Replaced textarea with a simple rich text editor component for create form
import RichTextEditor from "@/components/shared/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import {
  getNewsPosts,
  addNewsPost,
  updateNewsPost,
  deleteNewsPost,
  incrementNewsView,
  incrementNewsClick,
  type NewsPost,
} from "@/lib/news-store";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function NewsBlog() {
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
        } else if (active) {
          setListingOptions([]);
        }
      } catch {
        if (active) setListingOptions([]);
      }
    })();
    return () => { active = false; };
  }, []);

  const [items, setItems] = useState<NewsPost[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  // Filters & pagination
  const [query, setQuery] = useState("");
  const [filterListing, setFilterListing] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Create fields
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>(""); // HTML
  const [tags, setTags] = useState<string>("");
  const [coverImageDataUrl, setCoverImageDataUrl] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");
  const [publishDate, setPublishDate] = useState<string>(""); // datetime-local value
  const [imageGalleryDataUrls, setImageGalleryDataUrls] = useState<string[]>([]);

  // View/Edit dialogs
  const [viewItem, setViewItem] = useState<NewsPost | null>(null);
  const [editItem, setEditItem] = useState<NewsPost | null>(null);
  const [editFields, setEditFields] = useState({
    listingIds: [] as string[],
    title: "",
    content: "",
    tags: "",
    coverImageDataUrl: "",
    status: "draft" as "draft" | "published",
  });

  const selectedListingTitles = useMemo(
    () => listingOptions.filter(o => selectedListingIds.includes(o.id)).map(o => o.title),
    [listingOptions, selectedListingIds]
  );

  useEffect(() => {
    try {
      const existing = getNewsPosts();
      setItems(existing);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    // Reset to first page when any filter changes
    setPage(1);
  }, [query, filterListing, statusFilter, pageSize]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    let list = items;
    if (filterListing !== "all") list = list.filter((x) => (x.listingId === filterListing) || (Array.isArray(x.listingIds) && x.listingIds.includes(filterListing)));
    if (statusFilter !== "all") list = list.filter((x) => x.status === statusFilter);
    if (normalizedQuery) {
      list = list.filter((x) =>
        (x.title || "").toLowerCase().includes(normalizedQuery) ||
        (x.content || "").toLowerCase().includes(normalizedQuery) ||
        (x.listingTitle || "").toLowerCase().includes(normalizedQuery) ||
        (x.tags || []).some((t) => (t || "").toLowerCase().includes(normalizedQuery))
      );
    }
    return list;
  }, [items, filterListing, statusFilter, normalizedQuery]);

  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);
  const start = (page - 1) * pageSize;
  const pageItems = filteredItems.slice(start, start + pageSize);

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
      setCoverImageDataUrl(reader.result as string);
      setImageError("");
    };
    reader.readAsDataURL(file);
  };

  const handleCreateGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const limit = 1048576; // 1MB
    const readers: Promise<string>[] = files.map((f) => new Promise((resolve, reject) => {
      if (f.size > limit) {
        reject(new Error(`${f.name} exceeds 1MB`));
        return;
      }
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => reject(new Error("Failed to read file"));
      fr.readAsDataURL(f);
    }));
    Promise.allSettled(readers).then((results) => {
      const successes = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map((r) => r.value);
      const fails = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (fails.length) {
        alert(`Some images were skipped (max 1MB).`);
      }
      setImageGalleryDataUrls((prev) => [...prev, ...successes]);
    });
  };

  const removeGalleryImage = (idx: number) => {
    setImageGalleryDataUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size > 1048576) {
      e.target.value = "";
      alert("Image must be 1MB or less.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditFields((f) => ({ ...f, coverImageDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const resetCreateForm = () => {
    setSelectedListingIds([]);
    setTitle("");
    setContent("");
    setTags("");
    setCoverImageDataUrl("");
    setImageError("");
    setPublishDate("");
    setImageGalleryDataUrls([]);
  };

  const handleSave = (status: "draft" | "published") => {
    if (!selectedListingIds.length || !title || !content) return;
    const now = new Date().toISOString();
    const listingTitles = listingOptions.filter(o => selectedListingIds.includes(o.id)).map(o => o.title);
    const primaryListingId = selectedListingIds[0] || "";
    const primaryListingTitle = listingTitles[0] || "";
    const computedPublishedAt = status === "published"
      ? (publishDate ? new Date(publishDate).toISOString() : now)
      : undefined;
    const post: NewsPost = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      listingId: primaryListingId,
      listingTitle: primaryListingTitle,
      listingIds: selectedListingIds,
      listingTitles,
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      coverImageDataUrl,
      status,
      createdAt: now,
      viewCount: 0,
      clickCount: 0,
      publishedAt: computedPublishedAt,
      imageGalleryDataUrls,
    };
    addNewsPost(post);
    setItems((prev) => [post, ...prev]);
    setShowForm(false);
    resetCreateForm();
  };

  const handleDelete = (id: string) => {
    deleteNewsPost(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">News & Blog</h1>
          <p className="text-muted-foreground mt-1">Create and manage news and blog posts for your listings</p>
        </div>
        {items.length > 0 && (
          <Button onClick={() => {
            setShowForm(true);
            setTimeout(() => {
              formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              setTimeout(() => titleInputRef.current?.focus(), 350);
            }, 0);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Post
          </Button>
        )}
      </div>

      {(showForm || items.length === 0) && (
        <Card ref={formCardRef}>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Live Preview */}
            <div className="rounded-md border p-4 flex items-start gap-3">
              {coverImageDataUrl ? (
                <img src={coverImageDataUrl} alt="Cover" className="h-10 w-10 rounded object-cover" />
              ) : null}
              <div className="flex-1">
                <div className="font-semibold">{title || "Post title"}</div>
                <div className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: content || "<em>Post content</em>" }} />
              </div>
              <div className="flex flex-wrap gap-1 justify-end min-w-[120px]">
                {selectedListingTitles.length > 0 ? (
                  selectedListingTitles.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))
                ) : (
                  <Badge variant="secondary">No listings</Badge>
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
                <label className="text-sm font-medium">Cover Image (optional, max 1MB)</label>
                <Input type="file" accept="image/*" onChange={handleCreateImageChange} />
                {imageError && <p className="text-xs text-destructive">{imageError}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title<span className="text-destructive"> *</span></label>
              <Input ref={titleInputRef} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content<span className="text-destructive"> *</span></label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., update, launch, promo" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Publish Date (optional)</label>
              <Input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gallery (optional, images ≤ 1MB each)</label>
              <Input type="file" accept="image/*" multiple onChange={handleCreateGalleryChange} />
              {imageGalleryDataUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                  {imageGalleryDataUrls.map((src, idx) => (
                    <div key={idx} className="relative group">
                      <img src={src} className="w-full h-20 object-cover rounded" />
                      <button type="button" className="absolute top-1 right-1 text-xs bg-destructive text-white px-1 rounded opacity-0 group-hover:opacity-100" onClick={() => removeGalleryImage(idx)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleSave("draft")}>Save Draft</Button>
              <Button onClick={() => handleSave("published")} className="bg-primary">Publish</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); resetCreateForm(); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, content, tags, listing" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Listing</label>
                <Select value={filterListing} onValueChange={setFilterListing}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Listings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Listings</SelectItem>
                    {listingOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full md:w-40 space-y-2">
              <label className="text-sm font-medium">Rows per page</label>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {items.length === 0 ? "No posts yet. Create your first one below." : "No results match your filters."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(it.listingTitles && it.listingTitles.length > 0 ? it.listingTitles : [it.listingTitle]).map((t) => (
                          <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{it.status}</TableCell>
                    <TableCell>{it.publishedAt ? new Date(it.publishedAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>{it.viewCount || 0}</TableCell>
                    <TableCell>{it.clickCount || 0}</TableCell>
                    <TableCell>{new Date(it.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          try { incrementNewsView(it.id); } catch {}
                          setItems((prev) => prev.map((x) => x.id === it.id ? { ...x, viewCount: (x.viewCount || 0) + 1 } : x));
                          setViewItem(it);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditItem(it);
                          setEditFields({
                            listingIds: it.listingIds && it.listingIds.length ? it.listingIds : [it.listingId],
                            title: it.title,
                            content: it.content,
                            tags: (it.tags || []).join(', '),
                            coverImageDataUrl: it.coverImageDataUrl || '',
                            status: it.status,
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(it.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filteredItems.length > 0 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {(() => {
                  const pages: (number | 'ellipsis')[] = [];
                  const add = (n: number | 'ellipsis') => pages.push(n);
                  const showCount = 5;
                  if (totalPages <= showCount) {
                    for (let i = 1; i <= totalPages; i++) add(i);
                  } else {
                    const startPage = Math.max(1, page - 1);
                    const endPage = Math.min(totalPages, page + 1);
                    add(1);
                    if (startPage > 2) add('ellipsis');
                    for (let i = startPage; i <= endPage; i++) if (i !== 1 && i !== totalPages) add(i);
                    if (endPage < totalPages - 1) add('ellipsis');
                    if (totalPages > 1) add(totalPages);
                  }
                  return pages.map((p, idx) => (
                    p === 'ellipsis' ? (
                      <PaginationItem key={`e-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => { e.preventDefault(); setPage(Number(p)); }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  ));
                })()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
      

        {/* View Dialog */}
        <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{viewItem?.title}</DialogTitle>
            </DialogHeader>
            {viewItem && (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {viewItem.coverImageDataUrl && (
                  <img
                    src={viewItem.coverImageDataUrl}
                    alt="Cover"
                    className="w-full h-44 sm:h-56 md:h-64 object-cover rounded cursor-pointer"
                    onClick={() => {
                      try { incrementNewsClick(viewItem.id); } catch {}
                      setItems((prev) => prev.map((x) => x.id === viewItem.id ? { ...x, clickCount: (x.clickCount || 0) + 1 } : x));
                    }}
                  />
                )}
                <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: viewItem.content }} />
                {Array.isArray(viewItem.imageGalleryDataUrls) && viewItem.imageGalleryDataUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
                    {viewItem.imageGalleryDataUrls.map((src, idx) => (
                      <img key={idx} src={src} alt={`Gallery ${idx+1}`} className="w-full h-28 object-cover rounded" />
                    ))}
                  </div>
                )}
                {viewItem.tags && viewItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {viewItem.tags.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          <DialogFooter className="bg-background border-t mt-2 pt-3">
            <Button onClick={() => setViewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">Listings</label>
                <ScrollArea className="h-40 rounded border p-2">
                  <div className="space-y-2 pr-2">
                    {listingOptions.map((opt) => {
                      const checked = editFields.listingIds.includes(opt.id);
                      return (
                        <label key={opt.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => setEditFields((f) => ({
                              ...f,
                              listingIds: v ? (f.listingIds.includes(opt.id) ? f.listingIds : [...f.listingIds, opt.id]) : f.listingIds.filter((id) => id !== opt.id)
                            }))}
                          />
                          <span>{opt.title}</span>
                        </label>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={editFields.title} onChange={(e) => setEditFields((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea rows={6} value={editFields.content} onChange={(e) => setEditFields((f) => ({ ...f, content: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input value={editFields.tags} onChange={(e) => setEditFields((f) => ({ ...f, tags: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Image (optional, max 1MB)</label>
                <Input type="file" accept="image/*" onChange={handleEditImageChange} />
                {editFields.coverImageDataUrl && (
                  <img src={editFields.coverImageDataUrl} alt="Cover" className="w-full h-44 sm:h-56 md:h-64 object-cover rounded" />
                )}
              </div>
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2">Live Preview</h4>
                <div className="space-y-3">
                  {editFields.coverImageDataUrl && (
                    <img src={editFields.coverImageDataUrl} alt="Cover" className="w-full h-44 sm:h-56 md:h-64 object-cover rounded" />
                  )}
                  <h3 className="text-lg font-semibold">{editFields.title || editItem.title}</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: editFields.content || editItem.content }} />
                  {!!editFields.tags && editFields.tags.split(',').map(t => t.trim()).filter(Boolean).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editFields.tags.split(',').map(t => t.trim()).filter(Boolean).map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {/* Save Changes */}
                <Button onClick={() => {
                  const newListingIds = editFields.listingIds.length ? editFields.listingIds : [editItem.listingId];
                  const newListingTitles = listingOptions.filter(o => newListingIds.includes(o.id)).map(o => o.title);
                  const primaryListingId = newListingIds[0] || editItem.listingId;
                  const primaryListingTitle = newListingTitles[0] || editItem.listingTitle;
                  const updated: NewsPost = {
                    ...editItem,
                    listingId: primaryListingId,
                    listingTitle: primaryListingTitle,
                    listingIds: newListingIds,
                    listingTitles: newListingTitles,
                    title: editFields.title,
                    content: editFields.content,
                    tags: editFields.tags.split(',').map(t => t.trim()).filter(Boolean),
                    coverImageDataUrl: editFields.coverImageDataUrl,
                    status: editFields.status,
                    publishedAt: editItem.publishedAt,
                    updatedAt: new Date().toISOString(),
                  };
                  updateNewsPost(updated);
                  setItems((prev) => prev.map(x => x.id === updated.id ? updated : x));
                  setEditItem(null);
                }}>Save Changes</Button>

                {/* Publish */}
                {editFields.status !== 'published' && (
                  <Button onClick={() => {
                    const newListingIds = editFields.listingIds.length ? editFields.listingIds : [editItem.listingId];
                    const newListingTitles = listingOptions.filter(o => newListingIds.includes(o.id)).map(o => o.title);
                    const primaryListingId = newListingIds[0] || editItem.listingId;
                    const primaryListingTitle = newListingTitles[0] || editItem.listingTitle;
                    const nowIso = new Date().toISOString();
                    const updated: NewsPost = {
                      ...editItem,
                      listingId: primaryListingId,
                      listingTitle: primaryListingTitle,
                      listingIds: newListingIds,
                      listingTitles: newListingTitles,
                      title: editFields.title,
                      content: editFields.content,
                      tags: editFields.tags.split(',').map(t => t.trim()).filter(Boolean),
                      coverImageDataUrl: editFields.coverImageDataUrl,
                      status: 'published',
                      publishedAt: editItem.publishedAt || nowIso,
                      updatedAt: nowIso,
                    };
                    updateNewsPost(updated);
                    setItems((prev) => prev.map(x => x.id === updated.id ? updated : x));
                    setEditItem(null);
                  }}>Publish</Button>
                )}

                {/* Unpublish */}
                {editFields.status === 'published' && (
                  <Button variant="outline" onClick={() => {
                    const newListingIds = editFields.listingIds.length ? editFields.listingIds : [editItem.listingId];
                    const newListingTitles = listingOptions.filter(o => newListingIds.includes(o.id)).map(o => o.title);
                    const primaryListingId = newListingIds[0] || editItem.listingId;
                    const primaryListingTitle = newListingTitles[0] || editItem.listingTitle;
                    const updated: NewsPost = {
                      ...editItem,
                      listingId: primaryListingId,
                      listingTitle: primaryListingTitle,
                      listingIds: newListingIds,
                      listingTitles: newListingTitles,
                      title: editFields.title,
                      content: editFields.content,
                      tags: editFields.tags.split(',').map(t => t.trim()).filter(Boolean),
                      coverImageDataUrl: editFields.coverImageDataUrl,
                      status: 'draft',
                      publishedAt: undefined,
                      updatedAt: new Date().toISOString(),
                    };
                    updateNewsPost(updated);
                    setItems((prev) => prev.map(x => x.id === updated.id ? updated : x));
                    setEditItem(null);
                  }}>Unpublish</Button>
                )}

                <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
