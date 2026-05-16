import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Ban, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

const USERS = Array.from({ length: 14 }).map((_, i) => ({
  id: `u-${i + 1}`,
  name: ["Aarav Patel", "Diya Sharma", "Vivaan Kapoor", "Aditi Iyer", "Ishaan Reddy", "Sara Khan", "Kabir Singh", "Anaya Mehta"][i % 8] + " " + (i + 1),
  email: `user${i + 1}@example.com`,
  mobile: `+91 9${("00000000" + (i * 731 + 1234567)).slice(-9)}`,
  registered: new Date(2026, 0, 1 + i * 3).toISOString(),
  status: i % 7 === 0 ? "blocked" : "active",
  views: 4 + (i * 3) % 40,
}));

function AdminUsers() {
  const [q, setQ] = useState("");
  const filtered = USERS.filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-[color:var(--color-icai-blue)]">Non-Member Users</h1>
        <Badge variant="outline" className="border-[color:var(--color-icai-gold)] text-[color:var(--color-icai-blue)]">Demo Data</Badge>
        <Button variant="outline" className="ml-auto" onClick={() => toast.success("CSV export queued (mock)")}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      </div>
      <Input placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Mobile</TableHead><TableHead>Registered</TableHead><TableHead>Views</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-xs">{u.email}</TableCell>
                <TableCell className="text-xs">{u.mobile}</TableCell>
                <TableCell className="text-xs">{new Date(u.registered).toLocaleDateString()}</TableCell>
                <TableCell>{u.views}</TableCell>
                <TableCell>
                  {u.status === "active" ? <Badge className="bg-emerald-600">Active</Badge> : <Badge variant="destructive">Blocked</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => toast(`Activity history for ${u.name}`)}><Eye className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => toast.error(`User ${u.name} blocked (mock)`)}><Ban className="h-3 w-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
