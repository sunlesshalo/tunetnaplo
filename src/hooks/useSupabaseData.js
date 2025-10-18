import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Custom hook for managing symptoms
export function useSymptoms(userId) {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load symptoms from Supabase
  useEffect(() => {
    if (!userId) return;

    async function fetchSymptoms() {
      try {
        const { data, error } = await supabase
          .from('symptoms')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSymptoms(data || []);
      } catch (err) {
        console.error('Error loading symptoms:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSymptoms();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('symptoms_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'symptoms',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSymptoms(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setSymptoms(prev => prev.filter(s => s.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setSymptoms(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  // Add symptom
  const addSymptom = async (symptomData) => {
    try {
      console.log('🔵 Adding symptom:', { user_id: userId, ...symptomData });
      const { data, error } = await supabase
        .from('symptoms')
        .insert([{
          user_id: userId,
          ...symptomData
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Symptom added successfully:', data);
      return { data, error: null };
    } catch (err) {
      console.error('❌ Error adding symptom:', err);
      return { data: null, error: err.message };
    }
  };

  // Update symptom
  const updateSymptom = async (symptomId, updates) => {
    try {
      const { data, error } = await supabase
        .from('symptoms')
        .update(updates)
        .eq('id', symptomId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error updating symptom:', err);
      return { data: null, error: err.message };
    }
  };

  // Delete symptom
  const deleteSymptom = async (symptomId) => {
    try {
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', symptomId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error deleting symptom:', err);
      return { error: err.message };
    }
  };

  return {
    symptoms,
    loading,
    error,
    addSymptom,
    updateSymptom,
    deleteSymptom
  };
}

// Custom hook for managing entries
export function useEntries(userId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load entries from Supabase
  useEffect(() => {
    if (!userId) return;

    async function fetchEntries() {
      try {
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        if (error) throw error;
        setEntries(data || []);
      } catch (err) {
        console.error('Error loading entries:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('entries_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'entries',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('📡 Realtime event received:', payload.eventType, payload);
        if (payload.eventType === 'INSERT') {
          setEntries(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          console.log('🗑️ Removing entry from state:', payload.old.id);
          setEntries(prev => prev.filter(e => e.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setEntries(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
        }
      })
      .subscribe((status, err) => {
        console.log('📡 Realtime subscription status:', status, err);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  // Add entry
  const addEntry = async (entryData) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([{
          user_id: userId,
          ...entryData
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error adding entry:', err);
      return { data: null, error: err.message };
    }
  };

  // Update entry
  const updateEntry = async (entryId, updates) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .update(updates)
        .eq('id', entryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error updating entry:', err);
      return { data: null, error: err.message };
    }
  };

  // Delete entry
  const deleteEntry = async (entryId) => {
    try {
      console.log('🔴 Deleting entry:', { entryId, userId });

      // Optimistically remove from UI immediately
      setEntries(prev => prev.filter(e => e.id !== entryId));

      const { data, error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId)
        .select();

      console.log('🔴 Delete result:', { data, error });
      if (error) {
        // If delete failed, refetch to restore the entry
        console.error('❌ Delete failed, refetching entries');
        const { data: entries } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });
        setEntries(entries || []);
        throw error;
      }
      console.log('✅ Entry deleted successfully');
      return { error: null };
    } catch (err) {
      console.error('❌ Error deleting entry:', err);
      return { error: err.message };
    }
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry
  };
}
