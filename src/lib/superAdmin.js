import { base44 } from '@/api/base44Client';

let cachedResult = null;
let cachedEmail = null;

export async function isSuperAdmin(user) {
  if (!user || !user.email) return false;
  
  const emailLower = user.email.toLowerCase();
  
  // Cache check
  if (cachedEmail === emailLower && cachedResult !== null) {
    return cachedResult;
  }
  
  try {
    const grants = await base44.entities.SuperAdminGrant.filter({ 
      email: emailLower, 
      active: true 
    });
    const result = grants.length > 0;
    cachedEmail = emailLower;
    cachedResult = result;
    return result;
  } catch (err) {
    console.error('Super admin check failed:', err);
    return false;
  }
}

export function clearSuperAdminCache() {
  cachedResult = null;
  cachedEmail = null;
}