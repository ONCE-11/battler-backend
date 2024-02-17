export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      abilities: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          metadata: Json | null;
          name: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          metadata?: Json | null;
          name: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          metadata?: Json | null;
          name?: string;
        };
        Relationships: [];
      };
      characters: {
        Row: {
          ability_1_id: string | null;
          ability_2_id: string | null;
          ability_3_id: string | null;
          accessory_item_id: string | null;
          alive: boolean;
          attack: number;
          attack_item_id: string | null;
          consumable_id: string | null;
          created_at: string;
          current_health: number;
          defense: number;
          defense_item_id: string | null;
          id: string;
          max_health: number;
          user_id: string;
        };
        Insert: {
          ability_1_id?: string | null;
          ability_2_id?: string | null;
          ability_3_id?: string | null;
          accessory_item_id?: string | null;
          alive?: boolean;
          attack: number;
          attack_item_id?: string | null;
          consumable_id?: string | null;
          created_at?: string;
          current_health: number;
          defense: number;
          defense_item_id?: string | null;
          id?: string;
          max_health: number;
          user_id: string;
        };
        Update: {
          ability_1_id?: string | null;
          ability_2_id?: string | null;
          ability_3_id?: string | null;
          accessory_item_id?: string | null;
          alive?: boolean;
          attack?: number;
          attack_item_id?: string | null;
          consumable_id?: string | null;
          created_at?: string;
          current_health?: number;
          defense?: number;
          defense_item_id?: string | null;
          id?: string;
          max_health?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "characters_ability_1_id_fkey";
            columns: ["ability_1_id"];
            isOneToOne: false;
            referencedRelation: "abilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "characters_ability_2_id_fkey";
            columns: ["ability_2_id"];
            isOneToOne: false;
            referencedRelation: "abilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "characters_ability_3_id_fkey";
            columns: ["ability_3_id"];
            isOneToOne: false;
            referencedRelation: "abilities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "characters_accessory_item_id_fkey";
            columns: ["accessory_item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "characters_attack_item_id_fkey";
            columns: ["attack_item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "characters_consumable_id_fkey";
            columns: ["consumable_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "characters_defense_item_id_fkey";
            columns: ["defense_item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "characters_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      fights: {
        Row: {
          created_at: string;
          id: string;
          player1_id: string;
          player2_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          player1_id: string;
          player2_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          player1_id?: string;
          player2_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fights_player1_id_fkey";
            columns: ["player1_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fights_player2_id_fkey";
            columns: ["player2_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          }
        ];
      };
      inventories: {
        Row: {
          character_id: string;
          created_at: string;
          id: string;
          item_id: string;
        };
        Insert: {
          character_id: string;
          created_at?: string;
          id?: string;
          item_id: string;
        };
        Update: {
          character_id?: string;
          created_at?: string;
          id?: string;
          item_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventories_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventories_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "items";
            referencedColumns: ["id"];
          }
        ];
      };
      items: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          item_type: Database["public"]["Enums"]["item_type"];
          metadata: Json | null;
          name: string;
          price: number;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          item_type: Database["public"]["Enums"]["item_type"];
          metadata?: Json | null;
          name: string;
          price?: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          item_type?: Database["public"]["Enums"]["item_type"];
          metadata?: Json | null;
          name?: string;
          price?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          first_name: string | null;
          id: string;
          last_name: string | null;
          pesos: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          pesos?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          pesos?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      item_type: "attack" | "defense" | "accessory" | "consumable";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;
