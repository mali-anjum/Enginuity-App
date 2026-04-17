export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: 'student' | 'researcher' | 'educator';
          discipline: 'mechanical' | 'electrical' | 'civil' | 'software' | 'chemical' | 'other' | null;
          is_active: boolean;
          is_new_user: boolean;
          internet_reachable: boolean;
          email_verified: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: 'student' | 'researcher' | 'educator';
          discipline?: 'mechanical' | 'electrical' | 'civil' | 'software' | 'chemical' | 'other' | null;
          is_active?: boolean;
          is_new_user?: boolean;
          internet_reachable?: boolean;
          email_verified?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          institution: string | null;
          field_of_study: string | null;
          timezone: string | null;
          language: string | null;
          preferred_theme: string;
          onboarding_completed: boolean;
          storage_used_mb: number;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          institution?: string | null;
          field_of_study?: string | null;
          timezone?: string | null;
          language?: string | null;
          preferred_theme?: string;
          onboarding_completed?: boolean;
          storage_used_mb?: number;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      workspaces: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          is_personal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          is_personal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workspaces']['Insert']>;
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: 'admin' | 'member' | 'viewer';
          joined_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: 'admin' | 'member' | 'viewer';
          joined_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workspace_members']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          owner_id: string;
          title: string;
          description: string | null;
          status: 'active' | 'completed' | 'archived';
          priority: 'low' | 'medium' | 'high' | 'critical';
          start_date: string | null;
          due_date: string | null;
          is_favorite: boolean;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          owner_id: string;
          title: string;
          description?: string | null;
          status?: 'active' | 'completed' | 'archived';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          start_date?: string | null;
          due_date?: string | null;
          is_favorite?: boolean;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          assigned_to: string | null;
          title: string;
          description: string | null;
          status: 'todo' | 'in_progress' | 'done';
          priority: 'low' | 'medium' | 'high' | 'critical';
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          assigned_to?: string | null;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'done';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      notes: {
        Row: {
          id: string;
          owner_id: string;
          project_id: string | null;
          experiment_id: string | null;
          title: string;
          body: string | null;
          note_type: 'general' | 'lab' | 'theory' | 'code';
          is_favorite: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          project_id?: string | null;
          experiment_id?: string | null;
          title: string;
          body?: string | null;
          note_type?: 'general' | 'lab' | 'theory' | 'code';
          is_favorite?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notes']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      usage_metrics: {
        Row: {
          id: string;
          user_id: string;
          metric_type: string | null;
          metric_value: number | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_type?: string | null;
          metric_value?: number | null;
          recorded_at?: string;
        };
        Update: Partial<Database['public']['Tables']['usage_metrics']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_workspace_member: {
        Args: { target_workspace: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: 'student' | 'researcher' | 'educator';
      discipline_type: 'mechanical' | 'electrical' | 'civil' | 'software' | 'chemical' | 'other';
      workspace_member_role: 'admin' | 'member' | 'viewer';
      project_status: 'active' | 'completed' | 'archived';
      priority_level: 'low' | 'medium' | 'high' | 'critical';
      task_status: 'todo' | 'in_progress' | 'done';
      note_type: 'general' | 'lab' | 'theory' | 'code';
    };
  };
};
