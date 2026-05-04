import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import ComingSoon from '@/pages/ComingSoon';

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

        {/* Future stubs */}
        <Route path="/agents" element={<ComingSoon />} />
        <Route path="/workflows" element={<ComingSoon />} />
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