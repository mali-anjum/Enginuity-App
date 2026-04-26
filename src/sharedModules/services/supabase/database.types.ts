export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_requests: {
        Row: {
          created_at: string
          id: string
          request_type: Database["public"]["Enums"]["ai_request_type"] | null
          status: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_type?: Database["public"]["Enums"]["ai_request_type"] | null
          status?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_type?: Database["public"]["Enums"]["ai_request_type"] | null
          status?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_tags: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_tag_type"]
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_tag_type"]
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_tag_type"]
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_attachments: {
        Row: {
          created_at: string
          experiment_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          experiment_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          experiment_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_attachments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_hardware: {
        Row: {
          experiment_id: string
          hardware_id: string
          id: string
          quantity_used: number
        }
        Insert: {
          experiment_id: string
          hardware_id: string
          id?: string
          quantity_used?: number
        }
        Update: {
          experiment_id?: string
          hardware_id?: string
          id?: string
          quantity_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "experiment_hardware_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_hardware_hardware_id_fkey"
            columns: ["hardware_id"]
            isOneToOne: false
            referencedRelation: "hardware_library"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          completed_at: string | null
          created_at: string
          github_commit: string | null
          id: string
          objective: string | null
          observations: string | null
          owner_id: string
          project_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["experiment_status"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          github_commit?: string | null
          id?: string
          objective?: string | null
          observations?: string | null
          owner_id: string
          project_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["experiment_status"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          github_commit?: string | null
          id?: string
          objective?: string | null
          observations?: string | null
          owner_id?: string
          project_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["experiment_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hardware_library: {
        Row: {
          category: Database["public"]["Enums"]["hardware_category"]
          created_at: string
          datasheet_url: string | null
          id: string
          image_url: string | null
          manufacturer: string | null
          model_number: string | null
          name: string
          notes: string | null
          owner_id: string
          quantity_available: number
          quantity_in_use: number
          specifications: string | null
          status: Database["public"]["Enums"]["hardware_status"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["hardware_category"]
          created_at?: string
          datasheet_url?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          model_number?: string | null
          name: string
          notes?: string | null
          owner_id: string
          quantity_available?: number
          quantity_in_use?: number
          specifications?: string | null
          status?: Database["public"]["Enums"]["hardware_status"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["hardware_category"]
          created_at?: string
          datasheet_url?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          model_number?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          quantity_available?: number
          quantity_in_use?: number
          specifications?: string | null
          status?: Database["public"]["Enums"]["hardware_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hardware_library_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      note_versions: {
        Row: {
          body: string | null
          created_at: string
          id: string
          note_id: string
          version_number: number
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          note_id: string
          version_number: number
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          note_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "note_versions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          body: string | null
          created_at: string
          experiment_id: string | null
          id: string
          is_archived: boolean
          is_favorite: boolean
          note_type: Database["public"]["Enums"]["note_type"]
          owner_id: string
          project_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          experiment_id?: string | null
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          note_type?: Database["public"]["Enums"]["note_type"]
          owner_id: string
          project_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          experiment_id?: string | null
          id?: string
          is_archived?: boolean
          is_favorite?: boolean
          note_type?: Database["public"]["Enums"]["note_type"]
          owner_id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          discipline: Database["public"]["Enums"]["discipline_type"] | null
          field_of_study: string | null
          full_name: string | null
          id: string
          institution: string | null
          language: string | null
          onboarding_completed: boolean
          preferences: Json
          preferred_theme: string
          storage_used_mb: number
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discipline?: Database["public"]["Enums"]["discipline_type"] | null
          field_of_study?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          language?: string | null
          onboarding_completed?: boolean
          preferences?: Json
          preferred_theme?: string
          storage_used_mb?: number
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discipline?: Database["public"]["Enums"]["discipline_type"] | null
          field_of_study?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          language?: string | null
          onboarding_completed?: boolean
          preferences?: Json
          preferred_theme?: string
          storage_used_mb?: number
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_favorite: boolean
          owner_id: string
          priority: Database["public"]["Enums"]["priority_level"]
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_favorite?: boolean
          owner_id: string
          priority?: Database["public"]["Enums"]["priority_level"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_favorite?: boolean
          owner_id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          experiment_id: string | null
          id: string
          project_id: string | null
          remind_at: string
          status: Database["public"]["Enums"]["reminder_status"]
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          experiment_id?: string | null
          id?: string
          project_id?: string | null
          remind_at: string
          status?: Database["public"]["Enums"]["reminder_status"]
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          experiment_id?: string | null
          id?: string
          project_id?: string | null
          remind_at?: string
          status?: Database["public"]["Enums"]["reminder_status"]
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at: string
          ends_at: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          provider: Database["public"]["Enums"]["payment_provider"] | null
          starts_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          ends_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          provider?: Database["public"]["Enums"]["payment_provider"] | null
          starts_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          ends_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          provider?: Database["public"]["Enums"]["payment_provider"] | null
          starts_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_queue: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          operation: Database["public"]["Enums"]["sync_operation"]
          payload: Json | null
          retry_count: number
          status: Database["public"]["Enums"]["sync_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          operation: Database["public"]["Enums"]["sync_operation"]
          payload?: Json | null
          retry_count?: number
          status?: Database["public"]["Enums"]["sync_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          operation?: Database["public"]["Enums"]["sync_operation"]
          payload?: Json | null
          retry_count?: number
          status?: Database["public"]["Enums"]["sync_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          project_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          project_id: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          project_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_metrics: {
        Row: {
          id: string
          metric_type: string | null
          metric_value: number | null
          recorded_at: string
          user_id: string
        }
        Insert: {
          id?: string
          metric_type?: string | null
          metric_value?: number | null
          recorded_at?: string
          user_id: string
        }
        Update: {
          id?: string
          metric_type?: string | null
          metric_value?: number | null
          recorded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          email_notifications_enabled: boolean
          experiment_reminders_enabled: boolean
          push_notifications_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          email_notifications_enabled?: boolean
          experiment_reminders_enabled?: boolean
          push_notifications_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          email_notifications_enabled?: boolean
          experiment_reminders_enabled?: boolean
          push_notifications_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          discipline: Database["public"]["Enums"]["discipline_type"] | null
          email: string
          email_verified: boolean
          full_name: string
          id: string
          internet_reachable: boolean
          is_active: boolean
          is_new_user: boolean
          last_login_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          discipline?: Database["public"]["Enums"]["discipline_type"] | null
          email: string
          email_verified?: boolean
          full_name: string
          id: string
          internet_reachable?: boolean
          is_active?: boolean
          is_new_user?: boolean
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          discipline?: Database["public"]["Enums"]["discipline_type"] | null
          email?: string
          email_verified?: boolean
          full_name?: string
          id?: string
          internet_reachable?: boolean
          is_active?: boolean
          is_new_user?: boolean
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["workspace_member_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_member_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_member_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_personal: boolean
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_personal?: boolean
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_personal?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      global_search_entities:
        | {
            Args: {
              date_from?: string
              date_to?: string
              filter_hardware_id?: string
              filter_project_id?: string
              filter_status?: string
              filter_tag?: string
              result_limit?: number
              search_query: string
            }
            Returns: {
              entity_id: string
              entity_type: string
              project_id: string
              project_title: string
              rank: number
              snippet: string
              title: string
            }[]
          }
        | {
            Args: {
              date_from?: string
              date_to?: string
              filter_hardware_id?: string
              filter_project_id?: string
              filter_status?: string
              filter_tags?: string[]
              result_limit?: number
              search_query: string
            }
            Returns: {
              entity_id: string
              entity_type: string
              project_id: string
              project_title: string
              rank: number
              snippet: string
              title: string
            }[]
          }
      is_workspace_member: {
        Args: { target_workspace: string }
        Returns: boolean
      }
    }
    Enums: {
      ai_request_type: "summary" | "tag_suggestion" | "code_analysis"
      app_role: "student" | "researcher" | "educator"
      billing_cycle: "monthly" | "yearly"
      discipline_type:
        | "mechanical"
        | "electrical"
        | "civil"
        | "software"
        | "chemical"
        | "other"
      entity_tag_type: "note" | "experiment" | "task" | "project"
      experiment_status: "pending" | "in_progress" | "completed" | "failed"
      hardware_category: "MCU" | "Sensor" | "Actuator" | "Module" | "Tool"
      hardware_status: "available" | "in_use" | "maintenance" | "depleted"
      note_type: "general" | "lab" | "theory" | "code"
      payment_provider: "stripe" | "apple" | "google"
      payment_status: "pending" | "succeeded" | "failed"
      priority_level: "low" | "medium" | "high" | "critical"
      project_status: "active" | "completed" | "archived"
      reminder_status: "pending" | "sent" | "dismissed"
      subscription_plan: "free" | "pro" | "team"
      sync_operation: "create" | "update" | "delete"
      sync_status: "pending" | "synced" | "failed"
      task_status: "todo" | "in_progress" | "done"
      workspace_member_role: "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ai_request_type: ["summary", "tag_suggestion", "code_analysis"],
      app_role: ["student", "researcher", "educator"],
      billing_cycle: ["monthly", "yearly"],
      discipline_type: [
        "mechanical",
        "electrical",
        "civil",
        "software",
        "chemical",
        "other",
      ],
      entity_tag_type: ["note", "experiment", "task", "project"],
      experiment_status: ["pending", "in_progress", "completed", "failed"],
      hardware_category: ["MCU", "Sensor", "Actuator", "Module", "Tool"],
      hardware_status: ["available", "in_use", "maintenance", "depleted"],
      note_type: ["general", "lab", "theory", "code"],
      payment_provider: ["stripe", "apple", "google"],
      payment_status: ["pending", "succeeded", "failed"],
      priority_level: ["low", "medium", "high", "critical"],
      project_status: ["active", "completed", "archived"],
      reminder_status: ["pending", "sent", "dismissed"],
      subscription_plan: ["free", "pro", "team"],
      sync_operation: ["create", "update", "delete"],
      sync_status: ["pending", "synced", "failed"],
      task_status: ["todo", "in_progress", "done"],
      workspace_member_role: ["admin", "member", "viewer"],
    },
  },
} as const
