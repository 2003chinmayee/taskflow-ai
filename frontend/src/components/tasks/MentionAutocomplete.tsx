import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectMemberApi } from '../../api/projectMemberApi';
import type { ProjectMember } from '../../types/projectMember';

interface MentionAutocompleteProps {
  projectId: string;
  query: string;
  excludeUserIds: string[];
  position: { top: number; left: number };
  onSelect: (member: ProjectMember) => void;
  onClose: () => void;
}

export default function MentionAutocomplete({
  projectId,
  query,
  excludeUserIds,
  position,
  onSelect,
  onClose,
}: MentionAutocompleteProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['task-modal-project-members', projectId],
    queryFn: () => projectMemberApi.list(projectId),
    select: (res) => res.data.data,
    enabled: !!projectId,
  });

  const members = data ?? [];

  const filtered = members.filter((m) => {
    if (excludeUserIds.includes(m.userId)) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filtered.length === 0) {
        if (e.key === 'Escape') onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(filtered[activeIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filtered, activeIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{ top: position.top, left: position.left }}
      className="absolute z-50 w-72 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 shadow-2xl py-1"
    >
      {filtered.map((member, index) => (
        <button
          key={member.userId}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(member);
          }}
          onMouseEnter={() => setActiveIndex(index)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
            index === activeIndex ? 'bg-violet-500/15' : 'hover:bg-white/5'
          }`}
        >
          <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {member.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">{member.name}</p>
            <p className="text-white/40 text-xs truncate">{member.email}</p>
          </div>
          <span className="text-white/30 text-[10px] uppercase tracking-wide flex-shrink-0">
            {member.role}
          </span>
        </button>
      ))}
    </div>
  );
}