import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { taskAttachmentApi } from '../api/taskAttachmentApi';
import type { Attachment } from '../types/attachment';

const MAX_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'txt', 'xlsx'];

export const useTaskAttachments = (taskId: string, enabled: boolean) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hasLoadedInitial = useRef(false);

  const load = useCallback(async () => {
    if (!taskId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await taskAttachmentApi.list(taskId);
      setAttachments(res.data.data);
      hasLoadedInitial.current = true;
    } catch {
      setError('Failed to load attachments');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (enabled && !hasLoadedInitial.current) {
      load();
    }
  }, [enabled, load]);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `File type not allowed: .${extension}`;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      return `File exceeds maximum size of ${MAX_SIZE_MB}MB`;
    }
    return null;
  };

  const upload = useCallback(
    async (file: File) => {
      if (isUploading) return;

      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setUploadingFileName(file.name);

      try {
        const res = await taskAttachmentApi.upload(taskId, file, (percent) => {
          setUploadProgress(percent);
        });
        setAttachments((prev) => [res.data.data, ...prev]);
        toast.success('Attachment uploaded');
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to upload attachment');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadingFileName(null);
      }
    },
    [taskId, isUploading]
  );

  const remove = useCallback(
    async (attachmentId: string) => {
      if (deletingId) return;
      setDeletingId(attachmentId);
      try {
        await taskAttachmentApi.delete(taskId, attachmentId);
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
        toast.success('Attachment deleted');
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to delete attachment');
      } finally {
        setDeletingId(null);
      }
    },
    [taskId, deletingId]
  );

  const download = useCallback(async (attachment: Attachment) => {
    try {
      const res = await taskAttachmentApi.download(taskId, attachment.id);

      let fileName = attachment.originalFileName;
      const disposition = res.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          fileName = match[1];
        }
      }

      const blob = new Blob([res.data]);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error('Failed to download attachment');
    }
  }, [taskId]);

  return {
    attachments,
    isLoading,
    error,
    retry: load,
    upload,
    isUploading,
    uploadProgress,
    uploadingFileName,
    remove,
    deletingId,
    download,
  };
};