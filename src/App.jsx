import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { isSuperAdmin } from '@/lib/superAdmin';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { OrgProvider } from '@/lib/OrgContext';

// Marketing
import MarketingLayout from '@/layouts/MarketingLayout';
import Home from '@/pages/marketing/Home';
import Features from '@/pages/marketing/Features';
import HowItWorks from '@/pages/marketing/HowItWorks';
import UseCases from '@/pages/marketing/UseCases';
import UseCasesPiFirms from '@/pages/marketing/UseCasesPiFirms';
import UseCasesLeadGen from '@/pages/marketing/UseCasesLeadGen';
import UseCasesAggregators from '@/pages/marketing/UseCasesAggregators';
import Problem from '@/pages/marketing/Problem';
import Tech from '@/pages/marketing/Tech';
import Pricing from '@/pages/marketing/Pricing';
import About from '@/pages/marketing/About';
import Contact from '@/pages/marketing/Contact';
import Faq from '@/pages/marketing/Faq';
import LegalTcpa from '@/pages/marketing/LegalTcpa';
import LegalPrivacy from '@/pages/marketing/LegalPrivacy';
import LegalTerms from '@/pages/marketing/LegalTerms';

// Auth
import SignIn from '@/pages/SignIn';
import StartTrial from '@/pages/StartTrial';
import Onboarding from '@/pages/Onboarding';

// App shell
import AppLayout from '@/components/app/AppLayout';
import SettingsLayout from '@/components/app/SettingsLayout';

// App pages
import Dashboard from '@/pages/Dashboard';
import Leads from '@/pages/Leads';
import LeadsImport from '@/pages/LeadsImport';
import Buyers from '@/pages/Buyers';
import BuyerDetail from '@/pages/BuyerDetail';
import Analytics from '@/pages/Analytics';
import DataSources from '@/pages/DataSources';
import AgentLibrary from '@/pages/AgentLibrary';
import AgentEditor from '@/pages/AgentEditor';
import Messages from '@/pages/Messages';
import CallCenter from '@/pages/CallCenter';
import Integrations from '@/pages/Integrations';
import ComplianceAudit from '@/pages/ComplianceAudit';
import ComingSoon from '@/pages/ComingSoon';
import WorkflowsList from '@/pages/WorkflowsList';
import WorkflowEditor from '@/pages/WorkflowEditor';
import WorkflowRuns from '@/pages/WorkflowRuns';

// Platform (Super Admin)
import PlatformLayout from '@/components/platform/PlatformLayout';
import PlatformDashboard from '@/pages/platform/PlatformDashboard';
import PlatformBilling from '@/pages/platform/PlatformBilling';
import PlatformHealth from '@/pages/platform/PlatformHealth';
import PlatformSupport from '@/pages/platform/PlatformSupport';
import PlatformAuditLog from '@/pages/platform/PlatformAuditLog';
import PlatformAnnouncements from '@/pages/platform/PlatformAnnouncements';
import PlatformFeatureFlags from '@/pages/platform/PlatformFeatureFlags';
import PlatformDataTools from '@/pages/platform/PlatformDataTools';
import PlatformIntegrationsOverview from '@/pages/platform/PlatformIntegrationsOverview';
import PlatformApiKeys from '@/pages/platform/PlatformApiKeys';
import PlatformDangerZone from '@/pages/platform/PlatformDangerZone';
import PlatformWorkflows from '@/pages/platform/PlatformWorkflows';
import PlatformBigQuery from '@/pages/platform/PlatformBigQuery';
import PlatformOrganizations from '@/pages/platform/PlatformOrganizations';
import PlatformOrganizationDetail from '@/pages/platform/PlatformOrganizationDetail';
import PlatformUsers from '@/pages/platform/PlatformUsers';
import PlatformUserDetail from '@/pages/platform/PlatformUserDetail';
import PlatformImpersonation from '@/pages/platform/PlatformImpersonation';

// Settings
import SettingsRedirect from '@/pages/settings/SettingsRedirect';
import OrganizationSettings from '@/pages/settings/OrganizationSettings';
import TeamSettings from '@/pages/settings/TeamSettings';
import BillingSettings from '@/pages/settings/BillingSettings';
import BrandingSettings from '@/pages/settings/BrandingSettings';
import ProfileSettings from '@/pages/settings/ProfileSettings';

// ── SuperAdminGate — renders 404 for non-super-admins ────────────────────────
const SuperAdminGate = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [authorized, setAuthorized] = useState(null); // null=loading, true=ok, false=denied

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isAuthenticated || !user) {
        if (!cancelled) setAuthorized(false);
        return;
      }
      try {
        const result = await isSuperAdmin(user);
        if (!cancelled) setAuthorized(result);
      } catch {
        if (!cancelled) setAuthorized(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, isAuthenticated]);

  if (authorized === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!authorized) return <PageNotFound />;
  return children;
};

// ── SubscriptionGate — structure ready for future paid-user enforcement ───────
// To enforce billing: check org.subscription_status in ['trialing','active','past_due']
// OR org.internal_comped === true OR user is super admin.
// For now: all authenticated users pass through.
const SubscriptionGate = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  return children;
};

