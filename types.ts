
export enum OrderStatus {
  PENDING = 'Pending',
  RECEIVED = 'Received',
  APPROVED = 'Approved',
  CANCELLED = 'Cancelled'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum AdminTab {
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  USERS = 'USERS',
  PREVIEW = 'PREVIEW'
}

export interface DeviceDetails {
  ip: string;
  deviceName: string;
  imei: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  network: {
    type: string;
    downlink: number;
    effectiveType: string;
  };
  userAgent: string;
}

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  password?: string;
  mobile?: string;
  dob?: string;
  nid?: string;
  language?: 'bn' | 'en';
  avatar?: string;
  walletBalance: number;
  role: UserRole;
  isBlocked: boolean;
  failedLoginAttempts?: number;
  autoBlockedUntil?: number | null;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  createdAt: number;
  deviceDetails?: DeviceDetails;
}

export interface CustomFieldRequirement {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
}

export interface OrderFile {
  name: string;
  type: string;
  data: string;
  uploadedAt: number;
}

export interface Order {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  status: OrderStatus;
  comment: string;
  userComment?: string;
  createdAt: number;
  approvalTimestamp?: number;
  files?: OrderFile[];
  userFiles?: OrderFile[];
  cancelReason?: string;
  userInputData?: Record<string, string>;
}

export interface RechargeRequest {
  id: string;
  userId: string;
  amount: number;
  originalAmount?: number;
  method: string;
  transactionId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isFraudSuspected?: boolean;
  createdAt: number;
  processedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  icon: string;
  sampleUrl?: string;
  requiredFields: CustomFieldRequirement[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: number;
  details?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  timestamp: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  isActive: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  number: string;
  instruction: string;
  isActive: boolean;
}

export interface SiteSettings {
  siteName: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  currencySymbol: string;
  minRechargeAmount: number;
}

export interface SystemConfig {
  siteName?: string;
  siteTagline?: string;
  siteLogo?: string;
  supportEmail?: string;
  whatsappNumber?: string;
  liveChatUrl?: string;
  maintenanceMessage?: string;
  paymentMethods: PaymentMethodConfig[];
  minRecharge: number;
  maxRecharge: number;
  fraudThreshold: number; 
  isMaintenanceMode: boolean;
  isRegistrationEnabled: boolean;
  currencySymbol: string;
}
