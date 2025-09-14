import { useState, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Save, Eye, Settings, Trash2, GripVertical } from "lucide-react";
import { Assessment, AssessmentSection, AssessmentQuestion, QuestionType } from "@/lib/database";
import { AssessmentQuestionBuilder } from "./assessment-question-builder";
import { AssessmentPreview } from "./assessment-preview";
import { SortableQuestionItem } from "./sortable-question-item";
import { useToast } from "@/hooks/use-toast";

interface AssessmentBuilderProps {
  assessment?: Assessment;
  onSave: (assessment: Partial<Assessment>) => void;
  onCancel: () => void;
}

export function AssessmentBuilder({ assessment, onSave, onCancel }: AssessmentBuilderProps) {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [title, setTitle] = useState(assessment?.title || "");
  const [description, setDescription] = useState(assessment?.description || "");
  const [sections, setSections] = useState<AssessmentSection[]>(
    assessment?.sections || [
      {
        id: "section-1",
        title: "Section 1",
        description: "",
        questions: [],
        order: 1
      }
    ]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addSection = useCallback(() => {
    const newSection: AssessmentSection = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: "",
      questions: [],
      order: sections.length + 1
    };
    setSections(prev => [...prev, newSection]);
  }, [sections.length]);

  const updateSection = useCallback((sectionId: string, updates: Partial<AssessmentSection>) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    );
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
  }, []);

  const addQuestion = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newQuestion: AssessmentQuestion = {
      id: `question-${Date.now()}`,
      type: "short-text",
      title: "New Question",
      required: false,
      order: section.questions.length + 1
    };

    updateSection(sectionId, {
      questions: [...section.questions, newQuestion]
    });
  }, [sections, updateSection]);

  const updateQuestion = useCallback((sectionId: string, questionId: string, updates: Partial<AssessmentQuestion>) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedQuestions = section.questions.map(question =>
      question.id === questionId ? { ...question, ...updates } : question
    );

    updateSection(sectionId, { questions: updatedQuestions });
  }, [sections, updateSection]);

  const deleteQuestion = useCallback((sectionId: string, questionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedQuestions = section.questions.filter(question => question.id !== questionId);
    updateSection(sectionId, { questions: updatedQuestions });
  }, [sections, updateSection]);

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const [activeSectionId, activeQuestionId] = active.id.split('-question-');
    const [overSectionId, overQuestionId] = over.id.split('-question-');
    
    if (activeSectionId !== overSectionId) return; // Only allow reordering within same section
    
    const section = sections.find(s => s.id === activeSectionId);
    if (!section) return;
    
    const oldIndex = section.questions.findIndex(q => q.id === activeQuestionId);
    const newIndex = section.questions.findIndex(q => q.id === overQuestionId);
    
    if (oldIndex === newIndex) return;
    
    const newQuestions = arrayMove(section.questions, oldIndex, newIndex);
    updateSection(activeSectionId, { questions: newQuestions });
  }, [sections, updateSection]);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Assessment title is required",
        variant: "destructive",
      });
      return;
    }

    const assessmentData: Partial<Assessment> = {
      title: title.trim(),
      description: description.trim(),
      sections,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onSave(assessmentData);
    
    toast({
      title: "Success",
      description: "Assessment saved successfully",
    });
  }, [title, description, sections, onSave, toast]);

  if (showPreview) {
    return (
      <AssessmentPreview
        assessment={{ title, description, sections } as Assessment}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessment Builder</h1>
          <p className="text-muted-foreground">
            Create and configure assessment questions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary hover:shadow-glow transition-spring">
            <Save className="h-4 w-4 mr-2" />
            Save Assessment
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Set up the assessment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Assessment Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter assessment title..."
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this assessment evaluates..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sections & Questions</h2>
          <Button onClick={addSection} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {sections.map((section, sectionIndex) => (
          <Card key={section.id} className="bg-gradient-card shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="text-lg font-semibold"
                    placeholder="Section title..."
                  />
                  <Textarea
                    value={section.description}
                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    placeholder="Section description (optional)..."
                    rows={2}
                  />
                </div>
                <div className="ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSection(section.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Questions */}
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={section.questions.map(q => `${section.id}-question-${q.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {section.questions.map((question, questionIndex) => (
                      <SortableQuestionItem
                        key={question.id}
                        id={`${section.id}-question-${question.id}`}
                        question={question}
                        onUpdate={(updates) => updateQuestion(section.id, question.id, updates)}
                        onDelete={() => deleteQuestion(section.id, question.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                {/* Add Question */}
                <Button
                  variant="outline"
                  onClick={() => addQuestion(section.id)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}