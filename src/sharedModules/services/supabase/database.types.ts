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
          full_name: string | null;
          discipline: 'mechanical' | 'electrical' | 'civil' | 'software' | 'chemical' | 'other' | null;
          avatar_url: string | null;
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
          full_name?: string | null;
          discipline?: 'mechanical' | 'electrical' | 'civil' | 'software' | 'chemical' | 'other' | null;
          avatar_url?: string | null;
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
      hardware_library: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          category: 'MCU' | 'Sensor' | 'Actuator' | 'Module' | 'Tool';
          manufacturer: string | null;
          model_number: string | null;
          specifications: string | null;
          datasheet_url: string | null;
          quantity_available: number;
          quantity_in_use: number;
          status: 'available' | 'in_use' | 'maintenance' | 'depleted';
          image_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          category: 'MCU' | 'Sensor' | 'Actuator' | 'Module' | 'Tool';
          manufacturer?: string | null;
          model_number?: string | null;
          specifications?: string | null;
          datasheet_url?: string | null;
          quantity_available?: number;
          quantity_in_use?: number;
          status?: 'available' | 'in_use' | 'maintenance' | 'depleted';
          image_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['hardware_library']['Insert']>;
      };
      experiments: {
        Row: {
          id: string;
          project_id: string;
          owner_id: string;
          title: string;
          objective: string | null;
          observations: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'failed';
          github_commit: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          owner_id: string;
          title: string;
          objective?: string | null;
          observations?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          github_commit?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['experiments']['Insert']>;
      };
      experiment_hardware: {
        Row: {
          id: string;
          experiment_id: string;
          hardware_id: string;
          quantity_used: number;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          hardware_id: string;
          quantity_used?: number;
        };
        Update: Partial<Database['public']['Tables']['experiment_hardware']['Insert']>;
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
      user_settings: {
        Row: {
          user_id: string;
          push_notifications_enabled: boolean;
          email_notifications_enabled: boolean;
          experiment_reminders_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          push_notifications_enabled?: boolean;
          email_notifications_enabled?: boolean;
          experiment_reminders_enabled?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      global_search_entities: {
        Args: {
          search_query: string;
          filter_project_id: string | null;
          filter_status: string | null;
          filter_hardware_id: string | null;
          filter_tags: string[] | null;
          date_from: string | null;
          date_to: string | null;
          result_limit: number | null;
        };
        Returns: {
          entity_type: string;
          entity_id: string;
          title: string;
          project_id: string | null;
          project_title: string | null;
          snippet: string | null;
          rank: number;
        }[];
      };
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
