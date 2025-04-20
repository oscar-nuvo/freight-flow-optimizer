
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CarrierFormValues } from "../CarrierDetailsForm";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Mail, Phone, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const countryCodes = [
  { code: "+1", country: "USA" },
  { code: "+1", country: "Canada" },
  { code: "+52", country: "Mexico" },
];

const countryCodeOptions = [
  { code: "+1", country: "USA", label: "+1 (USA)" },
  { code: "+1", country: "Canada", label: "+1 (Canada)" },
  { code: "+52", country: "Mexico", label: "+52 (Mexico)" },
];

const notificationChannels = [
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: Phone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
];

interface ContactInfoFormProps {
  form: UseFormReturn<CarrierFormValues>;
}

interface AdditionalContact {
  name: string;
  phone: string;
  email: string;
  title: string;
  receives_rate_inquiries: boolean;
  notification_channels: string[];
  country_code: string;
  country: string; // Added country property to fix TypeScript error
}

function validatePhoneWithCountryCode(phone: string, countryCode: string) {
  if (!phone) return true;
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  switch(countryCode) {
    case "+1": // US/Canada
      return /^\+?1?\d{10}$/.test(cleanPhone);
    case "+52": // Mexico
      return /^\+?52?\d{10}$/.test(cleanPhone);
    default:
      return false;
  }
}

