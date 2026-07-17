import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { useTaskComments } from '../../hooks/useTaskComments';
import { projectMemberApi } from '../../api/projectMemberApi';
import type { ProjectMember } from '../../types/projectMember';
import CommentItem from './CommentItem';
import MentionAutocomplete from './MentionAutocomplete';

interface CommentsTabProps {
  taskId: string;
  projectId: string;
  currentUserId: string;
  currentUserRole: string; // active project role of the logged-in user
  active: boolean; // true only when this tab is the visible/active tab
}

interface MentionEntry {
  userId: string;
  name: string;
}

export default function CommentsTab({
  taskId,
  projectId,
  currentUserId,
  currentUserRole,
  active,
}: CommentsTabProps) {
  const {
    comments,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadOlder,
    retryInitial,
    createComment,
    isCreating,
    updateComment,
    isUpdating,
    deleteComment,
    isDeleting,
  } = useTaskComments(taskId, active);

  const { data: membersData } = useQuery({
    queryKey: ['task-modal-project-members', projectId],
    queryFn: () => projectMemberApi.list(projectId),
    select: (res) => res.data.data,
    enabled: !!projectId && active,
  });

  const members: ProjectMember[] = membersData ?? [];

  const canModerate = currentUserRole === 'OWNER' || currentUserRole === 'MANAGER';
  const canCompose = currentUserRole !== 'VIEWER';

  const [text, setText] = useState('');
  const [mentions, setMentions] = useState<MentionEntry[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionTriggerIndex, setMentionTriggerIndex] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const wasLoadingMoreRef = useRef(false);

  // ─── Scroll-preserving "load older" ─────────────────────────────
  useEffect(() => {
    if (wasLoadingMoreRef.current && !isLoadingMore && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const newScrollHeight = container.scrollHeight;
      const prevHeight = prevScrollHeightRef.current ?? newScrollHeight;
      container.scrollTop = newScrollHeight - prevHeight;
    }
    wasLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  const handleLoadOlder = () => {
    if (scrollContainerRef.current) {
      prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
    }
    loadOlder();
  };

  // Auto-scroll to bottom on initial load only
  const hasAutoScrolled = useRef(false);
  useEffect(() => {
    if (!isLoading && comments.length > 0 && !hasAutoScrolled.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      hasAutoScrolled.current = true;
    }
  }, [isLoading, comments.length]);

  // ─── Mention detection while typing ──────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newText.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const afterAt = textBeforeCursor.slice(atIndex + 1);
      const hasWhitespaceBreak = /\s/.test(afterAt);
      if (!hasWhitespaceBreak) {
        setMentionQuery(afterAt);
        setMentionTriggerIndex(atIndex);
        if (textareaRef.current) {
          const rect = textareaRef.current.getBoundingClientRect();
          setMentionPosition({ top: rect.height, left: 0 });
        }
      } else {
        setMentionQuery(null);
        setMentionTriggerIndex(null);
      }
    } else {
      setMentionQuery(null);
      setMentionTriggerIndex(null);
    }

    // Remove mentions whose "@Name" text no longer appears in the text
    setMentions((prev) => prev.filter((m) => newText.includes(`@${m.name}`)));
  };

  const handleSelectMention = (member: ProjectMember) => {
    if (mentionTriggerIndex === null || !textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart;
    const before = text.slice(0, mentionTriggerIndex);
    const after = text.slice(cursorPos);
    const insertedText = `@${member.name} `;
    const newText = before + insertedText + after;

    setText(newText);
    setMentions((prev) => {
      if (prev.some((m) => m.userId === member.userId)) return prev;
      return [...prev, { userId: member.userId, name: member.name }];
    });
    setMentionQuery(null);
    setMentionTriggerIndex(null);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      const newCursorPos = before.length + insertedText.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && mentionQuery === null) {
      // Enter alone still inserts newline (per requirement); only the
      // Send button submits. We do not preventDefault here.
    }
  };

  const resetComposer = () => {
    setText('');
    setMentions([]);
    setMentionQuery(null);
    setMentionTriggerIndex(null);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isCreating) return;

    createComment(
      { content: trimmed, mentionedUserIds: mentions.map((m) => m.userId) },
      { onSuccess: resetComposer }
    );
  };

  const handleUpdate = (commentId: string, content: string) => {
    // Recompute mentions for the edited content against current members list
    const mentionedUserIds = members
      .filter((m) => content.includes(`@${m.name}`))
      .map((m) => m.userId);
    updateComment({ commentId, payload: { content, mentionedUserIds } });
  };

  const excludeUserIds = useMemo(() => mentions.map((m) => m.userId), [mentions]);

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-1"
        style={{ maxHeight: '360px' }}
      >
        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/8 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-white/8 rounded animate-pulse" />
                  <div className="h-3 w-full bg-white/8 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle size={20} className="text-red-400 mb-2" />
            <p className="text-white/50 text-sm mb-3">{error}</p>
            <button
              onClick={retryInitial}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/8 hover:bg-white/12 text-white transition-all"
            >
              Retry
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare size={20} className="text-white/20 mb-2" />
            <p className="text-white/40 text-sm">No comments yet</p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center py-2">
                <button
                  onClick={handleLoadOlder}
                  disabled={isLoadingMore}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white border border-white/8 hover:border-white/20 transition-all disabled:opacity-50"
                >
                  {isLoadingMore && <Loader2 size={12} className="animate-spin" />}
                  Load older comments
                </button>
              </div>
            )}
            <div className="divide-y divide-white/5">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  canModerate={canModerate}
                  onUpdate={handleUpdate}
                  onDelete={deleteComment}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {canCompose && (
        <div className="relative border-t border-white/8 pt-3 mt-2 flex-shrink-0">
          {mentionQuery !== null && (
            <MentionAutocomplete
              projectId={projectId}
              query={mentionQuery}
              excludeUserIds={excludeUserIds}
              position={mentionPosition}
              onSelect={handleSelectMention}
              onClose={() => {
                setMentionQuery(null);
                setMentionTriggerIndex(null);
              }}
            />
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment... use @ to mention someone"
              rows={2}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/25 outline-none focus:border-violet-500/50 resize-none transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || isCreating}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all flex-shrink-0"
            >
              {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}