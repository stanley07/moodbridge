import { supabase } from './supabaseClient';

export async function logChat(message: string, sender: 'user' | 'assistant', userId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{ message, sender, user_id: userId }]);

  if (error) {
    console.error('Supabase insert error:', error.message || error.details || error);
  } else {
    console.log('Chat logged successfully:', data);
  }
}
