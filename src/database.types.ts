export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "10.2.0 (e07807d)"
  }
  public: {
    Tables: {
      photos: {
        Row: {
          created_at: string | null;
          file_path: string | null;
          file_url: string | null;
          id: string;
          msl: string | null;
          name: string | null;
          property_id: string | null;
          user_id: string | null;
        }
        Insert: {
          created_at?: string | null;
          file_path?: string | null;
          file_url?: string | null;
          id?: string;
          msl?: string | null;
          name?: string | null;
          property_id?: string | null;
          user_id?: string | null;
        }
        Update: {
          created_at?: string | null;
          file_path?: string | null;
          file_url?: string | null;
          id?: string;
          msl?: string | null;
          name?: string | null;
          property_id?: string | null;
          user_id?: string | null;
        }
        Relationships: [
          {
            foreignKeyName: "photos_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties_preview";
            referencedColumns: ["id"];
          }
        ];
      }
      properties: {
        Row: {
          address: string | null;
          baths: number | null;
          beds: number | null;
          building_size: number | null;
          building_style: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          contact_realtor: string | null;
          created_at: string;
          description: string | null;
          features: Json | null;
          fees: number | null;
          half_baths: number | null;
          id: string;
          is_active: boolean;
          land_use: string | null;
          location: Json | null;
          lot_size: number | null;
          msl: string;
          parking_spaces: number | null;
          price: number | null;
          property_for: Json | null;
          rent: number | null;
          rooms: number | null;
          taxes: number | null;
          updated_at: string;
          user_id: string | null;
          year_built: number | null;
        }
        Insert: {
          address?: string | null;
          baths?: number | null;
          beds?: number | null;
          building_size?: number | null;
          building_style?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_realtor?: string | null;
          created_at?: string;
          description?: string | null;
          features?: Json | null;
          fees?: number | null;
          half_baths?: number | null;
          id?: string;
          is_active?: boolean;
          land_use?: string | null;
          location?: Json | null;
          lot_size?: number | null;
          msl: string;
          parking_spaces?: number | null;
          price?: number | null;
          property_for?: Json | null;
          rent?: number | null;
          rooms?: number | null;
          taxes?: number | null;
          updated_at?: string;
          user_id?: string | null;
          year_built?: number | null;
        }
        Update: {
          address?: string | null;
          baths?: number | null;
          beds?: number | null;
          building_size?: number | null;
          building_style?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_realtor?: string | null;
          created_at?: string;
          description?: string | null;
          features?: Json | null;
          fees?: number | null;
          half_baths?: number | null;
          id?: string;
          is_active?: boolean;
          land_use?: string | null;
          location?: Json | null;
          lot_size?: number | null;
          msl?: string;
          parking_spaces?: number | null;
          price?: number | null;
          property_for?: Json | null;
          rent?: number | null;
          rooms?: number | null;
          taxes?: number | null;
          updated_at?: string;
          user_id?: string | null;
          year_built?: number | null;
        }
        Relationships: [];
      }
      inquiries: {
        Row: {
          id: string;
          created_at: string;
          property_id: string;
          name: string;
          phone: string;
          email: string;
          message: string | null;
          status: 'new' | 'contacted' | 'closed';
        };
        Insert: {
          id?: string;
          created_at?: string;
          property_id: string;
          name: string;
          phone: string;
          email: string;
          message?: string | null;
          status?: 'new' | 'contacted' | 'closed';
        };
        Update: {
          id?: string;
          created_at?: string;
          property_id?: string;
          name?: string;
          phone?: string;
          email?: string;
          message?: string | null;
          status?: 'new' | 'contacted' | 'closed';
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
    }
    Views: {
      properties_preview: {
        Row: {
          address: string | null;
          baths: number | null;
          beds: number | null;
          building_size: number | null;
          building_style: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          contact_realtor: string | null;
          created_at: string | null;
          description: string | null;
          features: Json | null;
          fees: number | null;
          half_baths: number | null;
          id: string | null;
          is_active: boolean | null;
          land_use: string | null;
          location: Json | null;
          lot_size: number | null;
          msl: string | null;
          parking_spaces: number | null;
          photo: string | null;
          price: number | null;
          property_for: Json | null;
          rent: number | null;
          rooms: number | null;
          taxes: number | null;
          updated_at: string | null;
          user_id: string | null;
          year_built: number | null;
        }
        Insert: {
          address?: string | null;
          baths?: number | null;
          beds?: number | null;
          building_size?: number | null;
          building_style?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_realtor?: string | null;
          created_at?: string | null;
          description?: string | null;
          features?: Json | null;
          fees?: number | null;
          half_baths?: number | null;
          id?: string | null;
          is_active?: boolean | null;
          land_use?: string | null;
          location?: Json | null;
          lot_size?: number | null;
          msl?: string | null;
          parking_spaces?: number | null;
          photo?: never;
          price?: number | null;
          property_for?: Json | null;
          rent?: number | null;
          rooms?: number | null;
          taxes?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
          year_built?: number | null;
        }
        Update: {
          address?: string | null;
          baths?: number | null;
          beds?: number | null;
          building_size?: number | null;
          building_style?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          contact_realtor?: string | null;
          created_at?: string | null;
          description?: string | null;
          features?: Json | null;
          fees?: number | null;
          half_baths?: number | null;
          id?: string | null;
          is_active?: boolean | null;
          land_use?: string | null;
          location?: Json | null;
          lot_size?: number | null;
          msl?: string | null;
          parking_spaces?: number | null;
          photo?: never;
          price?: number | null;
          property_for?: Json | null;
          rent?: number | null;
          rooms?: number | null;
          taxes?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
          year_built?: number | null;
        }
        Relationships: [];
      }
    }
    Functions: {
      confirm_property_msl_reservation: {
        Args: { p_reservation_token: string; p_msl: string };
        Returns: boolean;
      };
      delete_claim: {
        Args: { uid: string; claim: string };
        Returns: string;
      }
      get_claim: {
        Args: { uid: string; claim: string };
        Returns: Json;
      }
      get_claims: {
        Args: { uid: string };
        Returns: Json;
      }
      get_my_claim: {
        Args: { claim: string };
        Returns: Json;
      }
      get_my_claims: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      }
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      }
      is_claims_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      }
      jsonb_array_overlaps: {
        Args: { jsonb_array: Json; text_array: string[] };
        Returns: boolean;
      }
      set_claim: {
        Args: { uid: string; claim: string; value: Json };
        Returns: string;
      }
      reserve_property_msl: {
        Args: { p_reservation_token: string | null };
        Returns: {
          msl: string;
          reservation_token: string;
        }[];
      }
    }
    Enums: {
      [_ in never]: never;
    }
    CompositeTypes: {
      [_ in never]: never;
    }
  }
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

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
    : never;

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
    : never;

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
    : never;

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
    : never;

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
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;