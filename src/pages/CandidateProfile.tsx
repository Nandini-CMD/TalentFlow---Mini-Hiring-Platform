import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, FileText, MessageSquare, User, Edit, Send } from "lucide-react";
import { Candidate, CandidateNote, CandidateTimelineEvent } from "@/lib/database";
import { candidatesApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface TimelineItemProps {
  event: CandidateTimelineEvent;
}

function TimelineItem({ event }: TimelineItemProps) {
  const getIcon = () => {
    switch (event.type) {
      case "stage_change":
        return <User className="h-4 w-4" />;
      case "note_added":
        return <MessageSquare className="h-4 w-4" />;
      case "interview_scheduled":
        return <Calendar className="h-4 w-4" />;
      case "email_sent":
        return <Mail className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getColor = () => {
    switch (event.type) {
      case "stage_change":
        return "bg-blue-500";
      case "note_added":
        return "bg-green-500";
      case "interview_scheduled":
        return "bg-purple-500";
      case "email_sent":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex gap-4">
      <div className={`w-8 h-8 rounded-full ${getColor()} flex items-center justify-center text-white flex-shrink-0`}>
        {getIcon()}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{event.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{event.author}</span>
          <span>•</span>
          <span>{new Date(event.timestamp).toLocaleString()}</span>
        </div>
        {event.metadata && (
          <div className="text-xs bg-muted p-2 rounded">
            {JSON.stringify(event.metadata, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}

interface NoteItemProps {
  note: CandidateNote;
}

function NoteItem({ note }: NoteItemProps) {
  const renderContent = (content: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) return content;
    
    let renderedContent = content;
    mentions.forEach(mention => {
      const mentionRegex = new RegExp(`@${mention}`, 'g');
      renderedContent = renderedContent.replace(
        mentionRegex,
        `<span class="bg-blue-100 text-blue-800 px-1 rounded">@${mention}</span>`
      );
    });
    
    return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />;
  };

  return (
    <Card className="bg-gradient-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-primary text-white text-xs">
              {note.author.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{note.author}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="text-sm">
              {renderContent(note.content, note.mentions)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Mock local users for @mentions
  const localUsers = ["John Smith", "Sarah Johnson", "Mike Chen", "Emma Davis"];

  useEffect(() => {
    if (id) {
      loadCandidate();
    }
  }, [id]);

  const loadCandidate = async () => {
    try {
      setIsLoading(true);
      const candidateData = await candidatesApi.getById(Number(id));
      
      // Add mock timeline and notes if not present
      const mockTimeline: CandidateTimelineEvent[] = [
        {
          id: "1",
          type: "stage_change",
          description: "Application received",
          timestamp: candidateData.appliedDate + "T09:00:00Z",
          author: "System"
        },
        {
          id: "2", 
          type: "note_added",
          description: "Initial screening completed",
          timestamp: candidateData.appliedDate + "T14:30:00Z",
          author: "Sarah Johnson"
        },
        {
          id: "3",
          type: "stage_change", 
          description: "Moved to Technical Interview stage",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          author: "John Smith"
        }
      ];

      const mockNotes: CandidateNote[] = [
        {
          id: "1",
          content: "Great technical background. @John Smith please schedule technical interview.",
          author: "Sarah Johnson",
          createdAt: candidateData.appliedDate + "T14:30:00Z",
          mentions: ["John Smith"]
        },
        {
          id: "2",
          content: "Candidate responded quickly to our initial email. Very professional communication style.",
          author: "Mike Chen", 
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          mentions: []
        }
      ];

      setCandidate({
        ...candidateData,
        timeline: candidateData.timeline || mockTimeline,
        notes: candidateData.notes || mockNotes
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load candidate profile",
        variant: "destructive",
      });
      navigate("/candidates");
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !candidate) return;
    
    setIsAddingNote(true);
    try {
      // Extract mentions from the note
      const mentionRegex = /@(\w+\s?\w*)/g;
      const mentions: string[] = [];
      let match;
      while ((match = mentionRegex.exec(newNote)) !== null) {
        const mention = match[1];
        if (localUsers.some(user => user.toLowerCase().includes(mention.toLowerCase()))) {
          mentions.push(mention);
        }
      }

      const note: CandidateNote = {
        id: Date.now().toString(),
        content: newNote,
        author: "Current User", // In real app, this would be the logged-in user
        createdAt: new Date().toISOString(),
        mentions
      };

      const timelineEvent: CandidateTimelineEvent = {
        id: Date.now().toString(),
        type: "note_added",
        description: `Added note: ${newNote.slice(0, 50)}${newNote.length > 50 ? '...' : ''}`,
        timestamp: new Date().toISOString(),
        author: "Current User"
      };

      const updatedCandidate = {
        ...candidate,
        notes: [note, ...(candidate.notes || [])],
        timeline: [timelineEvent, ...(candidate.timeline || [])]
      };

      setCandidate(updatedCandidate);
      setNewNote("");
      
      toast({
        title: "Note Added",
        description: "Your note has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "applied": return "bg-blue-100 text-blue-800";
      case "screened": return "bg-yellow-100 text-yellow-800";
      case "technical": return "bg-purple-100 text-purple-800";
      case "offer": return "bg-orange-100 text-orange-800";
      case "hired": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-pulse space-y-2">
            <div className="h-12 w-12 bg-muted rounded-full mx-auto"></div>
            <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Candidate not found</h1>
        <Button onClick={() => navigate("/candidates")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/candidates")}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Candidate Profile</h1>
          <p className="text-muted-foreground">Detailed candidate information and timeline</p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-glow">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Candidate Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback className="bg-gradient-primary text-white text-xl">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{candidate.name}</CardTitle>
              <CardDescription className="text-lg font-medium">
                {candidate.position}
              </CardDescription>
              <Badge className={`${getStageColor(candidate.stage)} capitalize w-fit mx-auto`}>
                {candidate.stage}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{candidate.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{candidate.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Applied {candidate.appliedDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-lg">Add Note</CardTitle>
              <CardDescription>
                Use @mention to notify team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Write a note... Use @name to mention team members"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex flex-wrap gap-1">
                {localUsers.map(user => (
                  <Button
                    key={user}
                    variant="outline"
                    size="sm"
                    onClick={() => setNewNote(prev => prev + `@${user} `)}
                    className="h-7 text-xs"
                  >
                    @{user}
                  </Button>
                ))}
              </div>
              <Button 
                onClick={addNote} 
                disabled={!newNote.trim() || isAddingNote}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {isAddingNote ? "Adding..." : "Add Note"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline and Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
              <CardDescription>
                Chronological history of candidate interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {candidate.timeline?.sort((a, b) => 
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                ).map((event) => (
                  <TimelineItem key={event.id} event={event} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes & Comments
              </CardTitle>
              <CardDescription>
                Team notes and observations about this candidate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidate.notes?.sort((a, b) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ).map((note) => (
                  <NoteItem key={note.id} note={note} />
                ))}
                {(!candidate.notes || candidate.notes.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notes yet. Add the first note above.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}