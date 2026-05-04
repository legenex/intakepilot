import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if SuperAdminGrant table already has any active records
    const existingGrants = await base44.asServiceRole.entities.SuperAdminGrant.filter({
      active: true,
    });

    if (existingGrants.length > 0) {
      return Response.json({
        message: 'SuperAdminGrant table already seeded',
        existing_count: existingGrants.length,
      });
    }

    // Call seedSuperAdmins to bootstrap the founder emails
    const seedResult = await base44.asServiceRole.functions.invoke('seedSuperAdmins', {});

    return Response.json({
      success: true,
      message: 'Bootstrap complete - seedSuperAdmins invoked',
      seed_result: seedResult,
    });
  } catch (error) {
    console.error('Bootstrap error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});