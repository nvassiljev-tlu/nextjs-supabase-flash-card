import { createClient } from '@/lib/supabase/client';
import { Category, Card, Statistics } from '@/types/database';

const supabase = createClient();

export async function createCategory(name: string) {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select();
  return { data: data as Category[] | null, error };
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data as Category[] | null, error };
}

export async function createCard(categoryId: string, question: string, answer: string) {
  const { data, error } = await supabase
    .from('cards')
    .insert([{ category_id: categoryId, question, answer }])
    .select();
  
  if (data && data[0]) {
    await supabase
      .from('statistics')
      .insert([{ card_id: data[0].id }]);
  }
  
  return { data: data as Card[] | null, error };
}

export async function getCardsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('cards')
    .select(`
      *,
      statistics (
        correct_count,
        wrong_count,
        last_attempt
      )
    `)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });
  return { data: data as Card[] | null, error };
}

export async function updateCard(cardId: string, question: string, answer: string) {
  const { data, error } = await supabase
    .from('cards')
    .update({ question, answer, updated_at: new Date().toISOString() })
    .eq('id', cardId)
    .select();
  return { data: data as Card[] | null, error };
}

export async function deleteCard(cardId: string) {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId);
  return { error };
}

export async function updateStatistics(cardId: string, isCorrect: boolean) {
  const { data: currentStats } = await supabase
    .from('statistics')
    .select('*')
    .eq('card_id', cardId)
    .single();

  if (currentStats) {
    const updates = {
      correct_count: isCorrect 
        ? currentStats.correct_count + 1 
        : currentStats.correct_count,
      wrong_count: !isCorrect 
        ? currentStats.wrong_count + 1 
        : currentStats.wrong_count,
      last_attempt: new Date().toISOString(),
      attempt_date: new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('statistics')
      .update(updates)
      .eq('card_id', cardId)
      .select();
    return { data: data as Statistics[] | null, error };
  }
  
  return { data: null, error: null };
}

export async function getStatistics() {
  const { data, error } = await supabase
    .from('statistics')
    .select(`
      *,
      cards (
        question,
        answer,
        categories (
          name
        )
      )
    `);
  return { data: data as Statistics[] | null, error };
}
