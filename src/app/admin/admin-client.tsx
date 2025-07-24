
"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllPermits } from "../actions";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { regionCircleMap, PermitStatus } from "@/lib/constants";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, CartesianGrid, Tooltip } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart as BarChartIcon, Clock, ThumbsUp, Download } from "lucide-react";


export type PermitLite = {
    id: string;
    trackingId: string;
    status: PermitStatus;
    region: string;
    circle: string;
    siteName: string;
    createdAt: Date;
    updatedAt: Date;
    workTypes: string;
    approverEmail: string;
    requesterEmail: string;
    requesterCompany: string;
    siteId: string;
    teamMembers: string;
    permissionDate: string;
    contactNumber: string;
};

type Analytics = {
    totalPermits: number;
    pendingPermits: number;
    approvalRate: number;
    avgApprovalTime: string; // in hours or days
    monthlyData: { name: string; approved: number; rejected: number }[];
};

export function AdminClient() {
    const [permits, setPermits] = useState<PermitLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        region: 'all',
        circle: 'all',
        status: 'all',
        search: ''
    });

    useEffect(() => {
        const fetchPermits = async () => {
            setLoading(true);
            const { success, permits: fetchedPermits } = await getAllPermits();
            if (success && fetchedPermits) {
                setPermits(fetchedPermits as PermitLite[]);
            }
            setLoading(false);
        };
        fetchPermits();
    }, []);

    const analytics: Analytics = useMemo(() => {
        if (!permits.length) {
            return { totalPermits: 0, pendingPermits: 0, approvalRate: 0, avgApprovalTime: 'N/A', monthlyData: [] };
        }

        const totalPermits = permits.length;
        const pendingPermits = permits.filter(p => p.status === 'Pending').length;

        const actionedPermits = permits.filter(p => p.status === 'Approved' || p.status === 'Rejected');
        const approvedPermits = actionedPermits.filter(p => p.status === 'Approved').length;
        const approvalRate = actionedPermits.length > 0 ? Math.round((approvedPermits / actionedPermits.length) * 100) : 0;
        
        let totalApprovalTime = 0;
        let approvalCount = 0;
        actionedPermits.forEach(p => {
             const created = new Date(p.createdAt).getTime();
             const updated = new Date(p.updatedAt).getTime();
             totalApprovalTime += (updated - created);
             approvalCount++;
        });

        let avgApprovalTime = 'N/A';
        if (approvalCount > 0) {
            const avgMillis = totalApprovalTime / approvalCount;
            const avgHours = avgMillis / (1000 * 60 * 60);
            if (avgHours < 24) {
               avgApprovalTime = `${avgHours.toFixed(1)}h`;
            } else {
               avgApprovalTime = `${(avgHours / 24).toFixed(1)}d`;
            }
        }
        
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            name: new Date(0, i).toLocaleString('default', { month: 'short' }),
            approved: 0,
            rejected: 0,
        }));
        
        permits.forEach(p => {
            const month = new Date(p.createdAt).getMonth();
            if (p.status === 'Approved') monthlyData[month].approved++;
            if (p.status === 'Rejected') monthlyData[month].rejected++;
        });
        
        const currentMonth = new Date().getMonth();
        const past12MonthsData = [...monthlyData.slice(currentMonth + 1), ...monthlyData.slice(0, currentMonth + 1)];


        return { totalPermits, pendingPermits, approvalRate, avgApprovalTime, monthlyData: past12MonthsData };

    }, [permits]);


    const handleFilterChange = (filterName: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value, circle: filterName === 'region' ? 'all' : prev.circle }));
    };

    const filteredPermits = useMemo(() => {
        return permits.filter(p => {
            const searchLower = filters.search.toLowerCase();
            return (filters.region === 'all' || p.region === filters.region) &&
                   (filters.circle === 'all' || p.circle === filters.circle) &&
                   (filters.status === 'all' || p.status === filters.status) &&
                   (filters.search === '' || 
                        p.trackingId.toLowerCase().includes(searchLower) ||
                        p.siteName.toLowerCase().includes(searchLower)
                   );
        });
    }, [permits, filters]);
    
    const getStatusBadge = (status: string) => {
        switch (status) {
          case "Approved":
            return <Badge className="bg-green-600 text-white hover:bg-green-700">Approved</Badge>;
          case "Rejected":
            return <Badge variant="destructive">Rejected</Badge>;
          case "Pending":
            return <Badge variant="secondary">Pending</Badge>;
          case "Resubmitted":
             return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Resubmitted</Badge>;
          default:
            return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleExport = () => {
        if (!filteredPermits.length) return;

        const headers = [
            "Tracking ID", "Status", "Requester Company", "Requester Email", "Contact Number",
            "Approver Email", "Site Name", "Site ID", "Region", "Circle", "Permission Date",
            "Work Types", "Team Members", "Tool Box Talks", "Submitted At", "Last Updated At"
        ];
        
        const dataToExport = filteredPermits.map(p => ({
            "Tracking ID": p.trackingId,
            "Status": p.status,
            "Requester Company": p.requesterCompany,
            "Requester Email": p.requesterEmail,
            "Contact Number": p.contactNumber,
            "Approver Email": p.approverEmail,
            "Site Name": p.siteName,
            "Site ID": p.siteId,
            "Region": p.region,
            "Circle": p.circle,
            "Permission Date": p.permissionDate,
            "Work Types": p.workTypes,
            "Team Members": p.teamMembers,
            "Tool Box Talks": p.toolBoxTalks,
            "Submitted At": new Date(p.createdAt).toLocaleString(),
            "Last Updated At": new Date(p.updatedAt).toLocaleString(),
        }));
        
        // Simple CSV conversion
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(row => 
                headers.map(header => `"${(row[header as keyof typeof row] || '').toString().replace(/"/g, '""')}"`).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `ptw-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Permits</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{analytics.totalPermits}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{analytics.pendingPermits}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{analytics.approvalRate}%</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Approval Time</CardTitle>
                  <BarChartIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{analytics.avgApprovalTime}</div>}
                </CardContent>
              </Card>
            </div>
            
            <Card>
                <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <CardTitle>All Permits</CardTitle>
                        <CardDescription>Filter and search through all submitted permits.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || filteredPermits.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export to CSV
                    </Button>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <Input 
                            placeholder="Search by Tracking ID or Site..."
                            value={filters.search}
                            onChange={e => handleFilterChange('search', e.target.value)}
                        />
                        <Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}>
                            <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Resubmitted">Resubmitted</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select value={filters.region} onValueChange={v => handleFilterChange('region', v)}>
                            <SelectTrigger><SelectValue placeholder="Filter by Region" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Regions</SelectItem>
                                {Object.keys(regionCircleMap).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select value={filters.circle} onValueChange={v => handleFilterChange('circle', v)} disabled={filters.region === 'all'}>
                            <SelectTrigger><SelectValue placeholder="Filter by Circle" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Circles</SelectItem>
                                {filters.region !== 'all' && regionCircleMap[filters.region as keyof typeof regionCircleMap].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
            
                    <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tracking ID</TableHead>
                                <TableHead>Site Name</TableHead>
                                <TableHead>Approver Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                   <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                   </TableRow>
                                ))
                            ) : filteredPermits.length > 0 ? filteredPermits.map(permit => (
                                <TableRow key={permit.trackingId}>
                                    <TableCell className="font-mono">{permit.trackingId}</TableCell>
                                    <TableCell>{permit.siteName}</TableCell>
                                    <TableCell>{permit.approverEmail}</TableCell>
                                    <TableCell>{getStatusBadge(permit.status)}</TableCell>
                                    <TableCell>{new Date(permit.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No permits found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Analytics</CardTitle>
                    <CardDescription>Approved vs. Rejected permits over the last 12 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        {loading ? <Skeleton className="h-full w-full" /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))' 
                                    }}
                                />
                                <Bar dataKey="approved" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Approved"/>
                                <Bar dataKey="rejected" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Rejected"/>
                            </BarChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
