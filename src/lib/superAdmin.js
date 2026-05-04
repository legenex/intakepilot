/**
 * Helper to check if a user is a super admin
 * Checks user.super_admin field (set by initializeSuperAdmin)
 */
export async function isSuperAdmin(user) {
  if (!user) return false;
  
  // Check if user has super_admin flag set
  if (user.super_admin === true) {
    return true;
  }
  
  // If flag not present, they're not a super admin
  return false;
}