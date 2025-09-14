import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MoreVertical, Mail, Phone, Calendar, MapPin, Grid, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImportCandidatesDialog } from "@/components/candidates/import-candidates-dialog";
import { CandidateKanban } from "@/components/candidates/candidate-kanban";
import { candidatesApi } from "@/lib/api";
import { Candidate } from "@/lib/database";
import { toast } from "@/hooks/use-toast";

// Using Candidate interface from database.ts


export default function Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setIsLoading(true);
      const response = await candidatesApi.getAll();
      setCandidates(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (importedCandidates: Candidate[]) => {
    setCandidates(prev => [...importedCandidates, ...prev]);
  };

  const handleCandidateClick = (candidate: Candidate) => {
    navigate(`/candidates/${candidate.id}`);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || candidate.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "screened":
        return "bg-yellow-100 text-yellow-800";
      case "technical":
        return "bg-purple-100 text-purple-800";
      case "offer":
        return "bg-orange-100 text-orange-800";
      case "hired":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stageOrder = ["applied", "screened", "technical", "offer", "hired", "rejected"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Candidates</h1>
          <p className="text-muted-foreground">
            Track and manage candidate applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "kanban")}>
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <ImportCandidatesDialog onImport={handleImport} />
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={stageFilter === "all" ? "default" : "outline"}
                onClick={() => setStageFilter("all")}
                size="sm"
              >
                All
              </Button>
              {stageOrder.map((stage) => (
                <Button
                  key={stage}
                  variant={stageFilter === stage ? "default" : "outline"}
                  onClick={() => setStageFilter(stage)}
                  size="sm"
                  className="capitalize"
                >
                  {stage}
                </Button>
              ))}
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === "kanban" ? (
        <CandidateKanban
          candidates={filteredCandidates}
          onCandidatesUpdate={setCandidates}
          onCandidateClick={handleCandidateClick}
        />
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-gradient-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 animate-pulse">
                      <div className="h-12 w-12 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <Card 
                key={candidate.id} 
                className="hover:shadow-elegant transition-spring cursor-pointer group bg-gradient-card"
                onClick={() => handleCandidateClick(candidate)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={candidate.avatar} alt={candidate.name} />
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-smooth">
                          {candidate.name}
                        </h3>
                        <p className="text-muted-foreground">{candidate.position}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {candidate.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {candidate.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {candidate.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={`${getStageColor(candidate.stage)} capitalize`}>
                          {candidate.stage}
                        </Badge>
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Applied {candidate.appliedDate}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleCandidateClick(candidate);
                          }}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Move to Next Stage</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Reject Candidate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {filteredCandidates.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="h-12 w-12 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="mb-2">No candidates found</CardTitle>
            <CardDescription>
              Try adjusting your search criteria or check back later for new applications.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}