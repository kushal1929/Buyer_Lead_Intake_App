import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="flex-1 overflow-y-auto" data-testid="page-settings">
      <Header
        title="Settings"
        description="Manage your account settings and preferences."
      />

      <div className="p-6">
        <div className="max-w-2xl space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    defaultValue="John Doe" 
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue="john@company.com" 
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company" 
                  defaultValue="Real Estate Pro" 
                  data-testid="input-company"
                />
              </div>
              <Button data-testid="button-save-profile">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for new leads and updates
                  </p>
                </div>
                <Switch 
                  id="email-notifications" 
                  defaultChecked 
                  data-testid="switch-email-notifications"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lead-alerts">Lead Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new leads are added
                  </p>
                </div>
                <Switch 
                  id="lead-alerts" 
                  defaultChecked 
                  data-testid="switch-lead-alerts"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly performance reports
                  </p>
                </div>
                <Switch 
                  id="weekly-reports" 
                  data-testid="switch-weekly-reports"
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Data Export</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Download all your data in various formats
                </p>
                <Button variant="outline" data-testid="button-export-data">
                  Export All Data
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" data-testid="button-delete-account">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
