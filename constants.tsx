
import React from 'react';
import { ShoppingCart, FileText, Smartphone, Globe, Code, ShieldCheck } from 'lucide-react';
import { Category, User, UserRole } from './types';

// Fix: Added missing requiredFields property to each category object
export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Document Verification', description: 'Official document verification services.', price: 50, isActive: true, icon: 'FileText', requiredFields: [] },
  { id: 'cat-2', name: 'Digital Identity', description: 'Personal branding and ID kits.', price: 120, isActive: true, icon: 'ShieldCheck', requiredFields: [] },
  { id: 'cat-3', name: 'Web Scraping', description: 'Custom data extraction tasks.', price: 200, isActive: true, icon: 'Globe', requiredFields: [] },
  { id: 'cat-4', name: 'App Testing', description: 'Manual QA for mobile applications.', price: 150, isActive: true, icon: 'Smartphone', requiredFields: [] },
];

export const MOCK_ADMIN: User = {
  id: 'U-ADMIN-01',
  name: 'System Administrator',
  email: 'admin@omniwallet.com',
  walletBalance: 0,
  role: UserRole.ADMIN,
  isBlocked: false,
  twoFactorEnabled: true,
  emailVerified: true,
  createdAt: Date.now(),
};

export const MOCK_USER: User = {
  id: 'U-8271',
  name: 'John Doe',
  email: 'john@example.com',
  walletBalance: 250,
  role: UserRole.USER,
  isBlocked: false,
  twoFactorEnabled: false,
  emailVerified: true,
  createdAt: Date.now(),
};

export const IconMap: Record<string, React.ElementType> = {
  ShoppingCart,
  FileText,
  Smartphone,
  Globe,
  Code,
  ShieldCheck
};
