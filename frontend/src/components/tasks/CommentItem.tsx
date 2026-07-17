import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { Comment } from '../../types/comment';

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  canModerate: boolean;
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export default function CommentItem({
  comment,
  currentUserId,
  canModerate,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAuthor = comment.authorId === currentUserId;
  const canEdit = isAuthor && !comment.deleted;
  const canDelete = (isAuthor || canModerate) && !comment.deleted;

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed || isUpdating) return;
    onUpdate(comment.id, trimmed);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(comment.content);
    setIsEditing(false);
  };

  const timestamp = new Date(comment.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
        {comment.authorName.charAt(0).toUpperCase()}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white text-sm font-medium">{comment.authorName}</span>
          <span className="text-white/30 text-xs">{timestamp}</span>
          {comment.edited && !comment.deleted && (
            <span className="text-white/25 text-[10px] uppercase tracking-wide">edited</span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500/50 resize-none transition-all"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={!editText.trim() || isUpdating}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all"
              >
                <Check size={12} />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white/50 hover:text-white transition-all"
              >
                <X size={12} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
            comment.deleted ? 'italic text-white/30' : 'text-white/80'
          }`}>
            {comment.content}
          </p>
        )}

        {!isEditing && (canEdit || canDelete) && (
          <div className="flex items-center gap-1 mt-1.5">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all"
              >
                <Pencil size={12} />
              </button>
            )}
            {canDelete && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={12} />
              </button>
            )}
            {canDelete && confirmDelete && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-white/40">Delete?</span>
                <button
                  onClick={() => {
                    onDelete(comment.id);
                    setConfirmDelete(false);
                  }}
                  disabled={isDeleting}
                  className="text-red-400 hover:text-red-300 font-medium disabled:opacity-40"
                >
                  Yes
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
        )}
      </div>
    </div>
  );
}