import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, FileText, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { candidatesApi } from "@/lib/api";

interface ImportCandidatesDialogProps {
  onImport: (candidates: any[]) => void;
}

export function ImportCandidatesDialog({ onImport }: ImportCandidatesDialogProps) {
  const [open, setOpen] = useState(false);
  const [importType, setImportType] = useState<"csv" | "json" | "manual">("csv");
  const [isLoading, setIsLoading] = useState(false);
  const [manualData, setManualData] = useState("");

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockImportedCandidates = [
        {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 987-6543",
          position: "Software Engineer",
          stage: "applied",
          appliedDate: new Date().toISOString().split('T')[0],
          location: "Remote"
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com", 
          phone: "+1 (555) 876-5432",
          position: "Data Analyst",
          stage: "applied",
          appliedDate: new Date().toISOString().split('T')[0],
          location: "Boston, MA"
        }
      ];

      // Create candidates via API
      const createdCandidates = [];
      for (const candidate of mockImportedCandidates) {
        const created = await candidatesApi.create(candidate);
        createdCandidates.push(created);
      }

      onImport(createdCandidates);
      setOpen(false);
      toast({
        title: "Import Successful",
        description: `${mockImportedCandidates.length} candidates imported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualImport = async () => {
    if (!manualData.trim()) return;
    
    setIsLoading(true);
    try {
      const lines = manualData.trim().split('\n');
      const candidates = lines.map((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        return {
          name: parts[0] || `Candidate ${index + 1}`,
          email: parts[1] || `candidate${index + 1}@example.com`,
          phone: parts[2] || `+1 (555) ${String(Math.random()).slice(2, 9)}`,
          position: parts[3] || "Not specified",
          stage: "applied" as const,
          appliedDate: new Date().toISOString().split('T')[0],
          location: parts[4] || "Not specified"
        };
      });

      const createdCandidates = [];
      for (const candidate of candidates) {
        const created = await candidatesApi.create(candidate);
        createdCandidates.push(created);
      }

      onImport(createdCandidates);
      setOpen(false);
      setManualData("");
      toast({
        title: "Import Successful",
        description: `${candidates.length} candidates imported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Email,Phone,Position,Location\nJohn Doe,john.doe@example.com,+1 (555) 123-4567,Software Engineer,San Francisco CA\nJane Smith,jane.smith@example.com,+1 (555) 987-6543,Product Manager,New York NY";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidate_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:shadow-glow transition-spring">
          <Users className="h-4 w-4 mr-2" />
          Import Candidates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Candidates
          </DialogTitle>
          <DialogDescription>
            Add multiple candidates to your pipeline quickly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={importType === "csv" ? "default" : "outline"}
              onClick={() => setImportType("csv")}
              size="sm"
            >
              CSV File
            </Button>
            <Button
              variant={importType === "json" ? "default" : "outline"}
              onClick={() => setImportType("json")}
              size="sm"
            >
              JSON File
            </Button>
            <Button
              variant={importType === "manual" ? "default" : "outline"}
              onClick={() => setImportType("manual")}
              size="sm"
            >
              Manual Entry
            </Button>
          </div>

          {importType === "csv" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Upload CSV File</Label>
                <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-1" />
                  Template
                </Button>
              </div>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Expected format: Name, Email, Phone, Position, Location
              </p>
            </div>
          )}

          {importType === "json" && (
            <div className="space-y-3">
              <Label>Upload JSON File</Label>
              <Input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                JSON array with candidate objects
              </p>
            </div>
          )}

          {importType === "manual" && (
            <div className="space-y-3">
              <Label>Candidate Data</Label>
              <Textarea
                placeholder="Enter candidate data, one per line:
John Doe, john@example.com, +1-555-1234, Software Engineer, San Francisco
Jane Smith, jane@example.com, +1-555-5678, Product Manager, New York"
                value={manualData}
                onChange={(e) => setManualData(e.target.value)}
                rows={6}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Format: Name, Email, Phone, Position, Location (one per line)
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          {importType === "manual" && (
            <Button onClick={handleManualImport} disabled={isLoading || !manualData.trim()}>
              {isLoading ? "Importing..." : "Import Candidates"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}