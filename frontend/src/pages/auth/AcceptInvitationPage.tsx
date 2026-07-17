import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { organizationApi } from "../../api/organizationApi";

export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }
    if (!token) return;
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    organizationApi.acceptInvitation(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err?.response?.data?.message ?? "Failed to accept invitation");
      });
  }, [token, isAuthenticated]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {status === "loading" && (
          <>
            <Loader2 size={32} className="text-violet-400 animate-spin mx-auto mb-4" />
            <p className="text-white/50 text-sm">Joining organization...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-white font-semibold text-lg mb-2">Welcome aboard!</h2>
            <p className="text-white/50 text-sm mb-6">You've successfully joined the organization.</p>
            <button onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all">
              Go to Dashboard
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={32} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-white font-semibold text-lg mb-2">Couldn't join</h2>
            <p className="text-white/50 text-sm mb-6">{errorMsg}</p>
            <button onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all">
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}