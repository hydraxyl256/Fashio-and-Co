'use client';

import * as React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ProductTabsProps {
  product: {
    name: string;
    fullDescription: string | null;
    careInstructions: string | null;
    fitNotes: string | null;
  };
  materials: string[];
  sizeGuide?: { title: string; body: string } | null;
  delivery: string;
  returns: string;
}

export function ProductTabs({ product, materials, sizeGuide, delivery, returns }: ProductTabsProps) {
  return (
    <Tabs defaultValue="details" className="mt-16">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="materials">Materials</TabsTrigger>
        <TabsTrigger value="sizing">Sizing</TabsTrigger>
        <TabsTrigger value="delivery">Delivery & returns</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <Section title={`About the ${product.name}`}>
          {product.fullDescription ?? 'No further description.'}
        </Section>
        {product.careInstructions ? (
          <Section title="Care">{product.careInstructions}</Section>
        ) : null}
        {product.fitNotes ? <Section title="Fit notes">{product.fitNotes}</Section> : null}
      </TabsContent>
      <TabsContent value="materials">
        <Section title="Material composition">
          {materials.length > 0 ? (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {materials.map((m) => (
                <li key={m}>· {m}</li>
              ))}
            </ul>
          ) : (
            'No material information on file.'
          )}
        </Section>
      </TabsContent>
      <TabsContent value="sizing">
        <Section title="Sizing">
          {sizeGuide
            ? `${sizeGuide.title} — ${sizeGuide.body}`
            : 'Detailed measurements are listed in the size guide above. Please contact the atelier if you would like a bespoke fitting.'}
        </Section>
      </TabsContent>
      <TabsContent value="delivery">
        <Section title="Delivery">{delivery}</Section>
        <Section title="Returns">{returns}</Section>
      </TabsContent>
    </Tabs>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={cn('py-4 text-sm leading-relaxed text-muted-foreground')}>
      <p className="eyebrow mb-2 text-foreground">{title}</p>
      {children}
    </section>
  );
}
