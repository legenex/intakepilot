import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const [currentOrg, setCurrentOrg] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrgs = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) { setLoading(false); return; }
      
      const memberships = await base44.entities.OrganizationMember.filter(
        { user_email: user.email, status: 'active' }
      );
      
      if (memberships.length === 0) {
        setLoading(false);
        return;
      }

      const userOrgs = [];
      for (const m of memberships) {
        try {
          const orgs = await base44.entities.Organization.filter({ id: m.organization_id });
          if (orgs.length > 0 && !orgs[0].soft_delete_at) {
            userOrgs.push(orgs[0]);
          }
        } catch (err) {
          // Silently skip inaccessible orgs
        }
      }
      
      setOrgs(userOrgs);
      
      const savedOrgId = localStorage.getItem('intakepilot-current-org');
      const savedOrg = userOrgs.find(o => o.id === savedOrgId);
      const activeOrg = savedOrg || userOrgs[0];
      
      setCurrentOrg(activeOrg);
      const activeMembership = memberships.find(m => m.organization_id === activeOrg?.id);
      setMembership(activeMembership);
    } catch (e) {
      console.error('Failed to load orgs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrgs(); }, []);

  const switchOrg = (org) => {
    setCurrentOrg(org);
    localStorage.setItem('intakepilot-current-org', org.id);
  };

  const refreshOrgs = () => loadOrgs();

  return (
    <OrgContext.Provider value={{ currentOrg, orgs, membership, loading, switchOrg, refreshOrgs }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => useContext(OrgContext);