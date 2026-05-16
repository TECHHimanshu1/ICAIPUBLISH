import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Archive, Eye, EyeOff, Link2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { COMMITTEES, PUBLICATIONS, TOPICS } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/publications")({ component: AdminPubs });

function AdminPubs() {
  const [q, setQ] = useState("");
  const filtered = PUBLICATIONS.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-[color:var(--color-icai-blue)]">Publications</h1>
        <Badge variant="outline" className="border-[color:var(--color-icai-gold)] text-[color:var(--color-icai-blue)]">Demo Data</Badge>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Bulk CSV uploaded (mock)")}>
            <Upload className="mr-1 h-4 w-4" /> Bulk Upload
          </Button>
          <AddPublication />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input placeholder="Search by title…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      </div>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Committee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell className="text-xs">{p.committee}</TableCell>
                <TableCell><Badge variant="secondary">{p.type}</Badge></TableCell>
                <TableCell className="text-xs">{new Date(p.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toast.success("Protected URL generated (mock)")}><Link2 className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toast("Hidden from listing")}><EyeOff className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toast("Archived")}><Archive className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toast("Visible")}><Eye className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toast.error("Deleted (mock)")}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AddPublication() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]"><Plus className="mr-1 h-4 w-4" /> Add Publication</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add Publication</DialogTitle></DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Publication created (mock)"); setOpen(false); }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <div className="sm:col-span-2"><Label>Title</Label><Input required className="mt-1" /></div>
          <div><Label>Committee</Label>
            <select className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm">
              {COMMITTEES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><Label>Topic</Label>
            <select className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm">
              {TOPICS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><Label>Publication date</Label><Input type="date" className="mt-1" /></div>
          <div><Label>Release date</Label><Input type="date" className="mt-1" /></div>
          <div className="sm:col-span-2"><Label>Keywords (comma separated)</Label><Input className="mt-1" /></div>
          <div className="sm:col-span-2"><Label>Synopsis</Label><Textarea className="mt-1" rows={3} /></div>
          <div className="sm:col-span-2">
            <Label>PDF Upload</Label>
            <div className="mt-1 flex items-center justify-center rounded-md border border-dashed bg-secondary/50 p-6 text-xs text-muted-foreground">
              <Upload className="mr-2 h-4 w-4" /> Drag & drop PDF here (mock)
            </div>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
