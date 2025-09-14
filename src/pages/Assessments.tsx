import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, ClipboardList, Users, Clock, Settings, Edit } from "lucide-react";
import { AssessmentBuilder } from "@/components/assessment/assessment-builder";
import { assessmentsApi } from "@/lib/api";
import { Assessment } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

export default function Assessments() {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "archived">("all");

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await assessmentsApi.getAll();
      setAssessments(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load assessments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssessment = async (assessmentData: Partial<Assessment>) => {
    try {
      if (editingAssessment?.id) {
        await assessmentsApi.update(editingAssessment.id, assessmentData);
      } else {
        await assessmentsApi.create(assessmentData);
      }
      
      await loadAssessments();
      setShowBuilder(false);
      setEditingAssessment(undefined);
      
      toast({
        title: "Success",
        description: `Assessment ${editingAssessment ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save assessment",
        variant: "destructive",
      });
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "published":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (showBuilder) {
    return (
      <AssessmentBuilder
        assessment={editingAssessment}
        onSave={handleSaveAssessment}
        onCancel={() => {
          setShowBuilder(false);
          setEditingAssessment(undefined);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">TalentFlow Assessments</h1>
          <p className="text-muted-foreground">Create and manage candidate assessments with live preview</p>
        </div>
        <Button 
          onClick={() => setShowBuilder(true)}
          className="bg-gradient-primary hover:shadow-glow transition-spring"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "draft" ? "default" : "outline"}
                onClick={() => setStatusFilter("draft")}
                size="sm"
              >
                Draft
              </Button>
              <Button
                variant={statusFilter === "published" ? "default" : "outline"}
                onClick={() => setStatusFilter("published")}
                size="sm"
              >
                Published
              </Button>
              <Button
                variant={statusFilter === "archived" ? "default" : "outline"}
                onClick={() => setStatusFilter("archived")}
                size="sm"
              >
                Archived
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-elegant transition-spring cursor-pointer group bg-gradient-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-smooth">
                    {assessment.title}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {assessment.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingAssessment(assessment);
                        setShowBuilder(true);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="h-4 w-4 mr-2" />
                      View Responses
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Badge className={`${getStatusColor(assessment.status)} capitalize w-fit`}>
                {assessment.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ClipboardList className="h-3 w-3" />
                  {assessment.sections?.reduce((acc, section) => acc + section.questions.length, 0) || 0} questions
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {assessment.settings?.timeLimit || 30} min
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {assessment.responses || 0} responses
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated {new Date(assessment.lastUpdated).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-border/50">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setEditingAssessment(assessment);
                    setShowBuilder(true);
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                  View Results
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssessments.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="h-12 w-12 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="mb-2">No assessments found</CardTitle>
            <CardDescription>
              Try adjusting your search criteria or create your first assessment.
            </CardDescription>
            <Button 
              className="mt-4 bg-gradient-primary hover:shadow-glow transition-spring"
              onClick={() => setShowBuilder(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}