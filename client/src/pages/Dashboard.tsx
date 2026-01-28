import { useState } from "react";
import {
  useJobs,
  useUpdateJob,
  useDeleteJob,
  useCreateJob,
  type Job,
} from "@/hooks/use-jobs";
import { useBranchStatistics } from "@/hooks/use-branch-statistics";
import { CreateJobDialog } from "@/components/CreateJobDialog";
import { StatusCard } from "@/components/StatusCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Search,
  LogOut,
  Settings,
  ChevronDown,
  MessageCircle,
  Key,
  CheckCircle2,
  Clock,
  Car,
  MoreVertical,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { data: jobs, isLoading } = useJobs();
  const {
    data: statistics,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useBranchStatistics();
  const { mutate: updateJob } = useUpdateJob();
  const { mutate: deleteJob } = useDeleteJob();
  const { mutate: createJob } = useCreateJob();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  console.log("statistics", statistics);

  const stats = {
    checkedIn: statistics?.checkedIn || 0,
    diagnostics: statistics?.inDiagnostics || 0,
    parts: statistics?.waitingParts || 0,
    ready: statistics?.readyForPickup || 0,
    wip: statistics?.workInProgress || 0,
  };

  const filteredJobs = jobs?.filter((job: Job) => {
    const matchesSearch =
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.regNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" ||
      (priorityFilter === "priority" && job.isPriority) ||
      (priorityFilter === "regular" && !job.isPriority);

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Checked In":
      case "checked-in":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "In Diagnostics":
      case "in-diagnostics":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Waiting for Parts":
      case "waiting-for-parts":
        return "bg-red-100 text-red-800 border-red-200";
      case "Work in Progress":
      case "work-in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Ready for Pickup":
      case "ready-for-pickup":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-[#1a3b8c] text-white shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight font-display">
                AutoFlow
              </span>
            </div>

            <Button
              variant="ghost"
              className="hidden lg:flex text-white/90 hover:text-white hover:bg-white/10"
              disabled
            >
              CFAO Airport Branch
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#1a3b8c]" />
            </Button>

            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="pl-0 text-white hover:bg-white/10 rounded-full pr-2 sm:pr-4"
                >
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarImage src="https://x.com/CFAOMobility_Ug/status/1983503788846793053" />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block ml-2">
                    <p className="text-sm font-medium leading-none">
                      Sarah Jenkins
                    </p>
                    <p className="text-xs text-white/60">Service Advisor</p>
                  </div>
                  <ChevronDown className="ml-1 sm:ml-2 h-4 w-4 text-white/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {statsLoading ? (
            // Loading skeletons
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-slate-200"
              >
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-2 sm:mb-3" />
                <div className="h-6 w-10 bg-slate-200 rounded animate-pulse" />
              </div>
            ))
          ) : (
            <>
              <StatusCard
                label="Checked In"
                count={stats.checkedIn}
                color="blue"
                delay={0}
              />
              <StatusCard
                label="In Diagnostics"
                count={stats.diagnostics}
                color="orange"
                delay={1}
              />
              <StatusCard
                label="Waiting Parts"
                count={stats.parts}
                color="red"
                delay={2}
              />
              <StatusCard
                label="Work in Progress"
                count={stats.wip}
                color="purple"
                delay={3}
              />
              <StatusCard
                label="Ready for Pickup"
                count={stats.ready}
                color="green"
                delay={4}
              />
            </>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Queue Table */}
          <div className="xl:col-span-9 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Active Service Queue
                  </h2>
                  <p className="text-sm text-slate-500">
                    Manage vehicle status and workflow
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search reg number or name..."
                      className="pl-9 w-full sm:w-[250px] bg-slate-50 border-slate-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[140px] bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="checked-in">Checked In</SelectItem>
                        <SelectItem value="in-diagnostics">
                          In Diagnostics
                        </SelectItem>
                        <SelectItem value="waiting-for-parts">
                          Waiting Parts
                        </SelectItem>
                        <SelectItem value="work-in-progress">
                          Work in Progress
                        </SelectItem>
                        <SelectItem value="ready-for-pickup">
                          Ready for Pickup
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={priorityFilter}
                      onValueChange={setPriorityFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[120px] bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                      </SelectContent>
                    </Select>
                    <CreateJobDialog />
                  </div>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="block lg:hidden">
                {isLoading ? (
                  // Mobile loading skeletons
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                          <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredJobs?.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No jobs found matching your search.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredJobs?.map((job: Job) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          layout
                          className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-slate-500">
                                #{job.queueNumber}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900">
                                  {job.regNumber}
                                </span>
                                {job.isPriority && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-800 border-amber-200 text-xs px-1.5 py-0.5"
                                  >
                                    ★ Priority
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Select
                              defaultValue={job.status}
                              onValueChange={(val) =>
                                updateJob(
                                  { id: job.id, status: val },
                                  {
                                    onSuccess: () => {
                                      refetchStats();
                                    },
                                  },
                                )
                              }
                            >
                              <SelectTrigger
                                className={`w-[140px] h-8 border-0 shadow-sm text-xs ${getStatusColor(job.status)}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="checked-in">
                                  Checked In
                                </SelectItem>
                                <SelectItem value="in-diagnostics">
                                  In Diagnostics
                                </SelectItem>
                                <SelectItem value="waiting-for-parts">
                                  Waiting for Parts
                                </SelectItem>
                                <SelectItem value="work-in-progress">
                                  Work in Progress
                                </SelectItem>
                                <SelectItem value="ready-for-pickup">
                                  Ready for Pickup
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700">
                                Customer:
                              </span>
                              <span className="text-sm text-slate-900">
                                {job.customerName}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700">
                                Service:
                              </span>
                              <Badge
                                variant="outline"
                                className="font-normal bg-white text-xs"
                              >
                                {job.serviceType}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700">
                                Wait Time:
                              </span>
                              <span className="text-sm text-slate-500">
                                45m
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-blue-600 hover:bg-blue-50"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-slate-600 hover:bg-slate-100"
                            >
                              <Key className="h-4 w-4 mr-1" />
                              Keys
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-3 text-slate-400 hover:text-slate-600"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateJob({
                                      id: job.id,
                                      isPriority: !job.isPriority,
                                    })
                                  }
                                >
                                  Toggle Priority
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => deleteJob(job.id)}
                                >
                                  Remove Job
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-[80px]">Queue #</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Current Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
                          </TableCell>
                          <TableCell>
                            <div className="h-8 w-8 bg-slate-200 rounded-full ml-auto animate-pulse" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredJobs?.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-32 text-center text-slate-500"
                        >
                          No jobs found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <AnimatePresence>
                        {filteredJobs?.map((job: Job) => (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            layout
                            className="group hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                          >
                            <TableCell className="font-mono text-slate-500">
                              #{job.queueNumber}
                            </TableCell>
                            <TableCell className="font-semibold text-slate-900">
                              <div className="flex items-center gap-2">
                                {job.regNumber}
                                {job.isPriority && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-800 border-amber-200 text-xs px-1.5 py-0.5"
                                  >
                                    ★ Priority
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">
                                  {job.customerName}
                                </span>
                                <span className="text-xs text-slate-500">
                                  Wait: 45m
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="font-normal bg-white"
                              >
                                {job.serviceType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                defaultValue={job.status}
                                onValueChange={(val) =>
                                  updateJob(
                                    { id: job.id, status: val },
                                    {
                                      onSuccess: () => {
                                        refetchStats();
                                      },
                                    },
                                  )
                                }
                              >
                                <SelectTrigger
                                  className={`w-[160px] h-8 border-0 shadow-sm ${getStatusColor(job.status)}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="checked-in">
                                    Checked In
                                  </SelectItem>
                                  <SelectItem value="in-diagnostics">
                                    In Diagnostics
                                  </SelectItem>
                                  <SelectItem value="waiting-for-parts">
                                    Waiting for Parts
                                  </SelectItem>
                                  <SelectItem value="work-in-progress">
                                    Work in Progress
                                  </SelectItem>
                                  <SelectItem value="ready-for-pickup">
                                    Ready for Pickup
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateJob({
                                          id: job.id,
                                          isPriority: !job.isPriority,
                                        })
                                      }
                                    >
                                      Toggle Priority
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => deleteJob(job.id)}
                                    >
                                      Remove Job
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Right Column: Info Panels */}
          <div className="xl:col-span-3 space-y-4 lg:space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-400" />
                Quick Info
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Total in Queue</span>
                  <span className="font-bold text-slate-900">
                    {statsLoading ? (
                      <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
                    ) : (
                      statistics?.totalInQueue || 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Avg Wait Time</span>
                  <span className="font-bold text-slate-900">
                    {statsLoading ? (
                      <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    ) : (
                      `${statistics?.averageWaitTime || 0} mins`
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">
                    Technicians Active
                  </span>
                  <span className="font-bold text-green-600 flex items-center gap-1">
                    {statsLoading ? (
                      <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        {statistics?.activeTechnicians || 0}/
                        {statistics?.totalTechnicians || 0}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1a3b8c] to-blue-700 rounded-2xl shadow-lg shadow-blue-900/20 p-4 sm:p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded">
                  <Car className="h-4 w-4 text-white" />
                </div>
                Priority Lane
              </h3>
              <div className="space-y-3">
                {jobs?.filter((j: Job) => j.isPriority).length === 0 ? (
                  <p className="text-sm text-white/70 italic">
                    No priority vehicles.
                  </p>
                ) : (
                  jobs
                    ?.filter((j: Job) => j.isPriority)
                    .slice(0, 3)
                    .map((job: Job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-2 rounded bg-white/10 backdrop-blur-sm border border-white/10"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {job.regNumber}
                          </div>
                          <div className="text-xs text-white/70">
                            {job.serviceType}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-amber-400 text-amber-900 hover:bg-amber-400 border-0"
                        >
                          VIP
                        </Badge>
                      </div>
                    ))
                )}
              </div>
              <Button className="w-full mt-4 bg-white text-blue-900 hover:bg-white/90 text-sm sm:text-base">
                Manage Priority
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
