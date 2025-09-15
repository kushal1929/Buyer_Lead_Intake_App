import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Settings, 
  FolderInput,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, current: true },
  { name: "Leads", href: "/leads", icon: Users, current: false },
  { name: "Analytics", href: "/analytics", icon: TrendingUp, current: false },
  { name: "Import/Export", href: "/import-export", icon: FolderInput, current: false },
  { name: "Settings", href: "/settings", icon: Settings, current: false },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0" data-testid="sidebar">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="text-primary-foreground text-sm h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-foreground">LeadFlowPro</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1" data-testid="nav-menu">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border" data-testid="user-profile">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="text-muted-foreground h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@company.com</p>
            </div>
            <button 
              className="text-muted-foreground hover:text-foreground transition-colors" 
              aria-label="User menu"
              data-testid="button-user-menu"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
