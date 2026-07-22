import { supabase } from '@/lib/supabase';

export type RegionalTerm = {
  north: string;
  central: string;
  south: string;
  description: string;
};

// In-Memory Cache cho 0ms latency tra cứu danh xưng
const termCache = new Map<string, RegionalTerm | null>();

export async function getKinshipTerm(relationChain: string): Promise<RegionalTerm | null> {
  if (!relationChain) return null;

  // 1. Kiểm tra cache
  if (termCache.has(relationChain)) {
    return termCache.get(relationChain)!;
  }

  // 2. Truy vấn Supabase DB
  const { data, error } = await supabase
    .from('kinship_rules')
    .select('term_north, term_central, term_south, description')
    .eq('relation_chain', relationChain)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // Ignore "Row not found" errors
      console.error('Error fetching kinship term:', error);
    }
    termCache.set(relationChain, null);
    return null;
  }

  if (data) {
    const result: RegionalTerm = {
      north: data.term_north,
      central: data.term_central || data.term_north,
      south: data.term_south || data.term_north,
      description: data.description || '',
    };
    termCache.set(relationChain, result);
    return result;
  }

  termCache.set(relationChain, null);
  return null;
}
