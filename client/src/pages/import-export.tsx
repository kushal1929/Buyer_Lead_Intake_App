import { useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ImportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/leads/export/csv?userId=user1");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "leads.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "Leads exported successfully!",
        });
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export leads",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement CSV import functionality
      toast({
        title: "Info",
        description: "CSV import functionality will be implemented soon",
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto" data-testid="page-import-export">
      <Header
        title="Import/Export"
        description="Import leads from CSV files or export your current leads."
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5" />
                Export Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download all your leads in CSV format for external use or backup.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Includes all lead information and contact details</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Property requirements and budget information</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Lead status and activity timestamps</span>
                </div>
              </div>

              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
                data-testid="button-export-csv"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export to CSV"}
              </Button>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Import Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file to import multiple leads at once.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>CSV format with proper headers required</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Validates data before importing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Skips invalid rows and reports errors</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  data-testid="input-csv-file"
                />
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                data-testid="button-download-template"
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* Import Guidelines */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>CSV Import Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Required Fields</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Name (Full name of the lead)</li>
                    <li>• Email (Valid email address)</li>
                    <li>• Phone (Contact number)</li>
                    <li>• Property Type (residential, commercial, industrial, land)</li>
                    <li>• Min Budget (Numeric value in rupees)</li>
                    <li>• Max Budget (Numeric value in rupees)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Optional Fields</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• BHK Type (for residential properties)</li>
                    <li>• Preferred Location</li>
                    <li>• Priority (low, medium, high)</li>
                    <li>• Source (website, referral, social, advertisement)</li>
                    <li>• Notes (Additional information)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
