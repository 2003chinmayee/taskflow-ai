export interface Attachment {
  id: string;
  taskId: string;
  uploadedBy: string;
  uploaderName: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
}