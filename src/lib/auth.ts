import { supabase } from './supabase';
import type { Profile, UserRole } from '@/types';

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    return profile as Profile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user?.role || null;
}

export async function isUserAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'ADMIN';
}

export async function isUserStaff(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'STAFF' || role === 'ADMIN';
}

export async function isUserRider(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'RIDER';
}

export async function isUserCustomer(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'CUSTOMER';
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD-${timestamp}${random}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  const parts = name.split(' ');
  return parts
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function cn(...classes: (string | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
