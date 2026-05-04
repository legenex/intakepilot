import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { flag_name, org_id, user_id } = await req.json();

    if (!flag_name || !org_id) {
      return Response.json({ error: 'flag_name and org_id required' }, { status: 400 });
    }

    // Fetch flag
    const flags = await base44.asServiceRole.entities.FeatureFlag.filter({ name: flag_name });
    if (flags.length === 0) return Response.json({ enabled: false });

    const flag = flags[0];

    // Resolution order
    if (flag.enabled_globally) return Response.json({ enabled: true });

    if (flag.targeted_orgs && flag.targeted_orgs.includes(org_id)) {
      return Response.json({ enabled: true });
    }

    // Check org's plan
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: org_id });
    if (orgs.length > 0 && flag.targeted_plans && flag.targeted_plans.includes(orgs[0].plan)) {
      return Response.json({ enabled: true });
    }

    // Rollout percentage: deterministic hash of org_id
    if (flag.rollout_percentage > 0) {
      const hash = Array.from(org_id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const rolloutValue = hash % 100;
      if (rolloutValue < flag.rollout_percentage) {
        return Response.json({ enabled: true });
      }
    }

    return Response.json({ enabled: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});