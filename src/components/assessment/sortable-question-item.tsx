import { useState } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { AssessmentQuestion, QuestionType } from "@/lib/database";

interface SortableQuestionItemProps {
  id: string;
  question: AssessmentQuestion;
  onUpdate: (updates: Partial<AssessmentQuestion>) => void;
  onDelete: () => void;
}

export function SortableQuestionItem({ id, question, onUpdate, onDelete }: SortableQuestionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const questionTypes: { value: QuestionType; label: string }[] = [
    { value: "short-text", label: "Short Text" },
    { value: "long-text", label: "Long Text" },
    { value: "single-choice", label: "Single Choice" },
    { value: "multi-choice", label: "Multiple Choice" },
    { value: "numeric", label: "Numeric" },
    { value: "file-upload", label: "File Upload" }
  ];

  const addOption = () => {
    const currentOptions = question.options || [];
    onUpdate({
      options: [...currentOptions, `Option ${currentOptions.length + 1}`]
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(question.options || [])];
    newOptions.splice(index, 1);
    onUpdate({ options: newOptions });
  };

  const needsOptions = question.type === "single-choice" || question.type === "multi-choice";

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="bg-gradient-card shadow-sm border-l-4 border-l-primary/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <div 
              {...attributes}
              {...listeners}
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-accent cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Question Content */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {question.type.replace("-", " ")}
                  </Badge>
                  {question.required && (
                    <Badge variant="secondary">Required</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Question Title</Label>
                  <Input
                    value={question.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="Enter question..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) => onUpdate({ type: value as QuestionType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Expanded Settings */}
              {isExpanded && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={question.description || ""}
                      onChange={(e) => onUpdate({ description: e.target.value })}
                      placeholder="Additional context or instructions..."
                      rows={2}
                    />
                  </div>

                  {/* Required Toggle */}
                  <div className="flex items-center justify-between">
                    <Label>Required Question</Label>
                    <Switch
                      checked={question.required}
                      onCheckedChange={(checked) => onUpdate({ required: checked })}
                    />
                  </div>

                  {/* Options for Choice Questions */}
                  {needsOptions && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Answer Options</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(question.options || []).map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validation Settings */}
                  {(question.type === "short-text" || question.type === "long-text") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Min Length</Label>
                        <Input
                          type="number"
                          value={question.validation?.minLength || ""}
                          onChange={(e) => onUpdate({
                            validation: {
                              ...question.validation,
                              minLength: parseInt(e.target.value) || undefined
                            }
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Length</Label>
                        <Input
                          type="number"
                          value={question.validation?.maxLength || ""}
                          onChange={(e) => onUpdate({
                            validation: {
                              ...question.validation,
                              maxLength: parseInt(e.target.value) || undefined
                            }
                          })}
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  )}

                  {question.type === "numeric" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Min Value</Label>
                        <Input
                          type="number"
                          value={question.validation?.min || ""}
                          onChange={(e) => onUpdate({
                            validation: {
                              ...question.validation,
                              min: parseFloat(e.target.value) || undefined
                            }
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Value</Label>
                        <Input
                          type="number"
                          value={question.validation?.max || ""}
                          onChange={(e) => onUpdate({
                            validation: {
                              ...question.validation,
                              max: parseFloat(e.target.value) || undefined
                            }
                          })}
                          placeholder="100"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}