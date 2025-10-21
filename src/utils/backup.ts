import { supabase } from '../lib/supabase';

export interface BackupData {
  timestamp: string;
  version: string;
  tables: {
    products: any[];
    categories: any[];
    sales: any[];
    returns: any[];
    users: any[];
  };
}

export async function createBackup(): Promise<BackupData> {
  const timestamp = new Date().toISOString();

  const [
    { data: products },
    { data: categories },
    { data: sales },
    { data: returns },
    { data: users },
  ] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('sales').select('*'),
    supabase.from('returns').select('*'),
    supabase.from('users').select('id, email, role, created_at'),
  ]);

  const backup: BackupData = {
    timestamp,
    version: '1.0.0',
    tables: {
      products: products || [],
      categories: categories || [],
      sales: sales || [],
      returns: returns || [],
      users: users || [],
    },
  };

  return backup;
}

export async function saveBackupToStorage(backup: BackupData): Promise<string> {
  const fileName = `backup-${backup.timestamp.replace(/[:.]/g, '-')}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });

  const { data, error } = await supabase.storage
    .from('backups')
    .upload(`automated/${fileName}`, blob, {
      contentType: 'application/json',
      upsert: false,
    });

  if (error) throw error;

  return fileName;
}

export async function downloadBackup(backup: BackupData) {
  const dataStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventory-backup-${backup.timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function scheduleAutomatedBackup() {
  try {
    const backup = await createBackup();
    await saveBackupToStorage(backup);

    await supabase.from('backup_logs').insert({
      backup_time: backup.timestamp,
      status: 'success',
      file_name: `backup-${backup.timestamp.replace(/[:.]/g, '-')}.json`,
      size_bytes: JSON.stringify(backup).length,
    });

    return { success: true, backup };
  } catch (error) {
    await supabase.from('backup_logs').insert({
      backup_time: new Date().toISOString(),
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    return { success: false, error };
  }
}

export async function restoreFromBackup(backupData: BackupData): Promise<void> {
  try {
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('returns').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (backupData.tables.products.length > 0) {
      await supabase.from('products').insert(backupData.tables.products);
    }
    if (backupData.tables.categories.length > 0) {
      await supabase.from('categories').insert(backupData.tables.categories);
    }
    if (backupData.tables.sales.length > 0) {
      await supabase.from('sales').insert(backupData.tables.sales);
    }
    if (backupData.tables.returns.length > 0) {
      await supabase.from('returns').insert(backupData.tables.returns);
    }
  } catch (error) {
    console.error('Failed to restore backup:', error);
    throw error;
  }
}

export async function listBackups(): Promise<any[]> {
  const { data, error } = await supabase.storage.from('backups').list('automated');

  if (error) {
    console.error('Failed to list backups:', error);
    return [];
  }

  return data || [];
}

export async function downloadBackupFromStorage(fileName: string): Promise<BackupData | null> {
  const { data, error } = await supabase.storage
    .from('backups')
    .download(`automated/${fileName}`);

  if (error || !data) {
    console.error('Failed to download backup:', error);
    return null;
  }

  const text = await data.text();
  return JSON.parse(text);
}
