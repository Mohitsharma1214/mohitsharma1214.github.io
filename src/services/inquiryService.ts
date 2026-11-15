import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  topic?: string;
  message: string;
  source: 'ai_agent' | 'contact_form';
  status: 'unread' | 'read' | 'replied';
  metadata?: Record<string, any>;
  created_at: string;
}

// Inquiries are stored securely in Supabase cloud database with strict Row-Level Security.
// Plaintext buffering in browser localStorage has been removed to safeguard visitor PII.

export const InquiryService = {
  /**
   * Submit a new inquiry from either the AI Chatbot or Contact Form
   */
  async submitInquiry(data: {
    name?: string;
    email: string;
    topic?: string;
    message: string;
    source: 'ai_agent' | 'contact_form';
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; inquiry: Inquiry; error?: string }> {
    const newInquiry: Inquiry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name?.trim() || 'Website Visitor',
      email: data.email.trim(),
      topic: data.topic?.trim() || (data.source === 'ai_agent' ? 'AI Copilot Inbound Lead' : 'General Inquiry'),
      message: data.message.trim(),
      source: data.source,
      status: 'unread',
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
    };

    // Sync directly to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('inquiries').insert([
          {
            id: newInquiry.id,
            name: newInquiry.name,
            email: newInquiry.email,
            topic: newInquiry.topic,
            message: newInquiry.message,
            source: newInquiry.source,
            status: newInquiry.status,
            metadata: newInquiry.metadata,
            created_at: newInquiry.created_at,
          },
        ]);

        if (error) {
          console.warn('Supabase inquiry insert notice:', error.message);
          return { success: false, inquiry: newInquiry, error: error.message };
        }
      } catch (err: any) {
        console.warn('Network notice writing inquiry to Supabase:', err);
        return { success: false, inquiry: newInquiry, error: err?.message || 'Network error' };
      }
    }

    return { success: true, inquiry: newInquiry };
  },

  /**
   * Fetch all inquiries for authenticated site owner from Supabase
   */
  async getInquiries(): Promise<Inquiry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data as Inquiry[];
        }
      } catch (err) {
        console.error('Error fetching inquiries from Supabase:', err);
      }
    }

    return [];
  },

  /**
   * Update the status of an inquiry ('unread', 'read', 'replied')
   */
  async updateStatus(id: string, status: 'unread' | 'read' | 'replied'): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
        return !error;
      } catch (err) {
        console.warn('Failed to update inquiry status in Supabase:', err);
        return false;
      }
    }
    return false;
  },

  /**
   * Delete an inquiry from Admin Panel
   */
  async deleteInquiry(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('inquiries').delete().eq('id', id);
        return !error;
      } catch (err) {
        console.warn('Failed to delete inquiry from Supabase:', err);
        return false;
      }
    }
    return false;
  },

  /**
   * Count unread inquiries
   */
  async getUnreadCount(): Promise<number> {
    const list = await this.getInquiries();
    return list.filter((i) => i.status === 'unread').length;
  },
};
