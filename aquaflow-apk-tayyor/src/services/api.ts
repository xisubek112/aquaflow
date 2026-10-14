/**
 * AquaFlow API Client Service
 * Connects frontend React components to Express backend routes
 * Includes offline buffering fallback for driver delivery confirmations
 */

// Brauzerda: '/api' (bir xil server). APK ichida: VITE_API_URL orqali tashqi server manzili.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api';

export const api = {
  // Auth
  async getUsers() {
    const res = await fetch(`${API_BASE}/auth/users`);
    return res.json();
  },

  async login(userId: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async loginWithPassword(identifier: string, passwordAttempt: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: passwordAttempt }),
    });
    return res.json();
  },

  async registerCustomer(data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    addressLine: string;
    district?: string;
    companyName?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Dashboard stats
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return res.json();
  },

  // Products & Warehouse
  async getProducts() {
    const res = await fetch(`${API_BASE}/products`);
    return res.json();
  },

  async createProduct(data: any) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateProduct(id: string, data: any) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getWarehouseStocks() {
    const res = await fetch(`${API_BASE}/warehouses/stock`);
    return res.json();
  },

  async recordStockReceipt(productId: string, quantity: number, notes: string, adminId: string) {
    const res = await fetch(`${API_BASE}/warehouses/receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity, notes, adminId }),
    });
    return res.json();
  },

  async recordInventoryAdjustment(data: {
    productId: string;
    actualFull: number;
    actualEmpty: number;
    actualDamaged: number;
    notes: string;
    adminId: string;
  }) {
    const res = await fetch(`${API_BASE}/warehouses/inventory-adjustment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getStockMovements() {
    const res = await fetch(`${API_BASE}/warehouses/movements`);
    return res.json();
  },

  // Orders
  async getOrders(params?: { role?: string; userId?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.status) searchParams.append('status', params.status);

    const res = await fetch(`${API_BASE}/orders?${searchParams.toString()}`);
    return res.json();
  },

  async getOrder(id: string) {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    return res.json();
  },

  async createOrder(data: any) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async confirmOrder(orderId: string, operatorId: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId }),
    });
    return res.json();
  },

  async rejectOrder(orderId: string, operatorId: string, reason: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId, reason }),
    });
    return res.json();
  },

  async assignOrder(orderId: string, driverId: string, operatorId: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId, operatorId }),
    });
    return res.json();
  },

  // Driver actions
  async driverAccept(orderId: string, driverId: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId }),
    });
    return res.json();
  },

  async driverDepart(orderId: string, driverId: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/depart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId }),
    });
    return res.json();
  },

  async driverArrive(orderId: string, driverId: string, lat?: number, lng?: number) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/arrive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId, lat, lng }),
    });
    return res.json();
  },

  async completeDelivery(data: {
    orderId: string;
    driverId: string;
    deliveredBottles: number;
    emptyBottlesCollected: number;
    damagedBottlesReported: number;
    discrepancyReason?: string;
    signatureImage: string;
    deliveryLat?: number;
    deliveryLng?: number;
  }) {
    // Offline queue check: if browser is offline, store in localStorage
    if (!navigator.onLine) {
      const offlineQueue = JSON.parse(localStorage.getItem('aquaflow_offline_deliveries') || '[]');
      offlineQueue.push({ ...data, queuedAt: new Date().toISOString() });
      localStorage.setItem('aquaflow_offline_deliveries', JSON.stringify(offlineQueue));
      return {
        success: true,
        offlineQueued: true,
        message: 'Internet aloqasi yo\'q. Topshirish ma\'lumotlari xotirada saqlandi va aloqa tiklanganda serverga yuboriladi.',
      };
    }

    const res = await fetch(`${API_BASE}/orders/${data.orderId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Issues
  async getIssues() {
    const res = await fetch(`${API_BASE}/issues`);
    return res.json();
  },

  async reportIssue(data: any) {
    const res = await fetch(`${API_BASE}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async respondToIssue(issueId: string, response: string, status: string, resolvedBy?: string) {
    const res = await fetch(`${API_BASE}/issues/${issueId}/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, status, resolvedBy }),
    });
    return res.json();
  },

  // Drivers
  async getDrivers() {
    const res = await fetch(`${API_BASE}/drivers`);
    return res.json();
  },

  async addDriver(data: any) {
    const res = await fetch(`${API_BASE}/drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async toggleDriverStatus(driverId: string, status: string) {
    const res = await fetch(`${API_BASE}/drivers/${driverId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async updateDriverLocation(driverId: string, lat: number, lng: number) {
    const res = await fetch(`${API_BASE}/drivers/${driverId}/location`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });
    return res.json();
  },

  // Operators
  async getOperators() {
    const res = await fetch(`${API_BASE}/operators`);
    return res.json();
  },

  async addOperator(data: any) {
    const res = await fetch(`${API_BASE}/operators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async toggleOperatorStatus(operatorId: string, status: string) {
    const res = await fetch(`${API_BASE}/operators/${operatorId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Customers
  async getCustomers() {
    const res = await fetch(`${API_BASE}/customers`);
    return res.json();
  },

  async addCustomer(data: any) {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async toggleCustomerArchive(customerId: string) {
    const res = await fetch(`${API_BASE}/customers/${customerId}/archive`, {
      method: 'PUT',
    });
    return res.json();
  },

  async getCustomerLedger(customerId: string) {
    const res = await fetch(`${API_BASE}/customers/${customerId}/ledger`);
    return res.json();
  },

  // Notifications
  async getNotifications(role?: string, userId?: string) {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (userId) params.append('userId', userId);
    const res = await fetch(`${API_BASE}/notifications?${params.toString()}`);
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
    });
    return res.json();
  },

  // Reports
  async getMonthlyReport() {
    const res = await fetch(`${API_BASE}/reports/monthly`);
    return res.json();
  },

  // Audit logs
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`);
    return res.json();
  },

  // 1. Water Auto-Subscriptions
  async getSubscriptions(customerId?: string) {
    const query = customerId ? `?customerId=${customerId}` : '';
    const res = await fetch(`${API_BASE}/subscriptions${query}`);
    return res.json();
  },

  async createSubscription(data: any) {
    const res = await fetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateSubscriptionStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/subscriptions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // 2. Bottle Asset Tracking & QR Scan
  async getBottles() {
    const res = await fetch(`${API_BASE}/bottles`);
    return res.json();
  },

  async scanBottle(barcode: string) {
    const res = await fetch(`${API_BASE}/bottles/scan/${encodeURIComponent(barcode)}`);
    return res.json();
  },

  async sanitizeBottle(barcode: string) {
    const res = await fetch(`${API_BASE}/bottles/${encodeURIComponent(barcode)}/sanitize`, {
      method: 'POST',
    });
    return res.json();
  },

  // 3. SMS & Telegram Notification Gateway
  async getSmsLogs() {
    const res = await fetch(`${API_BASE}/sms-log`);
    return res.json();
  },

  async sendSmsNotice(data: { recipientPhone: string; recipientName: string; channel: string; message: string; title?: string }) {
    const res = await fetch(`${API_BASE}/sms-log/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // 4. Driver Fuel & Vehicle Expenses
  async getDriverExpenses(driverId?: string) {
    const query = driverId ? `?driverId=${driverId}` : '';
    const res = await fetch(`${API_BASE}/driver-expenses${query}`);
    return res.json();
  },

  async addDriverExpense(data: any) {
    const res = await fetch(`${API_BASE}/driver-expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
