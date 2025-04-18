
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CarrierFormValues } from "../CarrierDetailsForm";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ContactInfoFormProps {
  form: UseFormReturn<CarrierFormValues>;
}

interface AdditionalContact {
  name: string;
  phone: string;
  email: string;
  title: string;
  receives_rate_inquiries: boolean;
}

export function ContactInfoForm({ form }: ContactInfoFormProps) {
  const [newContact, setNewContact] = useState<AdditionalContact>({
    name: "",
    phone: "",
    email: "",
    title: "",
    receives_rate_inquiries: false,
  });
  const [showAddContact, setShowAddContact] = useState(false);
  
  // Get the current contacts or initialize an empty array
  const additionalContacts = form.watch('additional_contacts') || [];
  
  const addContact = () => {
    if (newContact.name && newContact.email) {
      const updatedContacts = [...additionalContacts, newContact];
      form.setValue('additional_contacts', updatedContacts);
      
      // Reset the form
      setNewContact({
        name: "",
        phone: "",
        email: "",
        title: "",
        receives_rate_inquiries: false,
      });
      setShowAddContact(false);
    }
  };
  
  const removeContact = (index: number) => {
    const updatedContacts = [...additionalContacts];
    updatedContacts.splice(index, 1);
    form.setValue('additional_contacts', updatedContacts);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="contact_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Contact Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Contact Phone</FormLabel>
              <FormControl>
                <Input {...field} type="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Contact Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Additional Contacts</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddContact(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
        
        {additionalContacts.length > 0 ? (
          <div className="space-y-4">
            {additionalContacts.map((contact: AdditionalContact, index: number) => (
              <Card key={index}>
                <CardContent className="pt-4 pb-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.title}</p>
                      <div className="mt-2">
                        <p className="text-sm">{contact.email}</p>
                        <p className="text-sm">{contact.phone}</p>
                      </div>
                      {contact.receives_rate_inquiries && (
                        <p className="text-xs text-green-600 mt-1">Receives rate inquiries</p>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeContact(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No additional contacts added yet.</p>
        )}
        
        {showAddContact && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">Add New Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <Input 
                    value={newContact.title}
                    onChange={(e) => setNewContact({...newContact, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input 
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="rate-inquiries"
                  checked={newContact.receives_rate_inquiries}
                  onCheckedChange={(checked) => 
                    setNewContact({
                      ...newContact, 
                      receives_rate_inquiries: checked === true
                    })
                  }
                />
                <label
                  htmlFor="rate-inquiries"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  This contact should receive inquiries for rates
                </label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddContact(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={addContact}
                  disabled={!newContact.name || !newContact.email}
                >
                  Add Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
