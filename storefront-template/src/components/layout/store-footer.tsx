'use client';

import React from 'react';
import Link from 'next/link';
import { StorefrontResolvedData } from '@/lib/types';

interface StoreFooterProps {
  store: StorefrontResolvedData;
}

export function StoreFooter({ store }: StoreFooterProps) {
  const { storefrontConfig, themeConfig } = store;
  const { footer, navigation } = storefrontConfig;

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: About & Brand */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {store.name}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {footer?.aboutText || 'Leading online retail store bringing you high-quality products, verified durability, and fast delivery.'}
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Navigation</h4>
          <ul className="space-y-2 text-sm">
            {navigation?.map((nav, index) => (
              <li key={index}>
                <Link href={nav.href} className="text-gray-400 hover:text-white transition-colors">
                  {nav.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Customer Support & Contact */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Customer Support</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <p><span className="text-gray-200 font-medium">Email:</span> {footer?.email || 'support@store.com'}</p>
            <p><span className="text-gray-200 font-medium">Phone:</span> {footer?.phone || '+1 (800) 555-0199'}</p>
            <p><span className="text-gray-200 font-medium">Address:</span> {footer?.address || '100 E-Commerce Ave, CA 90210'}</p>
          </div>
        </div>

        {/* Col 4: Social Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Connect With Us</h4>
          <div className="flex items-center gap-4 text-sm">
            {footer?.socialLinks?.facebook && (
              <a
                href={footer.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              >
                Facebook
              </a>
            )}
            {footer?.socialLinks?.instagram && (
              <a
                href={footer.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              >
                Instagram
              </a>
            )}
            {footer?.socialLinks?.twitter && (
              <a
                href={footer.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              >
                Twitter
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="border-t border-gray-800/80 py-6 text-center text-xs text-gray-500">
        <p>{footer?.copyrightText || `© ${new Date().getFullYear()} ${store.name}. All rights reserved.`}</p>
      </div>
    </footer>
  );
}
