// components/dashboardComponents/types.ts

export interface DBUser {
  id: string;
  client_name: string;
  is_admin: number;
  user_uuid: string;
  role: number;
  created_at?: string;
  email?: string;
  phone?: string;
  address?: string;
  company_name?: string;
}

export interface DBTicket {
  id: string;
  title: string;
  contact_details: string;
  ticket_details: string;
  client_name: string;
  user_uuid: string;
  resolved: number;
  created_at?: string;
}

export interface DBOrder {
  id: string;
  order_title: string;
  description: string;
  price: string;
  tracking_number: string;
  user_uuid: string;
  created_at?: string;
}

export interface DBPlan {
  id: string;
  user_uuid: string;
  robots_shipped: number;
  price: number;
  robots_allocated: number;
  description: string;
  created_at: string;
  curriculums_allocated?: number;
  curricumlums_used?: number;
}