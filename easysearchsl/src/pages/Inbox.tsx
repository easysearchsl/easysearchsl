import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send, Star, MoreVertical, Archive, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [replyContent, setReplyContent] = useState("");

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

  const handleSendReply = () => {
    if (replyContent.trim()) {
      // In a real app, this would send the message
      console.log("Sending reply:", replyContent);
      setReplyContent("");
    }
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
            {filteredMessages.map((message) => (
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
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
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
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-1 min-h-20 resize-none"
                  />
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
          )}
        </div>
      </div>
    </div>
  );
}