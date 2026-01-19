import { supabase } from './supabase';
import { Profile, DiagnosisResult } from '../types';

export function createUserIdentifier(name: string, birthdate: string): string {
  const combined = `${name.toLowerCase().trim()}_${birthdate}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash).toString(36)}`;
}

export async function saveDiagnosisHistory(
  profile: Profile,
  result: DiagnosisResult,
  sendUserId?: string
): Promise<void> {
  const userIdentifier = createUserIdentifier(profile.name, profile.birthdate);

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('diagnosis_history')
    .insert({
      user_identifier: userIdentifier,
      user_id: user?.id || null,
      profile_data: profile,
      result_data: result,
      send_user_id: sendUserId || null,
    });

  if (error) {
    console.error('Error saving diagnosis history:', error);
  }
}

export async function getDiagnosisHistory(
  name: string,
  birthdate: string,
  limit: number = 5
): Promise<Array<{ profile: Profile; result: DiagnosisResult; createdAt: string }>> {
  const userIdentifier = createUserIdentifier(name, birthdate);

  const { data, error } = await supabase
    .from('diagnosis_history')
    .select('profile_data, result_data, created_at')
    .eq('user_identifier', userIdentifier)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching diagnosis history:', error);
    return [];
  }

  return (data || []).map(item => ({
    profile: item.profile_data as Profile,
    result: item.result_data as DiagnosisResult,
    createdAt: item.created_at,
  }));
}

export async function getUserDiagnosisHistory(
  limit: number = 3
): Promise<Array<{ id: string; profile: Profile; result: DiagnosisResult; createdAt: string; sendUserId?: string }>> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('diagnosis_history')
    .select('id, profile_data, result_data, created_at, send_user_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user diagnosis history:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    profile: item.profile_data as Profile,
    result: item.result_data as DiagnosisResult,
    createdAt: item.created_at,
    sendUserId: item.send_user_id || undefined,
  }));
}
