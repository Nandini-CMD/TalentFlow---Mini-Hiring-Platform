import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileText, Upload } from "lucide-react";
import { Assessment, AssessmentQuestion } from "@/lib/database";

interface AssessmentPreviewProps {
  assessment: Assessment;
  onBack: () => void;
}

export function AssessmentPreview({ assessment, onBack }: AssessmentPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});

  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    const value = responses[question.id];

    switch (question.type) {
      case "short-text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Enter your answer..."
          />
        );

      case "long-text":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Enter your detailed response..."
            rows={4}
          />
        );

      case "single-choice":
        return (
          <RadioGroup
            value={value || ""}
            onValueChange={(newValue) => updateResponse(question.id, newValue)}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multi-choice":
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    updateResponse(question.id, newValues);
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case "numeric":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => updateResponse(question.id, parseFloat(e.target.value))}
            placeholder="Enter a number..."
            min={question.validation?.min}
            max={question.validation?.max}
          />
        );

      case "file-upload":
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, DOCX up to 10MB
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const totalQuestions = assessment.sections.reduce((acc, section) => acc + section.questions.length, 0);
  const requiredQuestions = assessment.sections.reduce((acc, section) => 
    acc + section.questions.filter(q => q.required).length, 0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="hover:bg-accent/50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Builder
        </Button>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Preview Mode
        </Badge>
      </div>

      {/* Assessment Header */}
      <Card className="bg-gradient-card shadow-elegant">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl">{assessment.title}</CardTitle>
          {assessment.description && (
            <CardDescription className="text-base mt-2">
              {assessment.description}
            </CardDescription>
          )}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {totalQuestions} questions
            </div>
            {requiredQuestions > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-red-500">*</span>
                {requiredQuestions} required
              </div>
            )}
            {assessment.settings?.timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {assessment.settings.timeLimit} minutes
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Sections */}
      {assessment.sections.map((section) => (
        <Card key={section.id} className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-xl">{section.title}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {section.questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground min-w-0 mt-1">
                    {index + 1}.
                  </span>
                  <div className="flex-1 space-y-2">
                    <Label className="text-base font-medium leading-6">
                      {question.title}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    {question.description && (
                      <p className="text-sm text-muted-foreground">
                        {question.description}
                      </p>
                    )}
                    <div className="mt-3">
                      {renderQuestion(question)}
                    </div>
                    {/* Validation hints */}
                    {question.validation && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {question.validation.minLength && (
                          <p>Minimum {question.validation.minLength} characters</p>
                        )}
                        {question.validation.maxLength && (
                          <p>Maximum {question.validation.maxLength} characters</p>
                        )}
                        {question.validation.min !== undefined && (
                          <p>Minimum value: {question.validation.min}</p>
                        )}
                        {question.validation.max !== undefined && (
                          <p>Maximum value: {question.validation.max}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Submit Section */}
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Review your answers before submitting. You cannot change them after submission.
          </p>
          <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-spring">
            Submit Assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}