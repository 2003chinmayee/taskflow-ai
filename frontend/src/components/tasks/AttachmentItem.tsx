import { useState } from 'react';
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';
import type { Attachment } from '../../types/attachment';

interface AttachmentItemProps {
  attachment: Attachment;
  currentUserId: string;
  canModerate: boolean;
  onDownload: (attachment: Attachment) => void;
  onDelete: (attachmentId: string) => void;
  isDeleting: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return FileSpreadsheet;
  if (mimeType === 'application/pdf' || mimeType.includes('word') || mimeType === 'text/plain') return FileText;
  return FileIcon;
}

export default function AttachmentItem({
  attachment,
  currentUserId,
  canModerate,
  onDownload,
  onDelete,
  isDeleting,
}: AttachmentItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isUploader = attachment.uploadedBy === currentUserId;
  const canDelete = isUploader || canModerate;

  const Icon = getFileIcon(attachment.mimeType);

  const uploadDate = new Date(attachment.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
      <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-violet-300" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-white text-sm font-medium truncate">{attachment.originalFileName}</p>
        <p className="text-white/35 text-xs truncate">
          {formatFileSize(attachment.fileSizeBytes)} · {attachment.uploaderName} · {uploadDate}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onDownload(attachment)}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all"
          title="Download"
        >
          <Download size={14} />
        </button>

        {canDelete && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}

        {canDelete && confirmDelete && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-white/40">Delete?</span>
            <button
              onClick={() => {
                onDelete(attachment.id);
                setConfirmDelete(false);
              }}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 font-medium disabled:opacity-40"
            >
              {isDeleting ? <Loader2 size={12} className="animate-spin" /> : 'Yes'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-white/40 hover:text-white"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}