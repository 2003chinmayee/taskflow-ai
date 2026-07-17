import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Task, CreateTaskPayload, TaskStatus, TaskPriority } from '../../types/task';
import { useAuthStore } from '../../store/auth.store';
import TaskTimer from '../../components/tasks/TaskTimer';
import WorkLogModal from '../../components/tasks/WorkLogModal';
import WorkLogList from '../../components/tasks/WorkLogList';
import { useTimeTracking } from '../../hooks/useTimeTracking';
import { projectMemberApi } from '../../api/projectMemberApi';
import CommentsTab from '../../components/tasks/CommentsTab';
import AttachmentsTab from '../../components/tasks/AttachmentsTab';
import ActivityTab from '../../components/tasks/ActivityTab';
import TaskAiTab from '../../components/tasks/TaskAiTab';

const STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'TODO', label: 'To Do', color: 'bg-zinc-500/20 text-zinc-300' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'IN_REVIEW', label: 'In Review', color: 'bg-amber-500/20 text-amber-300' },
  { value: 'DONE', label: 'Done', color: 'bg-emerald-500/20 text-emerald-300' },
];

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'bg-zinc-500/20 text-zinc-300' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'HIGH', label: 'High', color: 'bg-amber-500/20 text-amber-300' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-500/20 text-red-300' },
];

type ModalTab = 'details' | 'comments' | 'attachments' | 'activity' | 'ai';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateTaskPayload) => void;
  isLoading: boolean;
  task?: Task | null;
  projectId?: string;
}

