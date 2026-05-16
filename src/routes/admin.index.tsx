import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Files, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PUBLICATIONS } from "@/lib/mock";

export const Route = createFileRoute("/admin/")({ component: AdminDash });

function AdminDash() {
  const stats = [
    { label: "Total Publications", value: PUBLICATIONS.length, icon: Files },
    { label: "Total Users", value: 1842, icon: Users },
    { label: "Active Sessions", value: 137, icon: TrendingUp },
    { label: "Top Publication", value: "Ind AS '26", icon: BookOpen },
  ];
  const log = [
    "Admin Priya published 'Handbook on GST Annual Return'",
    "Admin Raj archived 'Bulletin Vol. 12'",
    "User non-member shubham@example.com registered",
    "Admin Priya updated topic master data",
    "Bulk uploaded 6 publications via CSV",
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[color:var(--color-icai-blue)]">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-[color:var(--color-icai-blue)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-emerald-600">+12% this month</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Event</TableHead></TableRow></TableHeader>
            <TableBody>
              {log.map((l, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs text-muted-foreground">{new Date(Date.now() - i * 3600000).toLocaleString()}</TableCell>
                  <TableCell>{l}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
