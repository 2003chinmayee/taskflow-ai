import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useOrgStore } from "../../store/orgStore";
import { organizationApi } from "../../api/organizationApi";
import { useDashboard } from "../../hooks/useDashboard";
import WelcomeHeader from "../../components/dashboard/WelcomeHeader";
import OverviewStats from "../../components/dashboard/OverviewStats";
import MyTasksSection from "../../components/dashboard/MyTasksSection";
import TodaysFocusSection from "../../components/dashboard/TodaysFocusSection";
import UpcomingDeadlinesSection from "../../components/dashboard/UpcomingDeadlinesSection";
import AppHeader from "../../components/layout/AppHeader";
import ErrorBoundary from "../../components/common/ErrorBoundary";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { currentOrg, setCurrentOrg } = useOrgStore();
  const navigate = useNavigate();

  const {
    overview, isLoadingOverview,
    myTasks, isLoadingMyTasks,
    upcomingDeadlines, isLoadingUpcoming,
    todaysFocus, isLoadingTodaysFocus,
  } = useDashboard();

  useEffect(() => {
    if (currentOrg) return;
    organizationApi.list().then((res) => {
      const orgs = res.data.data;
      if (orgs && orgs.length > 0) {
        setCurrentOrg(orgs[0]);
      } else {
        navigate("/onboarding");
      }
    }).catch(() => {});
  }, [currentOrg]);

  if (!currentOrg) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-white/40">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <AppHeader />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-8">
        <WelcomeHeader
          userName={user?.name ?? "there"}
          orgName={currentOrg.name}
          onCreateProject={() => navigate("/projects")}
        />

        <ErrorBoundary fallbackLabel="Overview stats">
          <OverviewStats overview={overview} isLoading={isLoadingOverview} />
        </ErrorBoundary>

        <ErrorBoundary fallbackLabel="Today's focus">
          <TodaysFocusSection focus={todaysFocus} isLoading={isLoadingTodaysFocus} />
        </ErrorBoundary>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary fallbackLabel="My tasks">
              <MyTasksSection tasks={myTasks} isLoading={isLoadingMyTasks} />
            </ErrorBoundary>
          </div>
          <div>
            <ErrorBoundary fallbackLabel="Upcoming deadlines">
              <UpcomingDeadlinesSection deadlines={upcomingDeadlines} isLoading={isLoadingUpcoming} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}