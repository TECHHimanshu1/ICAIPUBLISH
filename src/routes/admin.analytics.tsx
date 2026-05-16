import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COMMITTEES, PUBLICATIONS } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/analytics")({ component: Analytics });

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthly = months.map((m, i) => ({ month: m, users: 60 + i * 18 + (i % 3) * 30, sessions: 90 + i * 22 }));
const logins = months.map((m, i) => ({ month: m, count: 200 + ((i * 73) % 250) }));
const byCommittee = COMMITTEES.map((c, i) => ({ name: c.split(" ")[0], value: 8 + (i * 5) % 24 }));
const topPubs = [...PUBLICATIONS].slice(0, 5).map((p, i) => ({ name: p.title.split(" ").slice(0, 3).join(" "), views: 800 - i * 110 }));
const COLORS = ["#0b2a5b", "#1e4485", "#3866b3", "#c9a24b", "#e8c97a", "#7c8db5", "#42588a", "#85714a"];

function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-[color:var(--color-icai-blue)]">Analytics</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => toast.success("CSV export (mock)")}><Download className="mr-1 h-4 w-4" /> CSV</Button>
          <Button variant="outline" onClick={() => toast.success("PDF export (mock)")}><Download className="mr-1 h-4 w-4" /> PDF</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>User Registrations</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#0b2a5b" strokeWidth={2} />
                <Line type="monotone" dataKey="sessions" stroke="#c9a24b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Login Frequency</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={logins}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#0b2a5b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Access by Committee</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byCommittee} dataKey="value" outerRadius={90} label={{ fontSize: 10 }}>
                  {byCommittee.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Publications</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart layout="vertical" data={topPubs} margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" fontSize={11} />
                <YAxis type="category" dataKey="name" fontSize={11} width={120} />
                <Tooltip />
                <Bar dataKey="views" fill="#c9a24b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
