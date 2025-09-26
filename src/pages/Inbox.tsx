import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send, Star, MoreVertical, Archive, Trash2, Smile } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "react-router-dom";
import {
  getThreadsForCurrentUser,
  createOrGetThreadForListing,
  fetchMessages,
  sendMessage as sendThreadMessage,
  subscribeToThread,
  getCurrentUserId,
  type ThreadSummary,
  type ChatMessage,
} from "@/lib/messaging";
import * as Popover from "@radix-ui/react-popover";
// Emoji picker
// npm i @emoji-mart/react @emoji-mart/data
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface Message {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  listing?: string;
  type: 'inquiry' | 'booking' | 'review' | 'general';
}

interface Conversation {
  id: string;
  messages: Array<{
    id: string;
    content: string;
    timestamp: string;
    isOutgoing: boolean;
  }>;
}

export default function Inbox() {
  const location = useLocation() as { state?: { listingId?: string } };
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [replyContent, setReplyContent] = useState("");
  // Realtime-backed state
  const [userId, setUserId] = useState<string | null>(null);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [useMock, setUseMock] = useState(true);
  const [loading, setLoading] = useState(false);
  // Emoji state
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [cursorPos, setCursorPos] = useState(0);

  const mockMessages: Message[] = [
    {
      id: "1",
      sender: { name: "Sarah Johnson", email: "sarah@email.com", avatar: "SJ" },
      subject: "Booking Inquiry - Wedding Photography",
      preview: "Hi! I'm interested in booking your photography services for my wedding on June 15th...",
      timestamp: "2 hours ago",
      isRead: false,
      isStarred: true,
      listing: "Johnson Photography Studio",
      type: "booking"
    },
    {
      id: "2",
      sender: { name: "Mike Chen", email: "mike@email.com", avatar: "MC" },
      subject: "Question about Menu Items",
      preview: "Do you have vegetarian options available? I'm planning to visit this weekend...",
      timestamp: "5 hours ago",
      isRead: true,
      isStarred: false,
      listing: "Chen's Asian Bistro",
      type: "inquiry"
    },
    {
      id: "3",
      sender: { name: "Emma Wilson", email: "emma@email.com", avatar: "EW" },
      subject: "Great Service!",
      preview: "Just wanted to say thank you for the excellent service yesterday. The team was...",
      timestamp: "1 day ago",
      isRead: true,
      isStarred: true,
      listing: "Wilson Auto Repair",
      type: "review"
    }
  ];

  const mockConversation: Conversation = {
    id: "1",
    messages: [
      {
        id: "1",
        content: "Hi! I'm interested in booking your photography services for my wedding on June 15th. Do you have availability? What packages do you offer?",
        timestamp: "2 hours ago",
        isOutgoing: false
      },
      {
        id: "2",
        content: "Hi Sarah! Congratulations on your upcoming wedding! Yes, I have availability on June 15th. I offer three main packages: Basic ($800), Premium ($1200), and Deluxe ($1800). Would you like to schedule a consultation?",
        timestamp: "1 hour ago",
        isOutgoing: true
      }
    ]
  };

  const getTypeColor = (type: Message['type']) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'inquiry': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.sender.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'unread') return !message.isRead && matchesSearch;
    if (filter === 'starred') return message.isStarred && matchesSearch;
    return matchesSearch;
  });

  const filteredThreads = threads.filter(t => {
    const title = (t.listing_title ?? 'Conversation').toLowerCase();
    const preview = (t.last_message_preview ?? '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || preview.includes(q);
  });

  // Boot: load user, threads, and optionally open/create thread from ListingView
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    (async () => {
      setLoading(true);
      const uid = await getCurrentUserId();
      setUserId(uid);

      // Attempt to load threads; if we can, switch off mock mode
      const t = await getThreadsForCurrentUser();
      setThreads(t);

      let initialThreadId: string | null = null;
      const listingId = location.state?.listingId;
      if (listingId) {
        initialThreadId = await createOrGetThreadForListing(listingId);
      } else if (t.length) {
        initialThreadId = t[0].thread_id;
      }

      if (initialThreadId) {
        setUseMock(false);
        setSelectedThreadId(initialThreadId);
        const msgs = await fetchMessages(initialThreadId);
        setMessages(msgs);
        unsubscribe = subscribeToThread(initialThreadId, (m) => {
          setMessages(prev => [...prev, m]);
        });
      } else {
        setUseMock(true);
      }
      setLoading(false);
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // We only want to run this on first mount for initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When user selects a thread, fetch messages and subscribe
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    if (!selectedThreadId || useMock) return;
    (async () => {
      setLoading(true);
      const msgs = await fetchMessages(selectedThreadId);
      setMessages(msgs);
      unsubscribe = subscribeToThread(selectedThreadId, (m) => {
        setMessages(prev => [...prev, m]);
      });
      setLoading(false);
    })();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [selectedThreadId, useMock]);

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    if (useMock) {
      console.log("Sending reply (mock):", replyContent);
      setReplyContent("");
      return;
    }
    if (!selectedThreadId) return;
    const ok = await sendThreadMessage(selectedThreadId, replyContent.trim());
    if (ok) setReplyContent("");
  };

  const insertEmoji = (emoji: any) => {
    const symbol = emoji?.native || emoji?.skins?.[0]?.native || "";
    if (!symbol) return;
    const el = textareaRef.current;
    if (!el) {
      setReplyContent((prev) => prev + symbol);
      return;
    }
    const start = el.selectionStart ?? cursorPos;
    const end = el.selectionEnd ?? cursorPos;
    setReplyContent((prev) => prev.slice(0, start) + symbol + prev.slice(end));
    // restore focus and caret after update
    requestAnimationFrame(() => {
      el.focus();
      const newPos = start + symbol.length;
      el.setSelectionRange(newPos, newPos);
    });
    setShowEmoji(false);
  };

  return (
    <div className="h-screen bg-background">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="p-4 border-b">
            <div className="flex gap-2">
              {(['all', 'unread', 'starred'] as const).map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {useMock ? (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-muted' : ''
                  } ${!message.isRead ? 'border-l-4 border-l-primary' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>{message.sender.avatar}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium truncate ${!message.isRead ? 'font-semibold' : ''}`}>
                          {message.sender.name}
                        </p>
                        <div className="flex items-center gap-1">
                          {message.isStarred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={getTypeColor(message.type)}>
                          {message.type}
                        </Badge>
                        {message.listing && (
                          <span className="text-xs text-muted-foreground truncate">{message.listing}</span>
                        )}
                      </div>
                      
                      <p className={`text-sm text-muted-foreground truncate ${!message.isRead ? 'font-medium' : ''}`}>
                        {message.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {message.preview}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredThreads.map((t) => (
                <div
                  key={t.thread_id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedThreadId === t.thread_id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedThreadId(t.thread_id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{(t.listing_title ?? 'C')[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium truncate`}>
                          {t.listing_title ?? 'Conversation'}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">{t.last_message_at ? new Date(t.last_message_at).toLocaleString() : ''}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {t.last_message_preview ?? ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {useMock ? (
            selectedMessage ? (
            <>
              <div className="p-4 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedMessage.sender.avatar} />
                      <AvatarFallback>{selectedMessage.sender.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">{selectedMessage.subject}</h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.sender.name} &lt;{selectedMessage.sender.email}&gt;
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        {selectedMessage.isStarred ? 'Unstar' : 'Star'}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {mockConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOutgoing ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-2xl p-4 rounded-lg ${
                          msg.isOutgoing
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-2 ${
                          msg.isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t bg-card">
                <div className="flex gap-3 items-end">
                  <div className="relative flex-1">
                    <Textarea
                      ref={textareaRef}
                      placeholder="Type your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onClick={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart || 0)}
                      onKeyUp={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart || 0)}
                      onSelect={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart || 0)}
                      className="min-h-20 resize-none pr-10"
                    />
                    <Popover.Root open={showEmoji} onOpenChange={setShowEmoji}>
                      <Popover.Trigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-2 right-2 h-7 w-7"
                          aria-label="Insert emoji"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content sideOffset={8} align="end" className="z-50">
                        <div className="bg-popover text-popover-foreground rounded-md shadow-md">
                          <Picker data={data} onEmojiSelect={insertEmoji} theme="light" previewPosition="none" />
                        </div>
                      </Popover.Content>
                    </Popover.Root>
                  </div>
                  <Button onClick={handleSendReply} disabled={!replyContent.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a message</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the sidebar to view messages
                  </p>
                </div>
              </div>
            )
          ) : (
            selectedThreadId ? (
              <>
                <div className="p-4 border-b bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>💬</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-semibold">Conversation</h2>
                        <p className="text-sm text-muted-foreground">
                          {threads.find(t => t.thread_id === selectedThreadId)?.listing_title ?? 'Direct chat'}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-2xl p-4 rounded-lg ${
                            msg.sender_id === userId
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.body}</p>
                          <p className={`text-xs mt-2 ${
                            msg.sender_id === userId ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t bg-card">
                  <div className="flex gap-3 items-end">
                    <div className="relative flex-1">
                      <Textarea
                        ref={textareaRef}
                        placeholder="Type your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onClick={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart || 0)}
                        onKeyUp={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart || 0)}
                        onSelect={(e) => setCursorPos((e.target as HTMLTextAreaElement).selectionStart || 0)}
                        className="min-h-20 resize-none pr-10"
                        disabled={loading}
                      />
                      <Popover.Root open={showEmoji} onOpenChange={setShowEmoji}>
                        <Popover.Trigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-2 right-2 h-7 w-7"
                            aria-label="Insert emoji"
                            disabled={loading}
                          >
                            <Smile className="h-4 w-4" />
                          </Button>
                        </Popover.Trigger>
                        <Popover.Content sideOffset={8} align="end" className="z-50">
                          <div className="bg-popover text-popover-foreground rounded-md shadow-md">
                            <Picker data={data} onEmojiSelect={insertEmoji} theme="light" previewPosition="none" />
                          </div>
                        </Popover.Content>
                      </Popover.Root>
                    </div>
                    <Button onClick={handleSendReply} disabled={!replyContent.trim() || loading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground">
                    Start a conversation from a listing to begin messaging.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}