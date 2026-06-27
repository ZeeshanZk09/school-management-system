"use client";

import * as React from "react";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentUploadDialog } from "@/app/(dashboard)/staff/[id]/document-upload-dialog";

interface StaffDocument {
  id: string;
  title: string;
  mimeType: string;
  uploadedAt: Date | string;
  filePath: string;
}

interface TabDocumentsProps {
  staff: {
    id: string;
    documents: StaffDocument[];
  };
}

export function TabDocuments({ staff }: Readonly<TabDocumentsProps>) {
  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Document Store</h2>
        <DocumentUploadDialog staffId={staff.id} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {staff.documents.length === 0 ? (
          <div className="col-span-full h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
            No documents uploaded for this staff member.
          </div>
        ) : (
          staff.documents.map((doc) => (
            <Card key={doc.id} className="border-none shadow-sm glass group/doc">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">{doc.title}</CardTitle>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                      {doc.mimeType.split("/")[1]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  Uploaded {format(new Date(doc.uploadedAt), "PP")}
                </p>
                <Button variant="link" className="text-primary h-auto p-0" asChild>
                  <a href={doc.filePath} target="_blank" rel="noreferrer">
                    View Document
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
