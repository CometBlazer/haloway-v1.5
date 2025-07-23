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
			activities: {
				Row: {
					id: string;
					user_id: string;
					activity_type: string;
					organization_name: string | null;
					position_description: string | null;
					activity_description: string | null;
					participation_levels: Json;
					timing_of_participation: Json;
					hours_per_week: number;
					weeks_per_year: number;
					college_participation: boolean;
					sort_order: number;
					created_at: Date;
					updated_at: Date;
				};
				Insert: {
					id?: string;
					user_id: string;
					activity_type: string;
					organization_name?: string | null;
					position_description?: string | null;
					activity_description?: string | null;
					participation_levels?: Json;
					timing_of_participation?: Json;
					hours_per_week?: number;
					weeks_per_year?: number;
					college_participation?: boolean;
					sort_order?: number;
					created_at?: Date;
					updated_at?: Date;
				};
				Update: {
					id?: string;
					user_id?: string;
					activity_type?: string;
					organization_name?: string | null;
					position_description?: string | null;
					activity_description?: string | null;
					participation_levels?: Json;
					timing_of_participation?: Json;
					hours_per_week?: number;
					weeks_per_year?: number;
					college_participation?: boolean;
					sort_order?: number;
					created_at?: Date;
					updated_at?: Date;
				};
				Relationships: [
					{
						foreignKeyName: 'activities_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
				];
			};
			contact_messages: {
				Row: {
					id: string;
					name: string | null;
					email: string | null;
					subject: string | null;
					body: string | null;
					created_at: Date | null;
					updated_at: Date | null;
				};
				Insert: {
					id?: string;
					name?: string | null;
					email?: string | null;
					subject?: string | null;
					body?: string | null;
					created_at?: Date | null;
					updated_at?: Date | null;
				};
				Update: {
					id?: string;
					name?: string | null;
					email?: string | null;
					subject?: string | null;
					body?: string | null;
					created_at?: Date | null;
					updated_at?: Date | null;
				};
				Relationships: [];
			};
			contact_requests: {
				Row: {
					id: string;
					first_name: string | null;
					last_name: string | null;
					email: string | null;
					phone: string | null;
					company_name: string | null;
					message_body: string | null;
					updated_at: Date | null;
				};
				Insert: {
					id?: string;
					first_name?: string | null;
					last_name?: string | null;
					email?: string | null;
					phone?: string | null;
					company_name?: string | null;
					message_body?: string | null;
					updated_at?: Date | null;
				};
				Update: {
					id?: string;
					first_name?: string | null;
					last_name?: string | null;
					email?: string | null;
					phone?: string | null;
					company_name?: string | null;
					message_body?: string | null;
					updated_at?: Date | null;
				};
				Relationships: [];
			};
			document_tags: {
				Row: {
					document_id: string;
					tag_id: string;
					created_at: Date | null;
					updated_at: Date | null;
				};
				Insert: {
					document_id: string;
					tag_id: string;
					created_at: Date | null;
					updated_at: Date | null;
				};
				Update: {
					document_id?: string;
					tag_id?: string;
					created_at?: Date | null;
					updated_at?: Date | null;
				};
				Relationships: [
					{
						foreignKeyName: 'document_tags_document_id_fkey';
						columns: ['document_id'];
						referencedRelation: 'documents';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'document_tags_tag_id_fkey';
						columns: ['tag_id'];
						referencedRelation: 'tags';
						referencedColumns: ['id'];
					},
				];
			};
			document_versions: {
				Row: {
					id: string;
					document_id: string | null;
					content: Json;
					created_by: string | null;
					created_at: Date | null;
					updated_at: Date | null; // Added updated_at field
					version_name: string;
					latest_ai_response: string | null; // Added latest_ai_response field
				};
				Insert: {
					id?: string;
					document_id?: string | null;
					content: Json;
					created_by?: string | null;
					created_at?: Date | null;
					updated_at?: Date | null;
					version_name?: string;
					latest_ai_response?: string | null;
				};
				Update: {
					id?: string;
					document_id?: string | null;
					content?: Json;
					created_by?: string | null;
					created_at?: Date | null;
					updated_at?: Date | null;
					version_name?: string;
					latest_ai_response?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'document_versions_created_by_fkey';
						columns: ['created_by'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'document_versions_document_id_fkey';
						columns: ['document_id'];
						referencedRelation: 'documents';
						referencedColumns: ['id'];
					},
				];
			};
			documents: {
				Row: {
					id: string;
					user_id: string | null;
					title: string | null;
					prompt: string | null;
					status: string | null;
					due_date: Date | null;
					created_at: Date | null;
					updated_at: Date | null;
					current_version_id: string | null;
					word_count_limit: number | null;
					school: string;
					chatbot_messages: Json | null;
				};
				Insert: {
					id?: string;
					user_id?: string | null;
					title?: string | null;
					prompt?: string | null;
					status?: string | null;
					due_date?: Date | null;
					created_at?: Date | null;
					updated_at?: Date | null;
					current_version_id?: string | null;
					word_count_limit?: number | null;
					school?: string;
					chatbot_messages?: Json | null;
				};
				Update: {
					id?: string;
					user_id?: string | null;
					title?: string | null;
					prompt?: string | null;
					status?: string | null;
					due_date?: Date | null;
					created_at?: Date | null;
					updated_at?: Date | null;
					current_version_id?: string | null;
					word_count_limit?: number | null;
					school?: string;
					chatbot_messages?: Json | null;
				};
				Relationships: [
					{
						foreignKeyName: 'documents_current_version_id_fkey';
						columns: ['current_version_id'];
						referencedRelation: 'document_versions';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'documents_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
				];
			};
			profiles: {
				Row: {
					id: string;
					updated_at: Date | null;
					full_name: string | null;
					avatar_url: string | null;
					graduation_year: number | null;
					dream_school: string | null;
					referral_source: string | null;
					unsubscribed: boolean;
				};
				Insert: {
					id: string;
					updated_at?: Date | null;
					full_name?: string | null;
					avatar_url?: string | null;
					graduation_year?: number | null;
					dream_school?: string | null;
					referral_source?: string | null;
					unsubscribed: boolean;
				};
				Update: {
					id?: string;
					updated_at?: Date | null;
					full_name?: string | null;
					avatar_url?: string | null;
					graduation_year?: number | null;
					dream_school?: string | null;
					referral_source?: string | null;
					unsubscribed?: boolean;
				};
				Relationships: [
					{
						foreignKeyName: 'profiles_id_fkey';
						columns: ['id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
				];
			};
			schools: {
				Row: {
					id: string;
					name: string;
					url_safe_name: string;
					image_url: string | null;
					created_at: Date | null;
					updated_at: Date | null;
				};
				Insert: {
					id?: string;
					name: string;
					url_safe_name: string;
					image_url?: string | null;
					created_at?: Date | null;
					updated_at?: Date | null;
				};
				Update: {
					id?: string;
					name?: string;
					url_safe_name?: string;
					image_url?: string | null;
					created_at?: Date | null;
					updated_at?: Date | null;
				};
				Relationships: [];
			};
			stripe_customers: {
				Row: {
					user_id: string;
					updated_at: Date | null;
					stripe_customer_id: string | null;
				};
				Insert: {
					user_id: string;
					updated_at?: Date | null;
					stripe_customer_id?: string | null;
				};
				Update: {
					user_id?: string;
					updated_at?: Date | null;
					stripe_customer_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'stripe_customers_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
				];
			};
			tags: {
				Row: {
					id: string;
					type: string;
					label: string;
					created_at: Date | null;
					updated_at: Date | null;
					color: string;
					created_by: string | null;
				};
				Insert: {
					id?: string;
					type: string;
					label: string;
					created_at?: Date | null;
					updated_at?: Date | null;
					color?: string;
					created_by?: string | null;
				};
				Update: {
					id?: string;
					type?: string;
					label?: string;
					created_at?: Date | null;
					updated_at?: Date | null;
					color?: string;
					created_by?: string | null;
				};
				Relationships: [];
			};
			user_products: {
				Row: {
					user_id: string;
					type: string;
					stripe_product_id: string;
					created_at: Date;
					updated_at: Date | null;
				};
				Insert: {
					user_id: string;
					type: string;
					stripe_product_id: string;
					created_at?: Date;
					updated_at?: Date | null;
				};
				Update: {
					user_id?: string;
					type?: string;
					stripe_product_id?: string;
					created_at?: Date;
					updated_at?: Date | null;
				};
				Relationships: [
					{
						foreignKeyName: 'user_products_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			user_password_set: {
				Args: Record<PropertyKey, never>;
				Returns: boolean;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}

// Additional type helpers for your components
export type DocumentVersion =
	Database['public']['Tables']['document_versions']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type School = Database['public']['Tables']['schools']['Row'];
export type Activity = Database['public']['Tables']['activities']['Row'];
// Updated Document type with chatbot_messages
export type DocumentWithChat =
	Database['public']['Tables']['documents']['Row'] & {
		chatbot_messages: ChatMessage[] | null;
	};

// Type for your component usage (with field transformations)
export interface ComponentTag {
	id: string;
	name: string; // Transformed from 'label'
	color: string;
	type?: string;
	created_at?: Date | null;
	updated_at?: Date | null;
	created_by?: string | null;
}

// Chat message type for the chatbot_messages JSON field
export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: string;
}

// Type for version data as used in your components - updated to include updated_at, removed word_count
export interface ComponentVersion {
	id: string;
	version_name: string;
	created_at: string; // ISO string for component usage
	updated_at: string; // Added updated_at field
	created_by: string;
	document_id?: string | null;
	content?: Json;
	latest_ai_response?: string | null; // Added latest_ai_response field
}
