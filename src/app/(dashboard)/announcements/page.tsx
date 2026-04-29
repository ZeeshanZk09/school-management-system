import { format } from "date-fns";
import { Calendar, Megaphone, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, requireAuth } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { AnnouncementForm } from "./announcement-form";

export default async function AnnouncementsPage() {
  const user = await requireAuth();
  const canManage = await hasPermission(user.id, "system.manage");

  const announcements = await prisma.announcement.findMany({
    where: { isDeleted: false },
    include: { createdBy: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit">
            Announcements
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Institutional notices and broadcasts for all staff.
          </p>
        </div>
        {canManage && (
          <AnnouncementForm>
            <Button className="gradient-primary h-11 px-6 rounded-xl shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Post Announcement
            </Button>
          </AnnouncementForm>
        )}
      </div>

      <div className="grid gap-6">
        {announcements.length === 0 ? (
          <Card className="border-none shadow-sm glass h-64 flex items-center justify-center text-slate-400 italic">
            No announcements posted yet.
          </Card>
        ) : (
          announcements.map((ann) => (
            <Card
              key={ann.id}
              className="border-none shadow-sm glass overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">
                      {ann.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-medium uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(ann.publishedAt), "PPP")}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ann.createdBy.fullName}
                      </div>
                    </div>
                  </div>
                </div>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {ann.body}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
