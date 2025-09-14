import { useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Plus } from "lucide-react";
import { Candidate } from "@/lib/database";
import { candidatesApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface KanbanColumn {
  id: string;
  title: string;
  stage: Candidate["stage"];
  color: string;
  candidates: Candidate[];
}

interface CandidateKanbanProps {
  candidates: Candidate[];
  onCandidatesUpdate: (candidates: Candidate[]) => void;
  onCandidateClick: (candidate: Candidate) => void;
}

function KanbanCard({ candidate, onCardClick }: { candidate: Candidate; onCardClick: (candidate: Candidate) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card
        className="mb-3 hover:shadow-elegant transition-spring bg-gradient-card cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onCardClick(candidate);
        }}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback className="bg-gradient-primary text-white text-xs">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{candidate.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{candidate.position}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span className="truncate">{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Applied {candidate.appliedDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DroppableColumn({ column, onCandidateClick }: { column: KanbanColumn; onCandidateClick: (candidate: Candidate) => void }) {
  return (
    <div className="flex-1 min-w-[280px]">
      <Card className="h-full bg-gradient-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
              {column.title}
              <Badge variant="secondary" className="ml-2">
                {column.candidates.length}
              </Badge>
            </CardTitle>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <SortableContext items={column.candidates.map(c => c.id!)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 min-h-[200px]">
              {column.candidates.map((candidate) => (
                <KanbanCard
                  key={candidate.id}
                  candidate={candidate}
                  onCardClick={onCandidateClick}
                />
              ))}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

export function CandidateKanban({ candidates, onCandidatesUpdate, onCandidateClick }: CandidateKanbanProps) {
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns: KanbanColumn[] = [
    {
      id: "applied",
      title: "Applied",
      stage: "applied",
      color: "bg-blue-500",
      candidates: candidates.filter(c => c.stage === "applied")
    },
    {
      id: "screened",
      title: "Screened",
      stage: "screened",
      color: "bg-yellow-500",
      candidates: candidates.filter(c => c.stage === "screened")
    },
    {
      id: "technical",
      title: "Technical Interview",
      stage: "technical",
      color: "bg-purple-500",
      candidates: candidates.filter(c => c.stage === "technical")
    },
    {
      id: "offer",
      title: "Offer",
      stage: "offer",
      color: "bg-orange-500",
      candidates: candidates.filter(c => c.stage === "offer")
    },
    {
      id: "hired",
      title: "Hired",
      stage: "hired",
      color: "bg-green-500",
      candidates: candidates.filter(c => c.stage === "hired")
    },
    {
      id: "rejected",
      title: "Rejected",
      stage: "rejected",
      color: "bg-red-500",
      candidates: candidates.filter(c => c.stage === "rejected")
    }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const candidate = candidates.find(c => c.id === event.active.id);
    setActiveCandidate(candidate || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const candidateId = active.id as number;
    const newStage = over.id as Candidate["stage"];
    
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate || candidate.stage === newStage) return;

    try {
      // Optimistic update
      const updatedCandidates = candidates.map(c =>
        c.id === candidateId ? { ...c, stage: newStage } : c
      );
      onCandidatesUpdate(updatedCandidates);

      // API call
      await candidatesApi.updateStage(candidateId, newStage);
      
      toast({
        title: "Stage Updated",
        description: `${candidate.name} moved to ${newStage}`,
      });
    } catch (error) {
      // Rollback on error
      onCandidatesUpdate(candidates);
      toast({
        title: "Update Failed",
        description: "Failed to update candidate stage. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              onCandidateClick={onCandidateClick}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeCandidate ? (
            <div className="opacity-90 rotate-3 scale-105">
              <KanbanCard candidate={activeCandidate} onCardClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}