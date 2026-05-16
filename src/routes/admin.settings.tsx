import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMMITTEES, TOPICS } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

function Settings() {
  const [committees, setCommittees] = useState(COMMITTEES);
  const [topics, setTopics] = useState(TOPICS);
  const [newCom, setNewCom] = useState("");
  const [newTop, setNewTop] = useState("");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[color:var(--color-icai-blue)]">Settings</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>OTP Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>OTP expiry (minutes)</Label><Input type="number" defaultValue={10} className="mt-1" /></div>
            <div><Label>OTP retry limit</Label><Input type="number" defaultValue={3} className="mt-1" /></div>
            <Button onClick={() => toast.success("Saved")} className="bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]">Save</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Session</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Session timeout (minutes)</Label><Input type="number" defaultValue={30} className="mt-1" /></div>
            <Button onClick={() => toast.success("Saved")} className="bg-[color:var(--color-icai-blue)] hover:bg-[color:var(--color-icai-blue-dark)]">Save</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Committee Master Data</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {committees.map((c) => (
                <Badge key={c} variant="secondary" className="gap-1 py-1">
                  {c}
                  <button onClick={() => setCommittees(committees.filter((x) => x !== c))}><Trash2 className="ml-1 h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (newCom) { setCommittees([...committees, newCom]); setNewCom(""); } }} className="mt-3 flex gap-2">
              <Input value={newCom} onChange={(e) => setNewCom(e.target.value)} placeholder="Add committee" />
              <Button type="submit"><Plus className="h-4 w-4" /></Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Topic Master Data</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1 py-1">
                  {t}
                  <button onClick={() => setTopics(topics.filter((x) => x !== t))}><Trash2 className="ml-1 h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (newTop) { setTopics([...topics, newTop]); setNewTop(""); } }} className="mt-3 flex gap-2">
              <Input value={newTop} onChange={(e) => setNewTop(e.target.value)} placeholder="Add topic" />
              <Button type="submit"><Plus className="h-4 w-4" /></Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