// ── AuthenticatedApp — only handles authenticated routes ──────────────────────
const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();

  // Safety timeout: if auth hangs beyond 8s, fall through to render routes
  const [forceReady, setForceReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setForceReady(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  if ((isLoadingPublicSettings || isLoadingAuth) && !forceReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      return <Navigate to="/signin" replace />;
    }
  }

  // Auth check complete and user is NOT authenticated → redirect to signin
  // Preserve the original destination so we can redirect back after login
  if (!isAuthenticated) {
    const currentPath = window.location.pathname + window.location.search;
    const redirectTo = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
    return <Navigate to={`/signin${redirectTo}`} replace />;
  }

  return (
    <Routes>
      {/* Authenticated app routes. To enforce paid subscription in the future, wrap <AppLayout /> Route in <SubscriptionGate>. */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Settings */}
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<SettingsRedirect />} />
          <Route path="organization" element={<OrganizationSettings />} />
          <Route path="team" element={<TeamSettings />} />
          <Route path="billing" element={<BillingSettings />} />
          <Route path="branding" element={<BrandingSettings />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>

        {/* Leads */}
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/import" element={<LeadsImport />} />
        <Route path="/leads/:id" element={<Leads />} />

        {/* Buyers */}
        <Route path="/buyers" element={<Buyers />} />
        <Route path="/buyers/:id" element={<BuyerDetail />} />

        {/* Analytics & Data */}
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/integrations/data-sources" element={<DataSources />} />

        {/* AI Agents */}
        <Route path="/agents" element={<AgentLibrary />} />
        <Route path="/agents/:id" element={<AgentEditor />} />

        {/* Comms */}
        <Route path="/messages" element={<Messages />} />
        <Route path="/calls" element={<CallCenter />} />

        {/* Integrations & Compliance */}
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/admin/compliance" element={<ComplianceAudit />} />

        {/* Workflows */}
        <Route path="/workflows" element={<WorkflowsList />} />
        <Route path="/workflows/:id" element={<WorkflowEditor />} />
        <Route path="/workflows/:id/runs" element={<WorkflowRuns />} />
      </Route>

      {/* Platform (Super Admin) — gated: non-super-admins get 404 */}
      <Route element={<SuperAdminGate><PlatformLayout /></SuperAdminGate>}>
        <Route path="/platform" element={<PlatformDashboard />} />
        <Route path="/platform/organizations" element={<PlatformOrganizations />} />
        <Route path="/platform/organizations/:id" element={<PlatformOrganizationDetail />} />
        <Route path="/platform/users" element={<PlatformUsers />} />
        <Route path="/platform/users/:id" element={<PlatformUserDetail />} />
        <Route path="/platform/impersonation" element={<PlatformImpersonation />} />
        <Route path="/platform/billing" element={<PlatformBilling />} />
        <Route path="/platform/health" element={<PlatformHealth />} />
        <Route path="/platform/support" element={<PlatformSupport />} />
        <Route path="/platform/audit-log" element={<PlatformAuditLog />} />
        <Route path="/platform/announcements" element={<PlatformAnnouncements />} />
        <Route path="/platform/feature-flags" element={<PlatformFeatureFlags />} />
        <Route path="/platform/data-tools" element={<PlatformDataTools />} />
        <Route path="/platform/integrations-overview" element={<PlatformIntegrationsOverview />} />
        <Route path="/platform/api-keys" element={<PlatformApiKeys />} />
        <Route path="/platform/danger-zone" element={<PlatformDangerZone />} />
        <Route path="/platform/workflows" element={<PlatformWorkflows />} />
        <Route path="/platform/bigquery" element={<PlatformBigQuery />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

// ── AuthOnlyShell — for signin/signup/onboarding (no OrgProvider) ─────────────
function AuthOnlyShell({ children }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        {children}
      </QueryClientProvider>
    </AuthProvider>
  );
}

// ── AuthenticatedShell — full provider stack for app routes ──────────────────
function AuthenticatedShell() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <OrgProvider>
          <AuthenticatedApp />
        </OrgProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

// ── Root App — marketing renders with zero providers ─────────────────────────
function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* ── Public Marketing Routes (NO auth, NO org context) ── */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/use-cases" element={<UseCases />} />
            <Route path="/use-cases/pi-firms" element={<UseCasesPiFirms />} />
            <Route path="/use-cases/lead-gen-agencies" element={<UseCasesLeadGen />} />
            <Route path="/use-cases/aggregators" element={<UseCasesAggregators />} />
            <Route path="/problem" element={<Problem />} />
            <Route path="/tech" element={<Tech />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/legal/tcpa" element={<LegalTcpa />} />
            <Route path="/legal/privacy" element={<LegalPrivacy />} />
            <Route path="/legal/terms" element={<LegalTerms />} />
          </Route>

          {/* ── Auth Routes (AuthProvider only, no OrgProvider) ── */}
          <Route path="/signin" element={<AuthOnlyShell><SignIn /></AuthOnlyShell>} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/signup" element={<AuthOnlyShell><StartTrial /></AuthOnlyShell>} />
          <Route path="/onboarding" element={<AuthOnlyShell><Onboarding /></AuthOnlyShell>} />

          {/* ── Authenticated App (full provider stack) ── */}
          <Route path="/*" element={<AuthenticatedShell />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;