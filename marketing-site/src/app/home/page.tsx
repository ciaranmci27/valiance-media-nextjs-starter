'use client';

import React from 'react';
import { PageWrapper } from '@/components/PageWrapper';

export default function HomePage() {
  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Valiance Media</h1>
          <p className="text-lg text-gray-600 mb-8">
            In-House Software & E-commerce Innovation
          </p>
          <p className="text-base text-gray-500">
            This is the marketing website built with Next.js.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}