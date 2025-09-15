import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import { PropertyType, LeadStatus, LeadPriority, LeadSource, BHKType } from "@shared/schema";

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  filters: SearchFilters;
}

export interface SearchFilters {
  propertyType?: string;
  status?: string;
  priority?: string;
  source?: string;
  bhkType?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  bhkOnly?: boolean;
  recentActivity?: boolean;
}

export default function AdvancedSearch({ onFiltersChange, filters }: AdvancedSearchProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (value === "" || value === undefined) {
      delete newFilters[key];
    }
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Leads</h3>
          <p className="text-sm text-muted-foreground">Latest buyer leads in your pipeline</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            data-testid="button-toggle-filters"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {isVisible && (
        <Card data-testid="card-advanced-search">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="property-type" className="block text-sm font-medium text-foreground mb-2">
                  Property Type
                </Label>
                <Select 
                  value={filters.propertyType || ""} 
                  onValueChange={(value) => handleFilterChange("propertyType", value)}
                >
                  <SelectTrigger data-testid="select-property-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value={PropertyType.RESIDENTIAL}>Residential</SelectItem>
                    <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
                    <SelectItem value={PropertyType.INDUSTRIAL}>Industrial</SelectItem>
                    <SelectItem value={PropertyType.LAND}>Land/Plot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget-range" className="block text-sm font-medium text-foreground mb-2">
                  Budget Range
                </Label>
                <Select 
                  value={filters.minBudget ? `${filters.minBudget}-${filters.maxBudget}` : ""} 
                  onValueChange={(value) => {
                    if (value === "") {
                      handleFilterChange("minBudget", undefined);
                      handleFilterChange("maxBudget", undefined);
                    } else {
                      const [min, max] = value.split("-").map(Number);
                      handleFilterChange("minBudget", min);
                      handleFilterChange("maxBudget", max === -1 ? undefined : max);
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-budget-range">
                    <SelectValue placeholder="All Budgets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Budgets</SelectItem>
                    <SelectItem value="0-5000000">₹0 - ₹50L</SelectItem>
                    <SelectItem value="5000000-10000000">₹50L - ₹1Cr</SelectItem>
                    <SelectItem value="10000000--1">₹1Cr+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lead-status" className="block text-sm font-medium text-foreground mb-2">
                  Lead Status
                </Label>
                <Select 
                  value={filters.status || ""} 
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger data-testid="select-lead-status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value={LeadStatus.NEW}>New</SelectItem>
                    <SelectItem value={LeadStatus.CONTACTED}>Contacted</SelectItem>
                    <SelectItem value={LeadStatus.QUALIFIED}>Qualified</SelectItem>
                    <SelectItem value={LeadStatus.CONVERTED}>Converted</SelectItem>
                    <SelectItem value={LeadStatus.CLOSED}>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bhk-only"
                    checked={filters.bhkOnly || false}
                    onCheckedChange={(checked) => handleFilterChange("bhkOnly", checked)}
                    data-testid="checkbox-bhk-only"
                  />
                  <Label htmlFor="bhk-only" className="text-sm text-foreground">
                    BHK Properties Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recent-activity"
                    checked={filters.recentActivity || false}
                    onCheckedChange={(checked) => handleFilterChange("recentActivity", checked)}
                    data-testid="checkbox-recent-activity"
                  />
                  <Label htmlFor="recent-activity" className="text-sm text-foreground">
                    Recent Activity (7 days)
                  </Label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  data-testid="button-reset-filters"
                >
                  Reset
                </Button>
                <Button 
                  size="sm"
                  data-testid="button-apply-filters"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
