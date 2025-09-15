import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCreateLead, useUpdateLead } from "@/hooks/use-leads";
import { insertLeadSchema, updateLeadSchema, PropertyType, LeadPriority, LeadSource, BHKType, Lead } from "@shared/schema";
import { z } from "zod";
import { Plus, X } from "lucide-react";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  editLead?: Lead | null;
}

type FormData = z.infer<typeof insertLeadSchema>;

export default function AddLeadModal({ isOpen, onClose, editLead }: AddLeadModalProps) {
  const { toast } = useToast();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(editLead ? updateLeadSchema : insertLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      propertyType: PropertyType.RESIDENTIAL,
      bhkType: undefined,
      preferredLocation: "",
      minBudget: 0,
      maxBudget: 0,
      status: "new",
      priority: LeadPriority.MEDIUM,
      source: LeadSource.WEBSITE,
      notes: "",
    },
  });

  // Reset form when modal opens/closes or edit lead changes
  useEffect(() => {
    if (editLead) {
      form.reset({
        name: editLead.name,
        email: editLead.email,
        phone: editLead.phone,
        propertyType: editLead.propertyType,
        bhkType: editLead.bhkType || undefined,
        preferredLocation: editLead.preferredLocation || "",
        minBudget: editLead.minBudget,
        maxBudget: editLead.maxBudget,
        status: editLead.status,
        priority: editLead.priority,
        source: editLead.source,
        notes: editLead.notes || "",
      });
      setSelectedPropertyType(editLead.propertyType);
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        propertyType: PropertyType.RESIDENTIAL,
        bhkType: undefined,
        preferredLocation: "",
        minBudget: 0,
        maxBudget: 0,
        status: "new",
        priority: LeadPriority.MEDIUM,
        source: LeadSource.WEBSITE,
        notes: "",
      });
      setSelectedPropertyType(PropertyType.RESIDENTIAL);
    }
  }, [editLead, form, isOpen]);

  const onSubmit = async (data: FormData) => {
    try {
      const leadData = {
        ...data,
        userId: "user1", // TODO: Get from auth context
      };

      if (editLead) {
        await updateLeadMutation.mutateAsync({
          id: editLead.id,
          data: leadData,
        });
        toast({
          title: "Success",
          description: "Lead updated successfully!",
        });
      } else {
        await createLeadMutation.mutateAsync(leadData);
        toast({
          title: "Success",
          description: "Lead created successfully!",
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: editLead ? "Failed to update lead" : "Failed to create lead",
        variant: "destructive",
      });
    }
  };

  const handlePropertyTypeChange = (value: string) => {
    setSelectedPropertyType(value);
    form.setValue("propertyType", value as any);
    
    // Clear BHK type if not residential
    if (value !== PropertyType.RESIDENTIAL) {
      form.setValue("bhkType", undefined);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-add-lead">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle data-testid="text-modal-title">
              {editLead ? "Edit Lead" : "Add New Lead"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-lead">
            {/* Personal Information */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter full name" 
                          {...field} 
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter email address" 
                          {...field} 
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="+91 XXXXXXXXXX" 
                          {...field} 
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Source</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-source">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={LeadSource.WEBSITE}>Website</SelectItem>
                          <SelectItem value={LeadSource.REFERRAL}>Referral</SelectItem>
                          <SelectItem value={LeadSource.SOCIAL}>Social Media</SelectItem>
                          <SelectItem value={LeadSource.ADVERTISEMENT}>Advertisement</SelectItem>
                          <SelectItem value={LeadSource.OTHER}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Property Requirements */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-4">Property Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Property Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select 
                        onValueChange={handlePropertyTypeChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-property-type">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PropertyType.RESIDENTIAL}>Residential</SelectItem>
                          <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
                          <SelectItem value={PropertyType.INDUSTRIAL}>Industrial</SelectItem>
                          <SelectItem value={PropertyType.LAND}>Land/Plot</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedPropertyType === PropertyType.RESIDENTIAL && (
                  <FormField
                    control={form.control}
                    name="bhkType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BHK Configuration</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-bhk-type">
                              <SelectValue placeholder="Select BHK" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={BHKType.ONE_BHK}>1 BHK</SelectItem>
                            <SelectItem value={BHKType.TWO_BHK}>2 BHK</SelectItem>
                            <SelectItem value={BHKType.THREE_BHK}>3 BHK</SelectItem>
                            <SelectItem value={BHKType.FOUR_BHK}>4 BHK</SelectItem>
                            <SelectItem value={BHKType.FIVE_BHK}>5+ BHK</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="preferredLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter preferred location" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Budget Range <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="minBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Min budget" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-min-budget"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxBudget"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Max budget" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-max-budget"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h4 className="text-md font-medium text-foreground mb-4">Additional Information</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={LeadPriority.LOW}>Low</SelectItem>
                          <SelectItem value={LeadPriority.MEDIUM}>Medium</SelectItem>
                          <SelectItem value={LeadPriority.HIGH}>High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3} 
                          placeholder="Add any additional notes about this lead..." 
                          {...field} 
                          value={field.value || ""}
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createLeadMutation.isPending || updateLeadMutation.isPending}
                data-testid="button-submit"
              >
                <Plus className="mr-2 h-4 w-4" />
                {editLead ? "Update Lead" : "Create Lead"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
