"use client";

import { ReactNode } from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function ReceiptsListLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}