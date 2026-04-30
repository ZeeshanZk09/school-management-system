"use client";

import { FileUp, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { addStudentDocument } from "@/app/(dashboard)/students/actions";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StudentDocumentUpload({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.length) {
      toast.error("Please select a file");
      return;
    }

    const file = fileInputRef.current.files[0];
    if (!title) {
      toast.error("Please provide a document title");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload file to API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("module", "students");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || "Failed to upload file");
      }

      // 2. Save record to DB
      const result = await addStudentDocument(studentId, {
        title,
        fileName: uploadData.filename,
        filePath: uploadData.url,
        mimeType: uploadData.type,
        sizeBytes: uploadData.size,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to save document record");
      }

      toast.success("Document uploaded successfully");
      setOpen(false);
      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <FileUp className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-none">
        <form onSubmit={handleUpload}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a PDF or image file (max 5MB) for this student.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Birth Certificate, Previous School Record"
                required
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                accept=".pdf,image/jpeg,image/png,image/jpg"
                required
                className="bg-slate-50 dark:bg-slate-900 border-none file:text-primary file:font-medium"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-primary"
              disabled={isUploading}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
