export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  images: string[];
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  discount?: number;
  stock?: number;

  // Luxury Perfume Specifics
  notes?: {
    top: string[];
    heart: string[];
    base: string[];
  };
  intensity?: 'Light' | 'Moderate' | 'Intense';
  longevity?: string;
  sillage?: string;

  // Variants
  variants?: {
    size: string;
    price: number;
    stock?: number;
  }[];

  // Legacy support
  sizes?: string[];
  colors?: string[];
}
export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  avatar?: string;
}
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  shippingAddress: Address;
  paymentMethod: string;
}
export interface Address {
  street?: string;
  address?: string; // Alias for street
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}
export interface CheckoutState {
  step: 'shipping' | 'payment' | 'review' | 'payment_processing' | 'confirmation';
  shippingAddress: Address | null;
  paymentMethod: string | null;
}
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}