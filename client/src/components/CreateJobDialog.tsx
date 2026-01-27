import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formJobSchema, type FormJob } from "@shared/schema";
import { useCreateJob } from "@/hooks/use-jobs";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

export function CreateJobDialog() {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateJob();
  const { toast } = useToast();
  
  const form = useForm<FormJob>({
    resolver: zodResolver(formJobSchema),
    defaultValues: {
      customerName: "",
      regNumber: "",
      serviceType: "",
      brand: "",
      status: "Checked In",
      queueNumber: 0,
      isPriority: false,
    },
  });

  async function onSubmit(data: FormJob) {
    console.log("CreateJobDialog: submit clicked", data);
    // Derive branch from stored current user (if any), otherwise fallback
    let branch = "CFAO Airport";
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.branch) branch = user.branch;
      }
    } catch (e) {
      // ignore
    }

    const payload = {
      ...data,
      branch,
      queueNumber: Math.floor(Math.random() * 900) + 100,
    };

    try {
      console.log("CreateJobDialog: calling mutateAsync", payload);
      const result = await mutateAsync(payload);
      console.log("CreateJobDialog: create success", result);
      setOpen(false);
      form.reset();
      toast({
        title: "Job Created",
        description: `Job for ${payload.regNumber} has been successfully created.`,
      });
    } catch (err: any) {
      console.error("CreateJobDialog: create error", err);
      toast({
        title: "Error creating job",
        description: err?.message || String(err),
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
          <Plus className="mr-2 h-4 w-4" /> Add New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Job</DialogTitle>
          <DialogDescription>
            Enter vehicle and customer details to create a new service ticket.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regular Service">Regular Service</SelectItem>
                        <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                        <SelectItem value="Oil Change">Oil Change</SelectItem>
                        <SelectItem value="Brake Repair">Brake Repair</SelectItem>
                        <SelectItem value="General Repair">General Repair</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Checked In">Checked In</SelectItem>
                          <SelectItem value="In Diagnostics">In Diagnostics</SelectItem>
                          <SelectItem value="Waiting for Parts">Waiting for Parts</SelectItem>
                          <SelectItem value="Work in Progress">Work in Progress</SelectItem>
                          <SelectItem value="Ready for Pickup">Ready for Pickup</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="bg-primary text-white">
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
