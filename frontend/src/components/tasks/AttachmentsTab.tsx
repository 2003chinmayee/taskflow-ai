import { useRef } from 'react';
import { Upload, AlertCircle, Paperclip, Loader2 } from 'lucide-react';
import { useTaskAttachments } from '../../hooks/useTaskAttachments';
import AttachmentItem from './AttachmentItem';

interface AttachmentsTabProps {
  taskId: string;
  currentUserId: string;
  currentUserRole: string;
  active: boolean;
}

export default function AttachmentsTab({
  taskId,
  currentUserId,
  currentUserRole,
  active,
}: AttachmentsTabProps) {
  const {
    attachments,
    isLoading,
    error,
    retry,
    upload,
    isUploading,
    uploadProgress,
    uploadingFileName,
    remove,
    deletingId,
    download,
  } = useTaskAttachments(taskId, active);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canModerate = currentUserRole === 'OWNER' || currentUserRole === 'MANAGER';
  const canUpload = currentUserRole !== 'VIEWER';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      upload(file);
    }
    // Reset input value so selecting the same file again still fires onChange
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {canUpload && (
        <div className="mb-3 flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white transition-all"
          >
            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>

          {isUploading && uploadingFileName && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                <span className="truncate max-w-[200px]">{uploadingFileName}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full bg-violet-500 transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2" style={{ maxHeight: '360px' }}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/4 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle size={20} className="text-red-400 mb-2" />
            <p className="text-white/50 text-sm mb-3">{error}</p>
            <button
              onClick={retry}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/8 hover:bg-white/12 text-white transition-all"
            >
              Retry
            </button>
          </div>
        ) : attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Paperclip size={20} className="text-white/20 mb-2" />
            <p className="text-white/40 text-sm">No attachments yet</p>
          </div>
        ) : (
          attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              currentUserId={currentUserId}
              canModerate={canModerate}
              onDownload={download}
              onDelete={remove}
              isDeleting={deletingId === attachment.id}
            />
          ))
        )}
      </div>
    </div>
  );
}