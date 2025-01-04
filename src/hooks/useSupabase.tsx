import { useContext } from 'react';
import { SupabaseContext } from '../contexts/SupabaseContext';

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }

  const { supabase } = context;

  const fetchOne = async <T extends { id: string }>(
    table: string,
    id: string
  ): Promise<T | null> => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      throw error;
    }

    return data;
  };

  const fetchMany = async <T extends object>(
    table: string,
    query?: {
      select?: string;
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
    }
  ): Promise<T[]> => {
    let queryBuilder = supabase
      .from(table)
      .select(query?.select || '*');

    if (query?.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }

    if (query?.order) {
      queryBuilder = queryBuilder.order(query.order.column, {
        ascending: query.order.ascending ?? true,
      });
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      throw error;
    }

    return data || [];
  };

  const insert = async <T extends object>(
    table: string,
    data: Partial<T>
  ): Promise<T> => {
    const { data: inserted, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }

    return inserted;
  };

  const update = async <T extends { id: string }>(
    table: string,
    id: string,
    data: Partial<T>
  ): Promise<T> => {
    const { data: updated, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }

    return updated;
  };

  const remove = async (table: string, id: string): Promise<void> => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return {
    supabase,
    fetchOne,
    fetchMany,
    insert,
    update,
    remove,
    signIn,
    signOut,
  };
};
