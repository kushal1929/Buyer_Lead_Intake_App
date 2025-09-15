import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  title: string;
  description: string;
  onAddLead?: () => void;
  onSearch?: (query: string) => void;
  searchValue?: string;
}

export default function Header({ 
  title, 
  description, 
  onAddLead, 
  onSearch, 
  searchValue = "" 
}: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="text-page-description">
            {description}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {onSearch && (
            <div className="relative">
              <Input
                type="search"
                placeholder="Search leads..."
                className="pl-10 pr-4 py-2 w-64"
                aria-label="Search leads"
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
          )}
          {onAddLead && (
            <Button 
              onClick={onAddLead}
              data-testid="button-add-lead"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
