export interface MenuItem {
    id: string | number;
    name: string;
    price: number;
    originalPrice?: number | null;
    category: string;
    image?: string;
    imageAlt?: string;
    available?: boolean;
    isPopular?: boolean;
    is_hot_drink?: boolean;
    kds_routing_logic?: string;
    allow_notes?: boolean;
    db_category?: string;
    calories?: number;
    description?: string | null;
    options?: any[];
}

export interface CartItem extends MenuItem {
    uniqueId?: string;
    tempId?: string | number;
    quantity: number;
    selectedOptions?: any[];
    notes?: string;
    signature?: string;
    isDelayed?: boolean;
}

export interface Category {
    id: string;
    name: string;
    name_he?: string;
    db_name?: string;
    icon?: string;
    position?: number;
}

export interface Customer {
    id?: string;
    phone?: string | null;
    name?: string;
    loyalty_coffee_count?: number;
}
