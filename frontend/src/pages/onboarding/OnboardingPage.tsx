import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { organizationApi } from "../../api/organizationApi";
import { useOrgStore } from "../../store/orgStore";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setCurrentOrg = useOrgStore((state) => state.setCurrentOrg);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await organizationApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setCurrentOrg(res.data.data);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create workspace. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">⚡</div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Welcome to TaskFlow AI
          </h1>
          <p className="text-white/40">Let's create your first workspace.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Inc"
              className="w-full bg-zinc-800/60 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Workspace Description <span className="text-white/30">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this workspace for?"
              rows={3}
              className="w-full bg-zinc-800/60 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}