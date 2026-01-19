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

  const recordToInsert = {
    user_identifier: userIdentifier,
    user_id: user?.id || null,
    profile_data: profile,
    result_data: result,
    send_user_id: sendUserId || null,
    order_number: orderNumber || null,
  };

  console.log('💾 Saving diagnosis history with data:', {
    user_id: recordToInsert.user_id,
    send_user_id: recordToInsert.send_user_id,
    order_number: recordToInsert.order_number,
    profile_name: profile.name,
  });

  const { data, error } = await supabase
    .from('diagnosis_history')
    .insert(recordToInsert)
    .select('id, send_user_id, order_number, created_at')
    .single();

  if (error) {
    console.error('❌ Error saving diagnosis history:', error);
    return null;
  }

  console.log('✅ Diagnosis history saved successfully:', {
    id: data?.id,
    send_user_id: data?.send_user_id,
    order_number: data?.order_number,
    created_at: data?.created_at,
  });

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
): Promise<Array<{ id: string; profile: Profile; result: DiagnosisResult; createdAt: string; sendUserId?: string; gptReport?: any; orderNumber?: string; updatedAt?: string }>> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  console.log('📊 Fetching user diagnosis history for user:', user.id);

  const { data, error } = await supabase
    .from('diagnosis_history')
    .select('id, profile_data, result_data, created_at, updated_at, send_user_id, gpt_report_data, order_number')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user diagnosis history:', error);
    return [];
  }

  console.log(`✅ Found ${data?.length || 0} diagnosis history records`);
  if (data && data.length > 0) {
    const withReports = data.filter(item => item.gpt_report_data).length;
    console.log(`📊 ${withReports} records have GPT reports`);
    data.forEach((item, index) => {
      console.log(`  Record ${index + 1}:`, {
        id: item.id,
        order_number: item.order_number,
        hasGptReport: !!item.gpt_report_data,
        created_at: item.created_at,
        updated_at: item.updated_at,
      });
    });
  }

  return (data || []).map(item => ({
    id: item.id,
    profile: item.profile_data as Profile,
    result: item.result_data as DiagnosisResult,
    createdAt: item.created_at,
    updatedAt: item.updated_at || undefined,
    sendUserId: item.send_user_id || undefined,
    gptReport: item.gpt_report_data || undefined,
    orderNumber: item.order_number || undefined,
  }));
}

export async function getUserCompleteDiagnosisHistory(): Promise<Array<{ id: string; profile: Profile; result: DiagnosisResult; createdAt: string; sendUserId?: string; gptReport: any; orderNumber?: string; updatedAt?: string }>> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  console.log('📊 Fetching complete diagnosis history (with GPT reports) for user:', user.id);

  const { data, error } = await supabase
    .from('diagnosis_history')
    .select('id, profile_data, result_data, created_at, updated_at, send_user_id, gpt_report_data, order_number')
    .eq('user_id', user.id)
    .not('gpt_report_data', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching complete diagnosis history:', error);
    return [];
  }

  console.log(`✅ Found ${data?.length || 0} complete diagnosis history records`);

  return (data || []).map(item => ({
    id: item.id,
    profile: item.profile_data as Profile,
    result: item.result_data as DiagnosisResult,
    createdAt: item.created_at,
    updatedAt: item.updated_at || undefined,
    sendUserId: item.send_user_id || undefined,
    gptReport: item.gpt_report_data,
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
