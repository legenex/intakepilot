import { base44 } from '@/api/base44Client';

export function createBackendFunction(name) {
  return async (payload = {}) => {
    const result = await base44.functions.invoke(name, payload);
    if (result && typeof result === 'object' && 'data' in result) return result;
    return { data: result };
  };
}
