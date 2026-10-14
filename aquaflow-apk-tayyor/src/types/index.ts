/**
 * Water Delivery Management System (AquaFlow)
 * TypeScript Type Definitions for all 21 Database Models and Workflows
 */

export type UserRole = 'ADMIN' | 'OPERATOR' | 'DRIVER' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'ARCHIVED';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  companyName?: string;
  defaultAddressId?: string;
  emptyBottlesBalance: number; // Positive = customer owes bottles to company
  financialBalance: number; // Negative = debt, Positive = prepayment
  notes?: string;
  isArchived: boolean;
  createdAt: string;
}

export interface OperatorProfile {
  id: string;
  userId: string;
  shift: 'DAY' | 'NIGHT' | 'ALL_DAY';
  activeOrdersManaged: number;
}

export type DriverStatus = 'AVAILABLE' | 'ON_ROUTE' | 'OFFLINE' | 'BUSY';

export interface DriverProfile {
  id: string;
  userId: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: DriverStatus;
  currentLat: number;
  currentLng: number;
  lastLocationUpdate: string;
  dailyDeliveredCount: number;
  rating: number;
  activeOrdersCount: number;
}

export interface Address {
  id: string;
  userId: string;
  title: string; // e.g. "Uy", "Ofis", "Omborxona"
  addressLine: string;
  district: string;
  apartment?: string;
  floor?: string;
  doorCode?: string;
  landmark?: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  volumeLiters: number;
  unitPrice: number;
  description: string;
  imageUrl?: string;
  isArchived: boolean;
  minStockAlert: number;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  managerName: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface WarehouseStock {
  id: string;
  warehouseId: string;
  productId: string;
  fullBottles: number;
  reservedBottles: number; // Reserved by confirmed orders not yet dispatched
  emptyBottles: number;
  damagedBottles: number;
  minStockAlert: number;
  updatedAt: string;
}

export type StockMovementType =
  | 'INCOMING'          // New filled water received from bottling plant
  | 'OUTGOING_ORDER'    // Delivered to customer
  | 'CONTAINER_RETURN'  // Empty bottles returned
  | 'DAMAGE_WRITE_OFF'  // Damaged bottles written off or sent to recycle
  | 'INVENTORY_ADJUST'; // Manual inventory correction

export interface StockMovement {
  id: string;
  warehouseId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  previousBalance: number;
  newBalance: number;
  referenceType?: 'ORDER' | 'MANUAL' | 'INSPECTION';
  referenceId?: string;
  operatorId: string;
  operatorName: string;
  notes: string;
  timestamp: string;
}

export type OrderStatus =
  | 'PENDING'             // Yangi buyurtma
  | 'CONFIRMED'           // Operator tasdiqladi, zaxira band qilindi
  | 'ASSIGNED'            // Haydovchiga biriktirildi
  | 'ACCEPTED'            // Haydovchi qabul qildi
  | 'ON_THE_WAY'          // Haydovchi yo'lda
  | 'ARRIVED'             // Haydovchi manzilga yetib keldi
  | 'DELIVERED'           // To'liq topshirildi
  | 'PARTIALLY_DELIVERED' // Qisman topshirildi
  | 'ISSUE_REPORTED'      // Muammo qayd etildi
  | 'UNDER_REVIEW'        // Operator tekshiruvida
  | 'CANCELLED';          // Bekor qilingan

export type PaymentMethod = 'CASH' | 'CLICK' | 'PAYME' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  volumeLiters: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: string;
  lat: number;
  lng: number;
  deliveryTimeSlot: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  totalQuantity: number;
  totalAmount: number;
  customerNote?: string;
  operatorNote?: string;
  rejectionReason?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderAssignment {
  id: string;
  orderId: string;
  driverId: string;
  driverName: string;
  assignedByOperatorId: string;
  assignedAt: string;
  status: 'ASSIGNED' | 'ACCEPTED' | 'REASSIGNED' | 'COMPLETED';
  notes?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  driverId: string;
  driverName: string;
  customerId: string;
  customerName: string;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  plannedBottles: number;
  deliveredBottles: number;
  emptyBottlesCollected: number;
  damagedBottlesReported: number;
  discrepancyReason?: string;
  signatureImage?: string; // Base64 data URL
  deliveryLat?: number;
  deliveryLng?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'PARTIALLY_DELIVERED' | 'FAILED';
  createdAt: string;
}

export interface DeliveryItem {
  id: string;
  deliveryId: string;
  productId: string;
  productName: string;
  quantityDelivered: number;
}

export interface ContainerLedger {
  id: string;
  customerId: string;
  orderId: string;
  driverId: string;
  transactionType: 'ISSUED' | 'RETURNED' | 'DAMAGED';
  quantity: number;
  balanceAfter: number;
  notes: string;
  timestamp: string;
}

export type IssueType =
  | 'DAMAGED_BOTTLE'      // Idish shikastlangan
  | 'SHORTAGE'            // Idish yetishmaydi
  | 'WATER_QUALITY'       // Suv sifati bilan bog'liq muammo
  | 'WRONG_ADDRESS'       // Mijoz manzili noto'g'ri
  | 'CUSTOMER_NOT_FOUND'  // Mijoz topilmadi / telefon olmadi
  | 'CUSTOMER_REJECTED'   // Mijoz qabul qilmadi
  | 'PAYMENT_ISSUE'       // To'lov bilan muammo
  | 'VEHICLE_BREAKDOWN'   // Mashina buzildi / tirbandlik
  | 'OTHER';              // Boshqa muammo

export type IssueStatus = 'NEW' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED_TO_ADMIN';

export interface DeliveryIssue {
  id: string;
  issueNumber: string;
  orderId: string;
  orderNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  customerName: string;
  customerPhone: string;
  issueType: IssueType;
  quantityAffected: number;
  notes: string;
  photoUrls: string[];
  reportedAt: string;
  status: IssueStatus;
  operatorResponse?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  lat?: number;
  lng?: number;
}

export interface IssueAttachment {
  id: string;
  issueId: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface DeliverySignature {
  id: string;
  deliveryId: string;
  orderId: string;
  signatureDataUrl: string;
  signedByName: string;
  signedAt: string;
  coordinates?: { lat: number; lng: number };
}

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string;
  paidAt: string;
}

export type NotificationType = 'ORDER' | 'STOCK' | 'ISSUE' | 'SYSTEM' | 'DELIVERY';

export interface Notification {
  id: string;
  recipientRole: UserRole;
  recipientUserId?: string; // Optional if broadcast to role
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// Summary stats for dashboard
export interface DashboardStats {
  ordersToday: number;
  deliveredToday: number;
  pendingOrders: number;
  inProgressOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  activeDrivers: number;
  totalFullBottles: number;
  totalEmptyBottles: number;
  totalDamagedBottles: number;
  revenueToday: number;
  revenueThisMonth: number;
  unassignedOrdersCount: number;
  activeIssuesCount: number;
}

export interface MonthlyFinancialReport {
  period: string; // e.g. "2026-10"
  totalOrders: number;
  deliveredOrders: number;
  totalWaterBottlesSold: number;
  grossRevenue: number;
  operatingExpenses: number;
  netProfit: number;
  damagedBottlesCount: number;
  damagedCostEstimate: number;
  driverPerformance: {
    driverId: string;
    driverName: string;
    deliveredOrders: number;
    deliveredBottles: number;
    issuesReported: number;
  }[];
  stockBalanceSummary: {
    productName: string;
    startingStock: number;
    incoming: number;
    outgoing: number;
    currentStock: number;
    emptyBottles: number;
  }[];
}

// -------------------------------------------------------------
// NEW ADVANCED BUSINESS FEATURES
// -------------------------------------------------------------

// 1. Water Auto-Subscription / Davriy Obuna
export type SubscriptionFrequency = 'WEEKLY' | 'TWICE_WEEKLY' | 'MONTHLY';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  quantity: number;
  deliveryAddress: string;
  frequency: SubscriptionFrequency;
  deliveryDays: string[]; // e.g. ["Dushanba", "Payshanba"]
  timeSlot: string;
  paymentMethod: PaymentMethod;
  nextDeliveryDate: string;
  status: SubscriptionStatus;
  monthlyAmount: number;
  createdAt: string;
}

// 2. Bottle Asset Tracking / QR Pasport
export type BottleStatus = 'IN_WAREHOUSE' | 'WITH_CUSTOMER' | 'ON_ROUTE' | 'IN_SANITATION' | 'DAMAGED' | 'RETIRED';

export interface BottleAsset {
  id: string;
  barcode: string; // e.g. "BTL-19L-00842"
  serialNumber: string;
  volumeLiters: number;
  cyclesCount: number; // e.g. 18 / 60
  maxCycles: number;
  status: BottleStatus;
  currentHolderName?: string;
  currentHolderType?: 'WAREHOUSE' | 'CUSTOMER' | 'DRIVER';
  productionDate: string;
  lastSanitizedAt: string;
  qualityGrade: 'EXCELLENT' | 'GOOD' | 'INSPECTION_NEEDED' | 'REJECT';
}

// 3. SMS & Telegram Notifications Gateway
export interface SmsNotification {
  id: string;
  recipientPhone: string;
  recipientName: string;
  channel: 'SMS' | 'TELEGRAM';
  title: string;
  message: string;
  status: 'DELIVERED' | 'SENT' | 'PENDING' | 'FAILED';
  sentAt: string;
}

// 4. Driver Fuel & Vehicle Expense Log
export type DriverExpenseCategory = 'FUEL_METAN' | 'FUEL_BENZIN' | 'CAR_WASH' | 'TIRE_REPAIR' | 'OTHER';

export interface DriverExpense {
  id: string;
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  category: DriverExpenseCategory;
  amount: number;
  notes: string;
  odometerKm?: number;
  date: string;
  createdAt: string;
}

