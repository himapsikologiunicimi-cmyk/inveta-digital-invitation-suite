-- Create order_status enum
CREATE TYPE public.order_status AS ENUM ('pending_payment', 'payment_received', 'in_progress', 'completed');

-- Create orders table for tracking customer orders and payments
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  couple_names TEXT NOT NULL,
  couple_photo_url TEXT,
  theme_id INTEGER NOT NULL,
  theme_name TEXT NOT NULL,
  payment_proof_url TEXT,
  payment_amount DECIMAL(12,2),
  payment_date TIMESTAMP WITH TIME ZONE,
  status order_status NOT NULL DEFAULT 'pending_payment',
  invitation_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admin can manage all orders
CREATE POLICY "Admins can manage all orders"
ON public.orders
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for order photos
INSERT INTO storage.buckets (id, name, public) VALUES ('order-photos', 'order-photos', true);

-- Storage policies for order photos
CREATE POLICY "Order photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'order-photos');

CREATE POLICY "Admins can upload order photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'order-photos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update order photos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'order-photos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete order photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'order-photos' AND has_role(auth.uid(), 'admin'));