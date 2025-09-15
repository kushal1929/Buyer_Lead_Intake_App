import { useState } from "react";
import Header from "@/components/layout/header";
import AdvancedSearch, { SearchFilters } from "@/components/leads/advanced-search";
import LeadsTable from "@/components/leads/leads-table";
import AddLeadModal from "@/components/leads/add-lead-modal";
import { Lead } from "@shared/schema";

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);

  const handleAddLead = () => {
    setEditLead(null);
    setIsAddLeadModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditLead(lead);
    setIsAddLeadModalOpen(true);
  };

  const handleViewLead = (lead: Lead) => {
    // TODO: Implement lead detail view
    console.log("View lead:", lead);
  };

  const handleDeleteLead = (leadId: string) => {
    // TODO: Implement delete confirmation and delete functionality
    console.log("Delete lead:", leadId);
  };

  const handleCloseModal = () => {
    setIsAddLeadModalOpen(false);
    setEditLead(null);
  };

  return (
    <div className="flex-1 overflow-y-auto" data-testid="page-leads">
      <Header
        title="Leads"
        description="Manage all your buyer leads in one place."
        onAddLead={handleAddLead}
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

      <div className="p-6">
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <AdvancedSearch
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          <LeadsTable
            filters={filters}
            searchQuery={searchQuery}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onViewLead={handleViewLead}
          />
        </div>
      </div>

      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={handleCloseModal}
        editLead={editLead}
      />
    </div>
  );
}
