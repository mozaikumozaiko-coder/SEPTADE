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
  sendUserId?: string,
  orderNumber?: string
): Promise<string | null> {
  const userIdentifier = createUserIdentifier(profile.name, profile.birthdate);

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('diagnosis_history')
    .insert({
      user_identifier: userIdentifier,
      user_id: user?.id || null,
      profile_data: profile,
      result_data: result,
      send_user_id: sendUserId || null,
      order_number: orderNumber || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving diagnosis history:', error);
    return null;
  }

  return data?.id || null;
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
): Promise<Array<{ id: string; profile: Profile; result: DiagnosisResult; createdAt: string; sendUserId?: string; gptReport?: any; orderNumber?: string }>> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('diagnosis_history')
    .select('id, profile_data, result_data, created_at, send_user_id, gpt_report_data, order_number')
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
    gptReport: item.gpt_report_data || undefined,
    orderNumber: item.order_number || undefined,
  }));
}

export async function updateDiagnosisHistoryWithGPTReport(
  orderNumber: string,
  userId: string,
  gptReportData: any
): Promise<boolean> {
  const { error } = await supabase
    .from('diagnosis_history')
    .update({ gpt_report_data: gptReportData })
    .eq('order_number', orderNumber)
    .eq('send_user_id', userId);

  if (error) {
    console.error('Error updating diagnosis history with GPT report:', error);
    return false;
  }

  return true;
}
