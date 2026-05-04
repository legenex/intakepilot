import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { OrgProvider } from '@/lib/OrgContext';

// Marketing
import MarketingLayout from '@/components/marketing/MarketingLayout';
import Home from '@/pages/Home';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import UseCases from '@/pages/UseCases';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Privacy from '@/pages/legal/Privacy';
import Terms from '@/pages/legal/Terms';
import TCPACompliance from '@/pages/legal/TCPACompliance';

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

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
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
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* ── Marketing (public) ── */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/use-cases" element={<UseCases />} />
        <Route path="/use-cases/:slug" element={<UseCases />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/tcpa" element={<TCPACompliance />} />
      </Route>

      {/* ── Auth ── */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/login" element={<Navigate to="/signin" replace />} />
      <Route path="/signup" element={<StartTrial />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* ── App (authenticated) ── */}
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

        {/* Future stubs */}
        <Route path="/workflows" element={<ComingSoon />} />
      </Route>

      {/* Platform (Super Admin) */}
      <Route element={<PlatformLayout />}>
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <OrgProvider>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </OrgProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;