import { useContext } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabase() {
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signIn({ email, password });
    if (error) throw error;
  };

  const insert = async (table: string, data: any) => {
    const { error } = await supabase.from(table).insert([data]);
    if (error) throw error;
  };

  const update = async (table: string, id: string, data: any) => {
    const { error } = await supabase.from(table).update(data).eq('id', id);
    if (error) throw error;
  };

  const remove = async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  };

  return {
    supabase,
    signIn,
    signOut,
    insert,
    update,
    remove,
  };
}
