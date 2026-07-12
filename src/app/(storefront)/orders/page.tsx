'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { orderLookupSchema, type OrderLookupInput } from '@/lib/checkout/validation';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OrderDetails {
  id: string;
  order_number: string;
  customer_email: string;
  customer_full_name: string;
  status: string;
  total_cents: number;
  placed_at: string;
  shipped_at?: string;
  delivered_at?: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price_cents: number;
    image_url?: string;
  }>;
  order_status_history: Array<{
    id: string;
    from_status: string;
    to_status: string;
    created_at: string;
    note?: string;
  }>;
}

async function lookupOrder(formData: OrderLookupInput): Promise<OrderDetails | null> {
  const response = await fetch('/api/orders/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to lookup order');
  }

  return response.json();
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending_payment: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Payment' },
    paid: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shipped' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
  };

  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

export default function OrderTrackingPage() {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const form = useForm<OrderLookupInput>({
    resolver: zodResolver(orderLookupSchema),
    defaultValues: {
      orderNumber: '',
      email: '',
    },
  });

  const onSubmit = async (data: OrderLookupInput) => {
    setIsLoading(true);
    setSearched(true);

    try {
      const result = await lookupOrder(data);

      if (result) {
        setOrder(result);
        toast.success('Order found!');
      } else {
        setOrder(null);
        toast.error('Order not found. Please check your order number and email.');
      }
    } catch (error) {
      console.error('Lookup error:', error);
      toast.error('Failed to lookup order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Track Your Order</h1>
          <p className="text-xl text-gray-600">
            Enter your order number and email address to track your shipment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Lookup Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Order Lookup</h2>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number</FormLabel>
                    <FormControl>
                      <Input placeholder="FC-2026-000123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Find My Order'}
              </Button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                💡 You can find your order number in your confirmation email. We'll keep your
                order details private.
              </p>
            </div>
          </div>

          {/* Order Details */}
          {searched && (
            <div>
              {order ? (
                <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Order #{order.order_number}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date</span>
                        <span>{new Date(order.placed_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total</span>
                        <span className="font-semibold">
                          KES {(order.total_cents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Items</h4>
                    <div className="space-y-3">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          {item.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product_name}</p>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Timeline</h4>
                    <div className="space-y-3 text-sm">
                      {order.order_status_history.map((history, index) => (
                        <div key={history.id} className="flex gap-3">
                          <div className="w-3 h-3 rounded-full bg-black mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">
                              {history.to_status.replace(/_/g, ' ').toUpperCase()}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {new Date(history.created_at).toLocaleString()}
                            </p>
                            {history.note && (
                              <p className="text-gray-600 text-xs">{history.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <p className="text-lg font-semibold text-gray-900 mb-2">Order Not Found</p>
                  <p className="text-gray-600 mb-6">
                    Please double-check your order number and email address
                  </p>
                  <p className="text-sm text-gray-500">
                    Still need help? Contact us at support@fashionandco.com
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
