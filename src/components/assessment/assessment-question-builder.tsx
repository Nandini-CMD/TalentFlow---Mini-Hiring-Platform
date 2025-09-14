import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Settings } from "lucide-react";
import { AssessmentQuestion, QuestionType } from "@/lib/database";

interface AssessmentQuestionBuilderProps {
  question: AssessmentQuestion;
  onUpdate: (question: AssessmentQuestion) => void;
  onDelete: () => void;
}

export function AssessmentQuestionBuilder({ 
  question, 
  onUpdate, 
  onDelete 
}: AssessmentQuestionBuilderProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const questionTypes: { value: QuestionType; label: string; description: string }[] = [
    {
      value: "short-text",
      label: "Short Text",
      description: "Single line text input"
    },
    {
      value: "long-text",
      label: "Long Text", 
      description: "Multi-line text area"
    },
    {
      value: "single-choice",
      label: "Single Choice",
      description: "Radio buttons - select one option"
    },
    {
      value: "multi-choice",
      label: "Multiple Choice",
      description: "Checkboxes - select multiple options"
    },
    {
      value: "numeric",
      label: "Numeric",
      description: "Number input with optional range"
    },
    {
      value: "file-upload",
      label: "File Upload",
      description: "File attachment input"
    }
  ];

  const updateQuestion = (updates: Partial<AssessmentQuestion>) => {
    onUpdate({ ...question, ...updates });
  };

  const addOption = () => {
    const currentOptions = question.options || [];
    updateQuestion({
      options: [...currentOptions, `Option ${currentOptions.length + 1}`]
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    updateQuestion({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(question.options || [])];
    newOptions.splice(index, 1);
    updateQuestion({ options: newOptions });
  };

  const needsOptions = question.type === "single-choice" || question.type === "multi-choice";

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Question Configuration</CardTitle>
            <Badge variant="outline" className="capitalize">
              {question.type.replace("-", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`title-${question.id}`}>Question Title *</Label>
            <Input
              id={`title-${question.id}`}
              value={question.title}
              onChange={(e) => updateQuestion({ title: e.target.value })}
              placeholder="Enter your question..."
            />
          </div>
          
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={question.type}
              onValueChange={(value) => {
                const newQuestion: Partial<AssessmentQuestion> = { type: value as QuestionType };
                
                // Clear options if switching from choice to non-choice type
                if (!["single-choice", "multi-choice"].includes(value) && question.options) {
                  newQuestion.options = undefined;
                }
                
                // Add default options for choice types
                if (["single-choice", "multi-choice"].includes(value) && !question.options) {
                  newQuestion.options = ["Option 1", "Option 2"];
                }
                
                updateQuestion(newQuestion);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={`description-${question.id}`}>Description (optional)</Label>
          <Textarea
            id={`description-${question.id}`}
            value={question.description || ""}
            onChange={(e) => updateQuestion({ description: e.target.value })}
            placeholder="Provide additional context or instructions..."
            rows={2}
          />
        </div>

        {/* Required Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`required-${question.id}`}>Required Question</Label>
          <Switch
            id={`required-${question.id}`}
            checked={question.required}
            onCheckedChange={(checked) => updateQuestion({ required: checked })}
          />
        </div>

        {/* Options for Choice Questions */}
        {needsOptions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button
                type="button"
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
                  <div className="w-6 text-center text-sm text-muted-foreground">
                    {index + 1}.
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(question.options || []).length < 2 && (
                <p className="text-sm text-muted-foreground">
                  Add at least 2 options for choice questions
                </p>
              )}
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h4 className="font-medium text-sm">Validation Rules</h4>
            
            {/* Text Validation */}
            {(question.type === "short-text" || question.type === "long-text") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Length</Label>
                  <Input
                    type="number"
                    value={question.validation?.minLength || ""}
                    onChange={(e) => updateQuestion({
                      validation: {
                        ...question.validation,
                        minLength: parseInt(e.target.value) || undefined
                      }
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Length</Label>
                  <Input
                    type="number"
                    value={question.validation?.maxLength || ""}
                    onChange={(e) => updateQuestion({
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

            {/* Numeric Validation */}
            {question.type === "numeric" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Value</Label>
                  <Input
                    type="number"
                    value={question.validation?.min || ""}
                    onChange={(e) => updateQuestion({
                      validation: {
                        ...question.validation,
                        min: parseFloat(e.target.value) || undefined
                      }
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Value</Label>
                  <Input
                    type="number"
                    value={question.validation?.max || ""}
                    onChange={(e) => updateQuestion({
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
      </CardContent>
    </Card>
  );
}