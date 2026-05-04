import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FOUNDER_EMAILS = [
  { email: 'nick@legenex.com', notes: 'Founder' },
  { email: 'nic@legenex.com', notes: 'Founder' },
  { email: 'morne@legenex.com', notes: 'Founder' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const results = {
      inserted: [],
      skipped: [],
    };

    for (const { email, notes } of FOUNDER_EMAILS) {
      const emailLower = email.toLowerCase();
      
      // Check if grant already exists and is active
      const existing = await base44.asServiceRole.entities.SuperAdminGrant.filter({
        email: emailLower,
        active: true,
      });

      if (existing.length > 0) {
        results.skipped.push({ email: emailLower, reason: 'already_active' });
        continue;
      }

      // Create new grant
      await base44.asServiceRole.entities.SuperAdminGrant.create({
        email: emailLower,
        granted_at: new Date().toISOString(),
        granted_by: 'system_seed',
        active: true,
        notes,
      });

      results.inserted.push(emailLower);
    }

    return Response.json({
      success: true,
      inserted: results.inserted,
      skipped: results.skipped,
      message: `Seeded ${results.inserted.length} super admin grants, skipped ${results.skipped.length}`,
    });
  } catch (error) {
    console.error('Seed super admins error:', error);
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
});