export function ContactInfoForm({ form }: ContactInfoFormProps) {
  const [newContact, setNewContact] = useState<AdditionalContact>({
    name: "",
    phone: "",
    email: "",
    title: "",
    receives_rate_inquiries: false,
    notification_channels: [],
    country_code: "+1",
    country: "USA", // Initialize with default country
  });
  const [showAddContact, setShowAddContact] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [primaryChannels, setPrimaryChannels] = useState<string[]>(() =>
    form.getValues("primary_notification_channels") || []
  );
  const [primaryCountry, setPrimaryCountry] = useState<"USA" | "Canada" | "Mexico">("USA");
  const [primaryCountryCode, setPrimaryCountryCode] = useState("+1");

  const [primaryContactTouched, setPrimaryContactTouched] = useState(false);
  const [primaryContactErrors, setPrimaryContactErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const contactPhone = form.getValues("contact_phone") || "";
    if (contactPhone.startsWith("+52")) {
      setPrimaryCountry("Mexico");
      setPrimaryCountryCode("+52");
    } else {
      setPrimaryCountry("USA");
      setPrimaryCountryCode("+1");
    }
    setPrimaryChannels(form.getValues("primary_notification_channels") || []);
  }, [form]);

  const additionalContacts = form.watch('additional_contacts') || [];

  const validateContact = (contact: AdditionalContact) => {
    const errors: {[key: string]: string} = {};

    if (!contact.name.trim()) {
      errors.name = "Name is required";
    }

    if (!contact.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errors.email = "Invalid email format";
    }

    if (contact.phone && !validatePhoneWithCountryCode(contact.phone, contact.country_code)) {
      errors.phone = "Invalid phone number for selected country";
    }

    if (contact.receives_rate_inquiries && contact.notification_channels.length === 0) {
      errors.notification_channels = "At least one notification channel is required";
    }

    return errors;
  };

  const toggleNotificationChannel = (channel: string) => {
    const updatedChannels = [...newContact.notification_channels];
    const index = updatedChannels.indexOf(channel);

    if (index === -1) {
      updatedChannels.push(channel);
    } else {
      updatedChannels.splice(index, 1);
    }

    setNewContact({...newContact, notification_channels: updatedChannels});

    if (updatedChannels.length > 0 && formErrors.notification_channels) {
      const { notification_channels, ...rest } = formErrors;
      setFormErrors(rest);
    }
  };

  function validatePrimaryContact() {
    const errors: {[key: string]: string} = {};
    const name = form.getValues("contact_name") || "";
    const email = form.getValues("contact_email") || "";
    const phone = form.getValues("contact_phone") || "";

    if (name.trim() === "") {
      errors.name = "Primary contact name required.";
    }
    if (!email.trim()) {
      errors.email = "Primary contact email required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }
    if (phone && !validatePhoneWithCountryCode(phone, primaryCountryCode)) {
      errors.phone = "Invalid phone number for selected country";
    }
    if (primaryChannels.length === 0) {
      errors.notification_channels = "At least one notification channel is required";
    }
    return errors;
  }

  const handlePrimaryChannelToggle = (channel: string) => {
    let updated = [...primaryChannels];
    if (updated.includes(channel)) {
      updated = updated.filter((c) => c !== channel);
    } else {
      updated.push(channel);
    }
    setPrimaryChannels(updated);
    form.setValue("primary_notification_channels", updated, { shouldValidate: false });
    if (primaryContactTouched) setPrimaryContactErrors(validatePrimaryContact());
  };

  const handlePrimaryCountryChange = (country: "USA" | "Canada" | "Mexico") => {
    setPrimaryCountry(country);
    setPrimaryCountryCode(country === "Mexico" ? "+52" : "+1");
    setPrimaryContactErrors(validatePrimaryContact());
  };

  const addContact = () => {
    const errors = validateContact(newContact);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let formattedPhone = newContact.phone;
    if (formattedPhone && !formattedPhone.startsWith('+')) {
      formattedPhone = `${newContact.country_code} ${formattedPhone}`;
    }

    const contactToAdd = {
      ...newContact,
      phone: formattedPhone,
    };

    const updatedContacts = [...additionalContacts, contactToAdd];
    form.setValue('additional_contacts', updatedContacts);

    setNewContact({
      name: "",
      phone: "",
      email: "",
      title: "",
      receives_rate_inquiries: false,
      notification_channels: [],
      country_code: "+1",
      country: "USA", // Reset with default country
    });
    setFormErrors({});
    setShowAddContact(false);
  };

  const removeContact = (index: number) => {
    const updatedContacts = [...additionalContacts];
    updatedContacts.splice(index, 1);
    form.setValue('additional_contacts', updatedContacts);
  };

  const handlePrimaryBlur = () => {
    if (primaryChannels.length > 0) {
      form.setValue(
        "primary_notification_channels",
        primaryChannels,
        { shouldValidate: false }
      );
    }
    const phone = form.getValues("contact_phone") || "";
    let formattedPhone = phone;
    if (phone && !phone.startsWith("+")) {
      if (primaryCountryCode) {
        formattedPhone = `${primaryCountryCode} ${phone}`;
      }
    }
    form.setValue("contact_phone", formattedPhone);
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
                <Input {...field} onBlur={() => { setPrimaryContactTouched(true); setPrimaryContactErrors(validatePrimaryContact()); }} />
              </FormControl>
              {primaryContactTouched && primaryContactErrors.name && (
                <p className="text-sm text-red-500 mt-1">{primaryContactErrors.name}</p>
              )}
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
                <div>
                  <RadioGroup
                    value={primaryCountry}
                    onValueChange={val => handlePrimaryCountryChange(val as "USA" | "Canada" | "Mexico")}
                    className="flex gap-4 mb-2"
                  >
                    {countryCodeOptions.map(opt => (
                      <div key={opt.country} className="flex items-center gap-1">
                        <RadioGroupItem value={opt.country} id={`primary-int-country-${opt.country}`} />
                        <label htmlFor={`primary-int-country-${opt.country}`} className="text-xs">{opt.label}</label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Input 
                    type="tel"
                    {...field}
                    onBlur={() => { field.onBlur(); handlePrimaryBlur(); setPrimaryContactTouched(true); setPrimaryContactErrors(validatePrimaryContact()); }}
                    onChange={e => { field.onChange(e); setPrimaryContactTouched(true); setPrimaryContactErrors(validatePrimaryContact()); }}
                    className={cn(primaryContactTouched && primaryContactErrors.phone && "border-red-500")}
                    placeholder="Phone number"
                  />
                </div>
              </FormControl>
              {primaryContactTouched && primaryContactErrors.phone && (
                <p className="text-sm text-red-500 mt-1">{primaryContactErrors.phone}</p>
              )}
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
                <Input 
                  {...field}
                  type="email"
                  onBlur={() => { setPrimaryContactTouched(true); setPrimaryContactErrors(validatePrimaryContact()); }}
                  onChange={e => { field.onChange(e); setPrimaryContactTouched(true); setPrimaryContactErrors(validatePrimaryContact()); }}
                  className={cn(primaryContactTouched && primaryContactErrors.email && "border-red-500")}
                />
              </FormControl>
              {primaryContactTouched && primaryContactErrors.email && (
                <p className="text-sm text-red-500 mt-1">{primaryContactErrors.email}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="col-span-full mt-2">
          <label className="text-sm font-medium mb-2 block">
            Notification Channels* for Primary Contact
          </label>
          <div className="flex flex-wrap gap-3 mt-2">
            {notificationChannels.map((channel) => {
              const isSelected = primaryChannels.includes(channel.id);
              const Icon = channel.icon;
              return (
                <Button
                  key={channel.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePrimaryChannelToggle(channel.id)}
                  className={cn(isSelected ? "bg-primary text-primary-foreground" : "bg-background")}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {channel.label}
                </Button>
              );
            })}
          </div>
          {primaryContactTouched && primaryContactErrors.notification_channels && (
            <p className="text-sm text-red-500 mt-1">{primaryContactErrors.notification_channels}</p>
          )}
        </div>
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
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.title}</p>
                      <div className="mt-2">
                        <p className="text-sm">{contact.email}</p>
                        <p className="text-sm">{contact.phone}</p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Checkbox
                          checked={contact.receives_rate_inquiries}
                          disabled
                          id={`rate-inquiries-${index}`}
                          className="scale-90"
                        />
                        <label
                          htmlFor={`rate-inquiries-${index}`}
                          className={`text-xs ${contact.receives_rate_inquiries ? 'text-green-600' : 'text-muted-foreground'} font-medium cursor-default`}
                        >
                          Receives rate inquiries
                        </label>
                      </div>
                      {contact.receives_rate_inquiries && contact.notification_channels && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Notification channels:</p>
                          <div className="flex gap-2">
                            {contact.notification_channels.map((channel) => {
                              const channelInfo = notificationChannels.find(c => c.id === channel);
                              if (!channelInfo) return null;
                              const Icon = channelInfo.icon;
                              return (
                                <div key={channel} className="inline-flex items-center px-2 py-1 bg-muted rounded-md text-xs">
                                  <Icon className="h-3 w-3 mr-1" />
                                  {channelInfo.label}
                                </div>
                              );
                            })}
                          </div>
                        </div>
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
                  <label className="text-sm font-medium">Name*</label>
                  <Input 
                    value={newContact.name}
                    onChange={(e) => {
                      setNewContact({...newContact, name: e.target.value});
                      if (formErrors.name) {
                        const { name, ...rest } = formErrors;
                        setFormErrors(rest);
                      }
                    }}
                    className={cn("mt-1", formErrors.name && "border-red-500")}
                  />
                  {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
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
                  <label className="text-sm font-medium">Email*</label>
                  <Input 
                    type="email"
                    value={newContact.email}
                    onChange={(e) => {
                      setNewContact({...newContact, email: e.target.value});
                      if (formErrors.email) {
                        const { email, ...rest } = formErrors;
                        setFormErrors(rest);
                      }
                    }}
                    className={cn("mt-1", formErrors.email && "border-red-500")}
                  />
                  {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <div className="flex flex-col gap-1 mt-1">
                    <RadioGroup
                      value={newContact.country}
                      onValueChange={(val) => {
                        const found = countryCodeOptions.find(opt => opt.country === val);
                        setNewContact({
                          ...newContact,
                          country: found?.country || "USA",
                          country_code: found?.code || "+1",
                        });
                      }}
                      className="flex gap-4 mb-2"
                    >
                      {countryCodeOptions.map(opt => (
                        <div key={opt.country} className="flex items-center gap-1">
                          <RadioGroupItem value={opt.country} id={`new-int-contact-country-${opt.country}`} />
                          <label htmlFor={`new-int-contact-country-${opt.country}`} className="text-xs">{opt.label}</label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Input 
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => {
                        setNewContact({...newContact, phone: e.target.value});
                        if (formErrors.phone) {
                          const { phone, ...rest } = formErrors;
                          setFormErrors(rest);
                        }
                      }}
                      className={cn(formErrors.phone && "border-red-500")}
                      placeholder="Phone number"
                    />
                  </div>
                  {formErrors.phone && <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>}
                </div>
              </div>
              
              <div className="space-y-4 mb-4">
                <div className="flex items-center space-x-2">
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
                
                {newContact.receives_rate_inquiries && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Notification Channels*
                    </label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {notificationChannels.map((channel) => {
                        const isSelected = newContact.notification_channels.includes(channel.id);
                        const Icon = channel.icon;
                        return (
                          <Button
                            key={channel.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleNotificationChannel(channel.id)}
                            className={cn(
                              isSelected ? "bg-primary text-primary-foreground" : "bg-background",
                            )}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {channel.label}
                          </Button>
                        );
                      })}
                    </div>
                    {formErrors.notification_channels && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.notification_channels}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowAddContact(false);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={addContact}
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
