import { useState, useCallback, useEffect, useRef } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export interface AppSettings {
  id: number;
  admin_name: string;
  admin_email: string;
  admin_avatar: string;
}

export const useSettings = () => {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const result = await db.getFirstAsync<AppSettings>('SELECT * FROM settings LIMIT 1');
      setSettings(result || null);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, [db]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      if (!settings) {
        // Insert new
        await db.runAsync(`
          INSERT INTO settings (admin_name, admin_email, admin_avatar)
          VALUES (?, ?, ?)
        `, [
          newSettings.admin_name || '',
          newSettings.admin_email || '',
          newSettings.admin_avatar || ''
        ]);
      } else {
        // Update existing
        const fields = Object.keys(newSettings).filter(k => k !== 'id');
        if (fields.length === 0) return true;
        const query = `UPDATE settings SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
        const params = [...fields.map(f => (newSettings as any)[f]), settings.id];
        await db.runAsync(query, params);
      }
      await fetchSettings();
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  };

  // Initial load
  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      fetchSettings();
      hasFetched.current = true;
    }
  }, [fetchSettings]);
 
  return {
    settings,
    fetchSettings,
    updateSettings,
  };
};
