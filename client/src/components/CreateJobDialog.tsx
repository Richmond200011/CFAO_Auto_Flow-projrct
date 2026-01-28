import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formJobSchema, type FormJob } from "@shared/schema";
import { useCreateJob } from "@/hooks/use-jobs";
import { useCustomerSearch, type Customer } from "@/hooks/use-customer-search";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Loader2, Plus, Search, Check, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the job creation payload structure matching the backend validator
interface CreateJobPayload {
  customer: {
    id?: string; // For existing customers
    name?: string; // For new customers
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  };
  service: {
    serviceType: string;
    vehicleRegNo: string;
    vehicleBrand: string;
    description?: string;
    priority?: "low" | "normal" | "high" | "urgent";
    estimatedCost?: string;
    estimatedDuration?: string;
    notes?: string;
  };
}

export function CreateJobDialog() {
  const [open, setOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const { mutate, isPending } = useCreateJob();
  const { toast } = useToast();

  const { data: customers, isLoading: isSearchingCustomers } =
    useCustomerSearch(
      customerSearchTerm,
      !isNewCustomer && customerSearchTerm.length >= 2,
    );

  const form = useForm<FormJob>({
    resolver: zodResolver(formJobSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      regNumber: "",
      serviceType: "",
      brand: "",
      status: "Checked In",
      queueNumber: 0,
      isPriority: false,
      description: "",
      estimatedCost: 0,
      estimatedDuration: "",
    },
  });

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsNewCustomer(false);
    setCustomerSearchTerm("");
    // Pre-fill form with customer data
    form.setValue("customerName", customer.name);
    form.setValue("customerPhone", customer.phone || "");
    form.setValue("customerEmail", customer.email || "");
  };

  const handleNewCustomer = () => {
    setSelectedCustomer(null);
    setIsNewCustomer(true);
    setCustomerSearchTerm("");
    // Clear customer fields
    form.setValue("customerName", "");
    form.setValue("customerPhone", "");
    form.setValue("customerEmail", "");
  };

  function onSubmit(data: FormJob) {
    console.log("CreateJobDialog: submit clicked", data);

    // Transform form data to match backend API structure
    const payload: CreateJobPayload = {
      customer: isNewCustomer
        ? {
            name: data.customerName,
            phone: data.customerPhone || undefined,
            email:
              data.customerEmail && data.customerEmail.trim()
                ? data.customerEmail
                : undefined,
          }
        : {
            id: selectedCustomer?.id,
          },
      service: {
        serviceType: data.serviceType,
        vehicleRegNo: data.regNumber,
        vehicleBrand: data.brand,
        priority: data.isPriority ? "high" : "normal",
        description: data.description || undefined,
        estimatedCost: data.estimatedCost
          ? data.estimatedCost.toString()
          : undefined,
        estimatedDuration: data.estimatedDuration || undefined,
      },
    };

    mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setSelectedCustomer(null);
        setIsNewCustomer(true);
        setCustomerSearchTerm("");
        toast({
          title: "Job Created",
          description: `Job for ${payload.service.vehicleRegNo} has been successfully created.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error creating job",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add New Job</span>
          <span className="sm:hidden">Job</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] w-full mx-4 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 sm:pb-6">
          <DialogTitle className="text-lg sm:text-xl font-bold">
            Add New Job
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Enter vehicle and customer details to create a new service ticket.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 sm:space-y-4 py-2 sm:py-4"
          >
            {/* Customer Selection Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                <Button
                  type="button"
                  variant={isNewCustomer ? "default" : "outline"}
                  size="sm"
                  onClick={handleNewCustomer}
                  className="w-full sm:flex-1"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">New Customer</span>
                  <span className="sm:hidden">New</span>
                </Button>
                <Button
                  type="button"
                  variant={!isNewCustomer ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsNewCustomer(false)}
                  className="w-full sm:flex-1"
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Existing Customer</span>
                  <span className="sm:hidden">Existing</span>
                </Button>
              </div>

              {isNewCustomer ? (
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-2">
                  <FormLabel>Search Existing Customer</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !selectedCustomer && "text-muted-foreground",
                        )}
                      >
                        {selectedCustomer
                          ? selectedCustomer.name
                          : "Search customer by name..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search customers..."
                          value={customerSearchTerm}
                          onValueChange={setCustomerSearchTerm}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {isSearchingCustomers ? (
                              <div className="flex items-center justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              "No customers found."
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {customers?.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.name}
                                onSelect={() => handleCustomerSelect(customer)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCustomer?.id === customer.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {customer.name}
                                  </span>
                                  {customer.phone && (
                                    <span className="text-sm text-muted-foreground">
                                      {customer.phone}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {!isNewCustomer && selectedCustomer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+233 24 123 4567"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john@example.com"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {isNewCustomer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+233 24 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="regNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reg Number</FormLabel>
                  <FormControl>
                    <Input placeholder="GH-5928-21" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regular Service">
                          Regular Service
                        </SelectItem>
                        <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                        <SelectItem value="Oil Change">Oil Change</SelectItem>
                        <SelectItem value="Brake Repair">
                          Brake Repair
                        </SelectItem>
                        <SelectItem value="General Repair">
                          General Repair
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Brand</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>
                        <SelectItem value="Toyota">Toyota</SelectItem>
                        <SelectItem value="Suzuki">Suzuki</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the issue"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Duration (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="2 hours" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Checked In">Checked In</SelectItem>
                          <SelectItem value="In Diagnostics">
                            In Diagnostics
                          </SelectItem>
                          <SelectItem value="Waiting for Parts">
                            Waiting for Parts
                          </SelectItem>
                          <SelectItem value="Work in Progress">
                            Work in Progress
                          </SelectItem>
                          <SelectItem value="Ready for Pickup">
                            Ready for Pickup
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary text-white w-full sm:w-auto order-1 sm:order-2"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Ticket
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
