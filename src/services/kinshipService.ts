import { supabase } from '@/lib/supabase';

export type RegionalTerm = {
  north: string;
  central: string;
  south: string;
  description: string;
};

export async function getKinshipTerm(relationChain: string): Promise<RegionalTerm | null> {
  if (!relationChain) return null;

  const { data, error } = await supabase
    .from('kinship_rules')
    .select('term_north, term_central, term_south, description')
    .eq('relation_chain', relationChain)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // Ignore "Row not found" errors
      console.error('Error fetching kinship term:', error);
    }
    return null;
  }

  if (data) {
    return {
      north: data.term_north,
      central: data.term_central || data.term_north,
      south: data.term_south || data.term_north,
      description: data.description || '',
    };
  }
  return null;
}
