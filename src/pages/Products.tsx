import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  incrementProductView,
  incrementProductClick,
  type Product,
} from "@/lib/products-store";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Products() {
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

  const [items, setItems] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Filters & pagination
  const [query, setQuery] = useState("");
  const [filterListing, setFilterListing] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Create fields
  // Back-compat: we keep listingId state but use selectedListingIds for multi-select
  const [listingId, setListingId] = useState<string>("");
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [createType, setCreateType] = useState<Product['type']>('product');
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [currency, setCurrency] = useState<string>("Le");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [publishDate, setPublishDate] = useState<string>("");
  const [buttonText, setButtonText] = useState<string>("");
  const [buttonLink, setButtonLink] = useState<string>("");
  // Removed gallery images from form per request

  // View/Edit dialogs
  const [viewItem, setViewItem] = useState<Product | null>(null);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [editFields, setEditFields] = useState({
    listingIds: [] as string[],
    type: 'product' as 'product' | 'service',
    name: "",
    description: "",
    priceMin: "",
    priceMax: "",
    currency: "Le",
    imageDataUrl: "",
    status: "draft" as "draft" | "published",
    tags: "",
    buttonText: "",
    buttonLink: "",
  });

  const selectedListings = useMemo(
    () => listingOptions.filter(o => selectedListingIds.includes(o.id)),
    [selectedListingIds, listingOptions]
  );

  useEffect(() => {
    try {
      const existing = getProducts();
      setItems(existing);
    } catch {
      setItems([]);
    }
  }, []);

  // Increment view when opening the view dialog
  useEffect(() => {
    if (!viewItem) return;
    incrementProductView(viewItem.id);
    setItems(prev => prev.map(x => x.id === viewItem.id ? { ...x, viewCount: (x.viewCount || 0) + 1 } : x));
  }, [viewItem]);

  useEffect(() => {
    // Reset to first page when any filter changes
    setPage(1);
  }, [query, filterListing, statusFilter, pageSize, typeFilter]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    let list = items;
    if (filterListing !== "all") list = list.filter((x) => (x.listingId === filterListing) || (Array.isArray(x.listingIds) && x.listingIds.includes(filterListing)));
    if (statusFilter !== "all") list = list.filter((x) => x.status === statusFilter);
    if (typeFilter !== "all") list = list.filter((x) => x.type === (typeFilter as any));
    if (normalizedQuery) {
      list = list.filter((x) =>
        (x.name || "").toLowerCase().includes(normalizedQuery) ||
        (x.description || "").toLowerCase().includes(normalizedQuery) ||
        (x.listingTitle || "").toLowerCase().includes(normalizedQuery) ||
        ((Array.isArray(x.listingTitles) ? x.listingTitles.join(", ") : "").toLowerCase().includes(normalizedQuery)) ||
        ((x.tags || []).join(", ").toLowerCase().includes(normalizedQuery))
      );
    }
    return list;
  }, [items, filterListing, statusFilter, typeFilter, normalizedQuery]);

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
      setImageDataUrl(reader.result as string);
      setImageError("");
    };
    reader.readAsDataURL(file);
  };

  // Removed gallery upload handler per request

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size > 1048576) {
      e.target.value = "";
      alert("Image must be 1MB or less.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditFields((f) => ({ ...f, imageDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const resetCreateForm = () => {
    setListingId("");
    setCreateType('product');
    setName("");
    setDescription("");
    setPriceMin("");
    setPriceMax("");
    setCurrency("Le");
    setImageDataUrl("");
    setImageError("");
    setSelectedListingIds([]);
    setTags("");
    setPublishDate("");
    setButtonText("");
    setButtonLink("");
  };

  const handleSave = (status: "draft" | "published") => {
    if (!selectedListingIds.length || !name) return;
    const now = new Date().toISOString();
    const listingTitles = listingOptions.filter(o => selectedListingIds.includes(o.id)).map(o => o.title);
    const primaryId = selectedListingIds[0] || "";
    const primaryTitle = listingTitles[0] || "";
    const computedPublishedAt = status === 'published' ? (publishDate ? new Date(publishDate).toISOString() : now) : undefined;
    // Validate price range
    const minVal = priceMin ? Number(priceMin) : undefined;
    const maxVal = priceMax ? Number(priceMax) : undefined;
    if (minVal != null && maxVal != null && minVal > maxVal) {
      alert("Price Min cannot be greater than Price Max.");
      return;
    }
    const p: Product = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      listingId: primaryId,
      listingTitle: primaryTitle,
      listingIds: selectedListingIds,
      listingTitles,
      type: createType,
      name,
      description: description || undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      // Legacy single price fallback stored as min
      price: priceMin ? Number(priceMin) : undefined,
      currency,
      imageDataUrl,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      buttonText: buttonText || undefined,
      buttonLink: buttonLink || undefined,
      viewCount: 0,
      clickCount: 0,
      publishedAt: computedPublishedAt,
      status,
      createdAt: now,
    };
    addProduct(p);
    setItems((prev) => [p, ...prev]);
    setShowForm(false);
    resetCreateForm();
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Our Products & Services</h1>
          <p className="text-muted-foreground mt-1">Create and manage products and services for your listings</p>
        </div>
        <Button
          title={showForm ? 'Hide form' : 'Add New Product/Service'}
          aria-label={showForm ? 'Hide product/service form' : 'Add new product or service'}
          onClick={() => {
            setShowForm((prev) => {
              const next = !prev;
              if (!prev) {
                setTimeout(() => {
                  formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setTimeout(() => nameInputRef.current?.focus(), 350);
                }, 0);
              }
              return next;
            });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Hide Form' : 'Add New Product/Service'}
        </Button>
      </div>

      {showForm && (
        <Card ref={formCardRef}>
          <CardContent className="p-6 space-y-4">
            {/* Live Preview */}
            <div className="rounded-md border p-4 flex items-start gap-3">
              {imageDataUrl ? (
                <img src={imageDataUrl} alt="Product" className="h-10 w-10 rounded object-cover" />
              ) : null}
              <div className="flex-1">
                <div className="font-semibold">{name || (createType === 'service' ? 'Service name' : 'Product name')}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{description || (createType === 'service' ? 'Service description' : 'Product description')}</div>
                {tags && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tags.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                      <Badge key={i} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedListings.length > 0 ? selectedListings.map(sl => (
                  <Badge key={sl.id} variant="secondary">{sl.title}</Badge>
                )) : <Badge variant="secondary">No listing</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose Listings<span className="text-destructive"> *</span></label>
                <p className="text-xs text-muted-foreground">Select one or more listings to publish this product to.</p>
                <ScrollArea className="h-40 rounded border p-2">
                  <div className="space-y-2 pr-2">
                    {listingOptions.map((opt) => {
                      const checked = selectedListingIds.includes(opt.id);
                      return (
                        <label key={opt.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              setSelectedListingIds((prev) =>
                                v ? [...prev, opt.id] : prev.filter((id) => id !== opt.id)
                              );
                            }}
                          />
                          <span>{opt.title}</span>
                        </label>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
                {selectedListings.length > 0 && (
                  <p className="text-xs text-muted-foreground flex flex-wrap gap-1">Selected: {selectedListings.map(s => (
                    <Badge key={s.id} variant="secondary">{s.title}</Badge>
                  ))}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Product Image (optional, max 1MB)</label>
                <p className="text-xs text-muted-foreground">Primary image for the product. Optional.</p>
                <Input type="file" accept="image/*" onChange={handleCreateImageChange} />
                {imageError && <p className="text-xs text-destructive">{imageError}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={createType} onValueChange={(v) => setCreateType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Name<span className="text-destructive"> *</span></label>
              <Input ref={nameInputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder={createType === 'service' ? 'Service name' : 'Product name'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{createType === 'service' ? 'Rate Min' : 'Price Min'}</label>
                <p className="text-xs text-muted-foreground">Leave blank if not applicable.</p>
                <Input type="number" inputMode="decimal" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="e.g., 150000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{createType === 'service' ? 'Rate Max' : 'Price Max'}</label>
                <p className="text-xs text-muted-foreground">Optional upper bound.</p>
                <Input type="number" inputMode="decimal" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="e.g., 300000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <p className="text-xs text-muted-foreground">Default is Le.</p>
                <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Le" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <p className="text-xs text-muted-foreground">Short description; plain text.</p>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..." rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <p className="text-xs text-muted-foreground">Separate with commas; helps search and filtering.</p>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., electronics, new" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Publish Date</label>
                <p className="text-xs text-muted-foreground">If status is Published, this is the visible published time.</p>
                <Input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">CTA Button Text</label>
                <p className="text-xs text-muted-foreground">Button label shown in product view/dialog.</p>
                <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="e.g., Buy Now" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CTA Link (URL)</label>
                <p className="text-xs text-muted-foreground">Where the button sends users (https://...).</p>
                <Input value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} placeholder="https://..." />
              </div>
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
          <CardTitle>Products & Services</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, description, listing" />
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="product">Products</SelectItem>
                    <SelectItem value="service">Services</SelectItem>
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
            <div className="text-sm text-muted-foreground">No products or services yet. Click "Add New Product/Service" to create your first one.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Price/Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.name}{it.type === 'service' ? <Badge className="ml-2" variant="outline">Service</Badge> : null}</TableCell>
                    <TableCell>
                      {Array.isArray(it.listingTitles) && it.listingTitles.length > 0
                        ? it.listingTitles.join(", ")
                        : it.listingTitle}
                    </TableCell>
                    <TableCell>{
                      it.priceMin != null && it.priceMax != null
                        ? `${it.currency || 'Le'} ${it.priceMin.toLocaleString()} - ${it.priceMax.toLocaleString()}`
                        : it.priceMin != null
                        ? `${it.currency || 'Le'} ${it.priceMin.toLocaleString()}`
                        : it.priceMax != null
                        ? `${it.currency || 'Le'} ${it.priceMax.toLocaleString()}`
                        : it.price != null
                        ? `${it.currency || 'Le'} ${it.price.toLocaleString()}`
                        : '-'
                    }</TableCell>
                    <TableCell>{it.status}</TableCell>
                    <TableCell>{new Date(it.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{it.viewCount || 0}</TableCell>
                    <TableCell>{it.clickCount || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" title={`View ${it.name}`} aria-label={`View ${it.name}`} onClick={() => { setViewItem(it); }}><Eye className="h-4 w-4"/></Button>
                      <Button size="sm" variant="outline" onClick={() => {
                          setEditItem(it);
                          setEditFields({
                            listingIds: Array.isArray(it.listingIds) && it.listingIds.length ? it.listingIds : [it.listingId],
                            type: it.type || 'product',
                            name: it.name,
                            description: it.description || '',
                            priceMin: it.priceMin != null ? String(it.priceMin) : (it.price != null ? String(it.price) : ''),
                            priceMax: it.priceMax != null ? String(it.priceMax) : '',
                            currency: it.currency || 'Le',
                            imageDataUrl: it.imageDataUrl || '',
                            status: it.status,
                            tags: (it.tags || []).join(', '),
                            buttonText: it.buttonText || '',
                            buttonLink: it.buttonLink || '',
                          });
                        }}><Pencil className="h-4 w-4"/></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(it.id)}><Trash2 className="h-4 w-4"/></Button>
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
        <DialogContent className="w-[95vw] max-w-screen-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewItem?.name}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3">
              {viewItem.imageDataUrl && (
                <img src={viewItem.imageDataUrl} alt="Product" className="w-full h-44 object-cover rounded" />
              )}
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{viewItem.description}</div>
              <div className="text-sm font-medium">{
                viewItem.priceMin != null && viewItem.priceMax != null
                  ? `${viewItem.currency || 'Le'} ${viewItem.priceMin.toLocaleString()} - ${viewItem.priceMax.toLocaleString()}`
                  : viewItem.priceMin != null
                  ? `${viewItem.currency || 'Le'} ${viewItem.priceMin.toLocaleString()}`
                  : viewItem.priceMax != null
                  ? `${viewItem.currency || 'Le'} ${viewItem.priceMax.toLocaleString()}`
                  : viewItem.price != null
                  ? `${viewItem.currency || 'Le'} ${viewItem.price.toLocaleString()}`
                  : ''
              }</div>
              {(viewItem.tags && viewItem.tags.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {viewItem.tags.map((t, i) => <Badge key={i} variant="secondary">{t}</Badge>)}
                </div>
              )}
              {(viewItem.imageGalleryDataUrls && viewItem.imageGalleryDataUrls.length > 0) && (
                <div className="grid grid-cols-3 gap-2">
                  {viewItem.imageGalleryDataUrls.map((src, i) => (
                    <img key={i} src={src} className="w-full h-24 object-cover rounded" />
                  ))}
                </div>
              )}
              {viewItem.buttonText && viewItem.buttonLink && (
                <div>
                  <Button onClick={() => {
                    incrementProductClick(viewItem.id);
                    setItems(prev => prev.map(x => x.id === viewItem.id ? { ...x, clickCount: (x.clickCount || 0) + 1 } : x));
                    window.open(viewItem.buttonLink!, '_blank');
                  }}>{viewItem.buttonText}</Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="w-[95vw] max-w-screen-md md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product/Service</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              {/* Live Preview */}
              <div className="rounded-md border p-4 flex items-start gap-3">
                {editFields.imageDataUrl ? (
                  <img src={editFields.imageDataUrl} alt="Product" className="h-10 w-10 rounded object-cover" />
                ) : null}
                <div className="flex-1">
                  <div className="font-semibold">{editFields.name || (editFields.type === 'service' ? 'Service name' : 'Product name')}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{editFields.description || "Product description"}</div>
                  {editFields.tags && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {editFields.tags.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                        <Badge key={i} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm font-medium">{
                    editFields.priceMin && editFields.priceMax
                      ? `${editFields.currency || 'Le'} ${Number(editFields.priceMin).toLocaleString()} - ${Number(editFields.priceMax).toLocaleString()}`
                      : editFields.priceMin
                      ? `${editFields.currency || 'Le'} ${Number(editFields.priceMin).toLocaleString()}`
                      : editFields.priceMax
                      ? `${editFields.currency || 'Le'} ${Number(editFields.priceMax).toLocaleString()}`
                      : ''
                  }</div>
                  {editFields.buttonText && (
                    <Button disabled className="h-8 px-3">{editFields.buttonText}</Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={editFields.type} onValueChange={(v) => setEditFields((f) => ({ ...f, type: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Listings</label>
                <ScrollArea className="h-40 rounded border p-2">
                  <div className="space-y-2 pr-2">
                    {listingOptions.map((opt) => {
                      const checked = (editFields.listingIds || []).includes(opt.id);
                      return (
                        <label key={opt.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              setEditFields((f) => {
                                const prev = Array.isArray(f.listingIds) ? f.listingIds : [];
                                const next = v ? [...prev, opt.id] : prev.filter((id) => id !== opt.id);
                                return { ...f, listingIds: next };
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <p className="text-xs text-muted-foreground">Product name as displayed in the list and dialog.</p>
                <Input value={editFields.name} onChange={(e) => setEditFields((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <p className="text-xs text-muted-foreground">Short description; plain text.</p>
                <Textarea rows={4} value={editFields.description} onChange={(e) => setEditFields((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{editFields.type === 'service' ? 'Rate Min' : 'Price Min'}</label>
                  <p className="text-xs text-muted-foreground">Leave blank if not applicable.</p>
                  <Input type="number" inputMode="decimal" value={editFields.priceMin} onChange={(e) => setEditFields((f) => ({ ...f, priceMin: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{editFields.type === 'service' ? 'Rate Max' : 'Price Max'}</label>
                  <p className="text-xs text-muted-foreground">Optional upper bound.</p>
                  <Input type="number" inputMode="decimal" value={editFields.priceMax} onChange={(e) => setEditFields((f) => ({ ...f, priceMax: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <p className="text-xs text-muted-foreground">Default is Le.</p>
                  <Input value={editFields.currency} onChange={(e) => setEditFields((f) => ({ ...f, currency: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Image (optional, max 1MB)</label>
                <Input type="file" accept="image/*" onChange={handleEditImageChange} />
                {editFields.imageDataUrl && (
                  <img src={editFields.imageDataUrl} alt="Product" className="w-full h-36 object-cover rounded" />
                )}
              </div>
              {/* Gallery removed per request */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <p className="text-xs text-muted-foreground">Separate with commas; helps users find products.</p>
                  <Input value={editFields.tags} onChange={(e) => setEditFields((f) => ({ ...f, tags: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-xs text-muted-foreground">Draft keeps it hidden; Published makes it visible.</p>
                  <Select value={editFields.status} onValueChange={(v) => setEditFields((f) => ({ ...f, status: v as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">CTA Button Text</label>
                  <p className="text-xs text-muted-foreground">Button label shown in the product dialog.</p>
                  <Input value={editFields.buttonText} onChange={(e) => setEditFields((f) => ({ ...f, buttonText: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CTA Link (URL)</label>
                  <p className="text-xs text-muted-foreground">Where the button sends users (https://...).</p>
                  <Input value={editFields.buttonLink} onChange={(e) => setEditFields((f) => ({ ...f, buttonLink: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={() => {
                  const minVal = editFields.priceMin ? Number(editFields.priceMin) : undefined;
                  const maxVal = editFields.priceMax ? Number(editFields.priceMax) : undefined;
                  if (minVal != null && maxVal != null && minVal > maxVal) {
                    alert("Price Min cannot be greater than Price Max.");
                    return;
                  }
                  const ids = Array.isArray(editFields.listingIds) && editFields.listingIds.length ? editFields.listingIds : [editItem.listingId];
                  const titles = ids.map(id => listingOptions.find(o => o.id === id)?.title || "Listing");
                  const primaryId = ids[0] || editItem.listingId;
                  const primaryTitle = titles[0] || editItem.listingTitle;
                  const updated: Product = {
                    ...editItem,
                    listingId: primaryId,
                    listingTitle: primaryTitle,
                    listingIds: ids,
                    listingTitles: titles,
                    type: editFields.type as any,
                    name: editFields.name,
                    description: editFields.description || undefined,
                    priceMin: editFields.priceMin ? Number(editFields.priceMin) : undefined,
                    priceMax: editFields.priceMax ? Number(editFields.priceMax) : undefined,
                    // Legacy single price fallback: keep previous if min not provided
                    price: editFields.priceMin ? Number(editFields.priceMin) : editItem.price,
                    currency: editFields.currency,
                    imageDataUrl: editFields.imageDataUrl,
                    status: editFields.status,
                    tags: editFields.tags.split(',').map(t => t.trim()).filter(Boolean),
                    buttonText: editFields.buttonText || undefined,
                    buttonLink: editFields.buttonLink || undefined,
                    publishedAt: editItem.publishedAt || (editFields.status === 'published' ? new Date().toISOString() : undefined),
                    updatedAt: new Date().toISOString(),
                  };
                  updateProduct(updated);
                  setItems((prev) => prev.map(x => x.id === updated.id ? updated : x));
                  setEditItem(null);
                }}>Save</Button>
                <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
