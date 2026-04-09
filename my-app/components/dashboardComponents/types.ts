export interface DBUser {
  id: string;
  client_name: string;
  is_admin: number;
  user_uuid: string;
  role: number;
}

export interface DBTicket {
  id: string;
  title: string;
  contact_details: string;
  ticket_details: string;
  client_name: string;
  user_uuid: string;
}

export interface DBOrder {
  id: string;
  order_title: string;
  description: string;
  price: string;
  tracking_number: string;
  user_uuid: string;
}

export interface DBPlan {
  id: string;
  description: string;
  price: number;
  user_uuid: string;
  robots_allocated?: number;
  robots_shipped?: number;
}