export default function TaskModal({ open, onClose, onSave, isLoading, task, projectId }: TaskModalProps) {
  const currentUser = useAuthStore((s) => s.user);
  const { createManualWorkLog, isCreatingWorkLog } = useTimeTracking();
  const [logTimeOpen, setLogTimeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('details');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const isEditMode = !!(task && projectId);

  // Fetch current user's role on this project (needed for Comments/Attachments
  // authorization-gated UI — composer visibility, delete/moderate controls),
  // and to populate the Assignee dropdown for both create and edit modes.
  const { data: membersData } = useQuery({
    queryKey: ['task-modal-project-members', projectId],
    queryFn: () => projectMemberApi.list(projectId as string),
    select: (res) => res.data.data,
    enabled: !!projectId,
  });

  const currentUserRole = membersData?.find(
    (m) => m.userId === currentUser?.id
  )?.role ?? 'VIEWER';

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? '');
      setDescription(task?.description ?? '');
      setStatus(task?.status ?? 'TODO');
      setPriority(task?.priority ?? 'MEDIUM');
      setDueDate(task?.dueDate ?? '');
      setAssigneeId(task?.assigneeId ?? '');
      setActiveTab('details');
    }
  }, [open, task]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
      assigneeId: assigneeId || undefined,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`w-full rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl p-6 ${
              isEditMode ? 'max-w-2xl' : 'max-w-lg'
            }`}
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-lg">
                  {task ? 'Edit Task' : 'New Task'}
                </h2>
                <p className="text-white/40 text-sm mt-0.5">
                  {task ? 'Update task details' : 'Add a task to this project'}
                </p>
              </div>
              <button onClick={onClose}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8">
                ✕
              </button>
            </div>

            {isEditMode && (
              <div className="flex items-center gap-1 mb-5 border-b border-white/8">
                {(['details', 'comments', 'attachments', 'activity', 'ai'] as ModalTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-all ${
                      activeTab === tab
                        ? 'border-violet-500 text-white'
                        : 'border-transparent text-white/40 hover:text-white/70'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* ─── Details tab — existing form, timer, work logs — unchanged ─── */}
            <div style={{ display: activeTab === 'details' ? 'block' : 'none' }}>
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Title *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    autoFocus
                    readOnly={isEditMode && currentUserRole === 'VIEWER'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                               text-white text-sm placeholder:text-white/20 outline-none
                               focus:border-violet-500/50 transition-all
                               read-only:opacity-60 read-only:cursor-default"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details..."
                    rows={3}
                    readOnly={isEditMode && currentUserRole === 'VIEWER'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                               text-white text-sm placeholder:text-white/20 outline-none
                               focus:border-violet-500/50 resize-none transition-all
                               read-only:opacity-60 read-only:cursor-default"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1.5 block">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      disabled={isEditMode && currentUserRole === 'VIEWER'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5
                                 text-white text-sm outline-none focus:border-violet-500/50 transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value} className="bg-zinc-900">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-white/60 text-xs mb-1.5 block">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      disabled={isEditMode && currentUserRole === 'VIEWER'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5
                                 text-white text-sm outline-none focus:border-violet-500/50 transition-all
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value} className="bg-zinc-900">
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    readOnly={isEditMode && currentUserRole === 'VIEWER'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                               text-white text-sm outline-none focus:border-violet-500/50 transition-all
                               [color-scheme:dark] read-only:opacity-60 read-only:cursor-default"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    disabled={isEditMode && currentUserRole === 'VIEWER'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5
                               text-white text-sm outline-none focus:border-violet-500/50 transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-zinc-900">Unassigned</option>
                    {membersData?.map((m) => (
                      <option key={m.userId} value={m.userId} className="bg-zinc-900">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {task && projectId && currentUser && (
                <>
                  <div className="h-px bg-white/8 my-5" />
                  <div className="flex items-center justify-between mb-3">
                    <TaskTimer taskId={task.id} taskTitle={task.title} currentUserRole={currentUserRole} />
                    {currentUserRole !== 'VIEWER' && (
                      <button onClick={() => setLogTimeOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white border border-white/8 hover:border-white/20 transition-all">
                        <Timer size={12} />
                        Log Time
                      </button>
                    )}
                  </div>
                  <WorkLogList taskId={task.id} projectId={projectId} currentUserId={currentUser.id} />
                </>
              )}
              <div className="flex gap-3 mt-6">
                <button onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/60
                             hover:text-white hover:bg-white/8 text-sm transition-all">
                  {isEditMode && currentUserRole === 'VIEWER' ? 'Close' : 'Cancel'}
                </button>
                {!(isEditMode && currentUserRole === 'VIEWER') && (
                  <button
                    onClick={handleSubmit}
                    disabled={!title.trim() || isLoading}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white
                               bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-all"
                  >
                    {isLoading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
                  </button>
                )}
              </div>
            </div>

            {/* ─── Comments tab — lazy-mounted only when active ─── */}
            {isEditMode && activeTab === 'comments' && currentUser && (
              <CommentsTab
                taskId={task.id}
                projectId={projectId}
                currentUserId={currentUser.id}
                currentUserRole={currentUserRole}
                active={activeTab === 'comments'}
              />
            )}

            {/* ─── Attachments tab — lazy-mounted only when active ─── */}
            {isEditMode && activeTab === 'attachments' && currentUser && (
              <AttachmentsTab
                taskId={task.id}
                currentUserId={currentUser.id}
                currentUserRole={currentUserRole}
                active={activeTab === 'attachments'}
              />
            )}

            {/* ─── Activity tab — lazy-mounted only when active, read-only for all roles including VIEWER ─── */}
            {isEditMode && activeTab === 'activity' && (
              <ActivityTab
                taskId={task.id}
                active={activeTab === 'activity'}
              />
            )}

            {/* ─── AI tab — lazy-mounted only when active. VIEWER can ask questions
                 and see suggestions, but Apply is blocked (both here via
                 currentUserRole and server-side via TaskService) ─── */}
            {isEditMode && activeTab === 'ai' && (
              <TaskAiTab
                taskId={task.id}
                currentUserRole={currentUserRole}
              />
            )}
          </motion.div>

          {task && projectId && (
            <WorkLogModal
              open={logTimeOpen}
              onClose={() => setLogTimeOpen(false)}
              isLoading={isCreatingWorkLog}
              onSave={(payload) => {
                createManualWorkLog({ taskId: task.id, payload });
                setLogTimeOpen(false);
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}