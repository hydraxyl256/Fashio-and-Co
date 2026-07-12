'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CheckoutFormData } from '@/lib/checkout/validation';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeliveryZone {
  id: string;
  name: string;
  country: string;
  region?: string;
}

interface DeliveryRate {
  id: string;
  name: string;
  pricePercentage: number;
  description?: string;
  etaMinDays?: number;
  etaMaxDays?: number;
}

interface CheckoutStepDeliveryProps {
  form: UseFormReturn<CheckoutFormData>;
}

export function CheckoutStepDelivery({ form }: CheckoutStepDeliveryProps) {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [rates, setRates] = useState<DeliveryRate[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingRates, setLoadingRates] = useState(false);

  const selectedZoneId = form.watch('deliveryZoneId');

  // Fetch delivery zones on mount
  useEffect(() => {
    async function fetchZones() {
      try {
        const response = await fetch('/api/checkout/delivery-zones');
        if (response.ok) {
          const data = await response.json();
          setZones(data);
        }
      } catch (error) {
        console.error('Failed to fetch delivery zones:', error);
      } finally {
        setLoadingZones(false);
      }
    }

    fetchZones();
  }, []);

  // Fetch delivery rates when zone changes
  useEffect(() => {
    if (!selectedZoneId) {
      setRates([]);
      return;
    }

    async function fetchRates() {
      setLoadingRates(true);
      try {
        const response = await fetch(`/api/checkout/delivery-rates?zoneId=${selectedZoneId}`);
        if (response.ok) {
          const data = await response.json();
          setRates(data);
          // Auto-select first rate
          if (data.length > 0) {
            form.setValue('deliveryRateId', data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch delivery rates:', error);
      } finally {
        setLoadingRates(false);
      }
    }

    fetchRates();
  }, [selectedZoneId, form]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Delivery Options</h2>
        <p className="text-gray-600">Select your preferred delivery zone and method</p>
      </div>

      <FormField
        control={form.control}
        name="deliveryZoneId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Delivery Zone</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange} disabled={loadingZones}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingZones ? 'Loading zones...' : 'Select a zone'} />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                      {zone.region ? ` (${zone.region})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedZoneId && (
        <FormField
          control={form.control}
          name="deliveryRateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Method</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loadingRates || rates.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingRates ? 'Loading options...' : 'Select delivery method'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {rates.map((rate) => (
                      <SelectItem key={rate.id} value={rate.id}>
                        <div className="flex items-center gap-2">
                          <span>{rate.name}</span>
                          {rate.pricePercentage > 0 && (
                            <span className="text-gray-500">
                              + KES {(rate.pricePercentage).toFixed(0)}
                            </span>
                          )}
                          {rate.etaMinDays && (
                            <span className="text-xs text-gray-400">
                              ({rate.etaMinDays}-{rate.etaMaxDays} days)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
