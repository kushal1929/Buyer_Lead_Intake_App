import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { Lead } from "@shared/schema";
import { SearchFilters } from "./advanced-search";
import { format } from "date-fns";

interface LeadsTableProps {
  filters: SearchFilters;
  searchQuery: string;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewLead: (lead: Lead) => void;
}

export default function LeadsTable({ 
  filters, 
  searchQuery, 
  onEditLead, 
  onDeleteLead, 
  onViewLead 
}: LeadsTableProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useLeads({
    userId: "user1", // TODO: Get from auth context
    page,
    limit,
    filters,
    search: searchQuery,
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "contacted":
        return "bg-warning/10 text-warning";
      case "qualified":
        return "bg-success/10 text-success";
      case "converted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formatBudget = (min: number, max: number) => {
    const formatAmount = (amount: number) => {
      if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
      return `₹${amount.toLocaleString()}`;
    };
    return `${formatAmount(min)} - ${formatAmount(max)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading leads. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.leads.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No leads found matching your criteria.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-leads-table">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Lead Details
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Property Interest
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Budget
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Activity
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.leads.map((lead) => (
                <TableRow 
                  key={lead.id} 
                  className="hover:bg-accent/50 transition-colors"
                  data-testid={`row-lead-${lead.id}`}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-primary">
                          {lead.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground" data-testid={`text-lead-name-${lead.id}`}>
                          {lead.name}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-lead-email-${lead.id}`}>
                          {lead.email}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-lead-phone-${lead.id}`}>
                          {lead.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground" data-testid={`text-property-type-${lead.id}`}>
                        {lead.bhkType ? `${lead.bhkType.replace('bhk', ' BHK')} ${lead.propertyType}` : lead.propertyType}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-location-${lead.id}`}>
                        {lead.preferredLocation || "Location not specified"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground" data-testid={`text-budget-${lead.id}`}>
                      {formatBudget(lead.minBudget, lead.maxBudget)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge 
                      className={getStatusBadgeColor(lead.status)}
                      data-testid={`badge-status-${lead.id}`}
                    >
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="text-sm text-foreground" data-testid={`text-last-activity-${lead.id}`}>
                      {format(new Date(lead.lastActivityAt), "MMM dd, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(lead.lastActivityAt), "h:mm a")}
                    </p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewLead(lead)}
                        aria-label={`View ${lead.name} details`}
                        data-testid={`button-view-${lead.id}`}
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditLead(lead)}
                        aria-label={`Edit ${lead.name}`}
                        data-testid={`button-edit-${lead.id}`}
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteLead(lead.id)}
                        aria-label={`Delete ${lead.name}`}
                        data-testid={`button-delete-${lead.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
              Showing{" "}
              <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * limit, data.total)}
              </span>{" "}
              of <span className="font-medium">{data.total}</span> results
            </p>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={page === pageNum ? "default" : "outline"}
                      onClick={() => setPage(pageNum)}
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {data.totalPages > 5 && (
                  <>
                    <span className="px-2 text-sm text-muted-foreground">...</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(data.totalPages)}
                      data-testid={`button-page-${data.totalPages}`}
                    >
                      {data.totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === data.totalPages}
                data-testid="button-next-page"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
