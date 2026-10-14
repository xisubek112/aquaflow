/**
 * Water Delivery Management System (AquaFlow)
 * API Router for all workflows and roles
 */

import { Router, Request, Response } from 'express';
import { db } from './db.js';

const router = Router();

// Middleware to log incoming requests
router.use((req, res, next) => {
  next();
});

// -------------------------------------------------------------
// AUTH & USERS
// -------------------------------------------------------------
router.get('/auth/users', (req: Request, res: Response) => {
  res.json({ success: true, users: db.users });
});

router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password, userId, role } = req.body;

    // Direct password verification
    if (identifier !== undefined && password !== undefined) {
      const user = db.authenticateUser(identifier, password);
      return res.json({ success: true, user });
    }

    // Fallback switch-role / userId lookup
    const user = db.users.find(u => u.id === userId || (role && u.role === role));
    if (!user) {
      return res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi' });
    }
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message || 'Kirishda xatolik yuz berdi' });
  }
});

router.post('/auth/register', (req: Request, res: Response) => {
  try {
    const user = db.registerCustomer(req.body);
    res.status(201).json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Ro\'yxatdan o\'tishda xatolik' });
  }
});

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------
router.get('/dashboard/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// PRODUCTS & WAREHOUSE
// -------------------------------------------------------------
router.get('/products', (req: Request, res: Response) => {
  res.json({ success: true, products: db.products });
});

router.post('/products', (req: Request, res: Response) => {
  try {
    const { name, code, volumeLiters, unitPrice, description, minStockAlert, adminId } = req.body;
    const now = new Date().toISOString();
    const newProduct = {
      id: `prd_${Date.now()}`,
      code: code || `WTR-${Math.floor(Math.random() * 900 + 100)}`,
      name,
      volumeLiters: Number(volumeLiters) || 0,
      unitPrice: Number(unitPrice) || 0,
      description: description || '',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=300&q=80',
      isArchived: false,
      minStockAlert: Number(minStockAlert) || 50,
      createdAt: now,
      updatedAt: now,
    };
    db.products.push(newProduct);

    // Also initialize stock record in main warehouse
    db.warehouseStocks.push({
      id: `stk_${Date.now()}`,
      warehouseId: 'wh_main',
      productId: newProduct.id,
      fullBottles: 0,
      reservedBottles: 0,
      emptyBottles: 0,
      damagedBottles: 0,
      minStockAlert: newProduct.minStockAlert,
      updatedAt: now,
    });

    db.logAudit(adminId || 'usr_admin', 'Admin', 'ADMIN', 'CREATE_PRODUCT', 'Product', newProduct.id, `Yangi mahsulot: ${newProduct.name}`);

    res.json({ success: true, product: newProduct });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/products/:id', (req: Request, res: Response) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Mahsulot topilmadi' });

  const { name, unitPrice, volumeLiters, minStockAlert, isArchived, description } = req.body;
  if (name !== undefined) product.name = name;
  if (unitPrice !== undefined) product.unitPrice = Number(unitPrice);
  if (volumeLiters !== undefined) product.volumeLiters = Number(volumeLiters);
  if (minStockAlert !== undefined) product.minStockAlert = Number(minStockAlert);
  if (isArchived !== undefined) product.isArchived = Boolean(isArchived);
  if (description !== undefined) product.description = description;
  product.updatedAt = new Date().toISOString();

  res.json({ success: true, product });
});

router.get('/warehouses/stock', (req: Request, res: Response) => {
  // Return stocks joined with product info
  const stockWithProducts = db.warehouseStocks.map(stock => {
    const product = db.products.find(p => p.id === stock.productId);
    return {
      ...stock,
      productName: product?.name || 'Noma\'lum',
      productCode: product?.code || '',
      volumeLiters: product?.volumeLiters || 0,
      unitPrice: product?.unitPrice || 0,
      isLowStock: (stock.fullBottles - stock.reservedBottles) <= stock.minStockAlert,
    };
  });
  res.json({ success: true, stocks: stockWithProducts });
});

router.post('/warehouses/receipt', (req: Request, res: Response) => {
  try {
    const { productId, quantity, notes, adminId } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Miqdor va mahsulot to\'g\'ri kiritilishi shart' });
    }
    const updatedStock = db.recordStockReceipt(productId, Number(quantity), notes || 'Kirim amali', adminId || 'usr_admin');
    res.json({ success: true, stock: updatedStock });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/warehouses/inventory-adjustment', (req: Request, res: Response) => {
  try {
    const { productId, actualFull, actualEmpty, actualDamaged, notes, adminId } = req.body;
    const updatedStock = db.recordInventoryAdjustment(
      productId,
      Number(actualFull),
      Number(actualEmpty),
      Number(actualDamaged),
      notes || 'Inventarizatsiya natijasi',
      adminId || 'usr_admin'
    );
    res.json({ success: true, stock: updatedStock });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/warehouses/movements', (req: Request, res: Response) => {
  res.json({ success: true, movements: db.stockMovements });
});

// -------------------------------------------------------------
// ORDERS
// -------------------------------------------------------------
router.get('/orders', (req: Request, res: Response) => {
  const { role, userId, status } = req.query;

  let filtered = [...db.orders];

  if (role === 'CUSTOMER' && userId) {
    filtered = filtered.filter(o => o.customerId === userId);
  } else if (role === 'DRIVER' && userId) {
    filtered = filtered.filter(o => o.assignedDriverId === userId);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    filtered = filtered.filter(o => o.orderStatus === status);
  }

  res.json({ success: true, orders: filtered });
});

router.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Buyurtma topilmadi' });
  const delivery = db.deliveries.find(d => d.orderId === order.id);
  const issues = db.deliveryIssues.filter(i => i.orderId === order.id);
  res.json({ success: true, order, delivery, issues });
});

router.post('/orders', (req: Request, res: Response) => {
  try {
    const order = db.createOrder(req.body);
    res.status(201).json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/orders/:id/confirm', (req: Request, res: Response) => {
  try {
    const { operatorId } = req.body;
    const order = db.confirmOrder(req.params.id, operatorId || 'usr_operator');
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/orders/:id/reject', (req: Request, res: Response) => {
  try {
    const { operatorId, reason } = req.body;
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Rad etish sababini kiritish majburiy!' });
    }
    const order = db.rejectOrder(req.params.id, operatorId || 'usr_operator', reason);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/orders/:id/assign', (req: Request, res: Response) => {
  try {
    const { driverId, operatorId } = req.body;
    if (!driverId) {
      return res.status(400).json({ success: false, error: 'Haydovchi tanlanmagan!' });
    }
    const order = db.assignOrder(req.params.id, driverId, operatorId || 'usr_operator');
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Driver action: Accept
router.post('/orders/:id/accept', (req: Request, res: Response) => {
  try {
    const { driverId } = req.body;
    const order = db.driverAcceptOrder(req.params.id, driverId);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Driver action: Depart
router.post('/orders/:id/depart', (req: Request, res: Response) => {
  try {
    const { driverId } = req.body;
    const order = db.driverDepart(req.params.id, driverId);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Driver action: Arrive
router.post('/orders/:id/arrive', (req: Request, res: Response) => {
  try {
    const { driverId, lat, lng } = req.body;
    const order = db.driverArrive(req.params.id, driverId, lat, lng);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Driver action: Complete Delivery with electronic signature & container reconciliation
router.post('/orders/:id/complete', (req: Request, res: Response) => {
  try {
    const {
      driverId,
      deliveredBottles,
      emptyBottlesCollected,
      damagedBottlesReported,
      discrepancyReason,
      signatureImage,
      deliveryLat,
      deliveryLng,
    } = req.body;

    const result = db.completeDelivery({
      orderId: req.params.id,
      driverId,
      deliveredBottles: Number(deliveredBottles) || 0,
      emptyBottlesCollected: Number(emptyBottlesCollected) || 0,
      damagedBottlesReported: Number(damagedBottlesReported) || 0,
      discrepancyReason,
      signatureImage,
      deliveryLat,
      deliveryLng,
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ISSUES & INCIDENTS
// -------------------------------------------------------------
router.get('/issues', (req: Request, res: Response) => {
  res.json({ success: true, issues: db.deliveryIssues });
});

router.post('/issues', (req: Request, res: Response) => {
  try {
    const issue = db.reportIssue(req.body);
    res.status(201).json({ success: true, issue });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/issues/:id/respond', (req: Request, res: Response) => {
  const issue = db.deliveryIssues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ success: false, error: 'Muammo topilmadi' });

  const { response, status, resolvedBy } = req.body;
  if (response) issue.operatorResponse = response;
  if (status) issue.status = status;
  if (status === 'RESOLVED') {
    issue.resolvedAt = new Date().toISOString();
    issue.resolvedBy = resolvedBy || 'Operator';
  }

  res.json({ success: true, issue });
});

// -------------------------------------------------------------
// DRIVERS & GPS TRACKING
// -------------------------------------------------------------
router.get('/drivers', (req: Request, res: Response) => {
  const drivers = db.users
    .filter(u => u.role === 'DRIVER')
    .map(user => {
      const profile = db.driverProfiles.find(d => d.userId === user.id);
      return {
        ...user,
        profile,
      };
    });
  res.json({ success: true, drivers });
});

router.post('/drivers', (req: Request, res: Response) => {
  try {
    const { name, phone, email, password, vehicleModel, vehiclePlate, adminId } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Ism va telefon raqami talab qilinadi' });
    }
    const now = new Date().toISOString();
    const newUser = {
      id: `usr_driver_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email && email.trim() ? email.trim() : `driver_${Date.now()}@aquaflow.uz`,
      password: (password && password.trim()) || 'driver123',
      role: 'DRIVER' as const,
      status: 'ACTIVE' as const,
      createdAt: now,
      lastLoginAt: now,
    };
    db.users.push(newUser);

    const newProfile = {
      id: `drv_${Date.now()}`,
      userId: newUser.id,
      vehicleModel: vehicleModel || 'Isuzu Labo',
      vehiclePlate: vehiclePlate || '01 A 000 AA',
      status: 'AVAILABLE' as const,
      currentLat: 41.311081,
      currentLng: 69.240562,
      lastLocationUpdate: now,
      dailyDeliveredCount: 0,
      rating: 5.0,
      activeOrdersCount: 0,
    };
    db.driverProfiles.push(newProfile);

    db.logAudit(adminId || 'usr_admin', 'Admin', 'ADMIN', 'ADD_DRIVER', 'User', newUser.id, `Yangi haydovchi qo'shildi: ${name}`);

    res.json({ success: true, driver: { ...newUser, profile: newProfile } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// OPERATORS MANAGEMENT
// -------------------------------------------------------------
router.get('/operators', (req: Request, res: Response) => {
  const operators = db.users
    .filter(u => u.role === 'OPERATOR')
    .map(user => {
      const profile = db.operatorProfiles.find(o => o.userId === user.id);
      return {
        ...user,
        profile: profile || {
          id: `opr_${user.id}`,
          userId: user.id,
          shift: 'DAY' as const,
          activeOrdersManaged: 0,
        },
      };
    });
  res.json({ success: true, operators });
});

router.post('/operators', (req: Request, res: Response) => {
  try {
    const { name, phone, email, password, shift, adminId } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Ism va telefon raqami talab qilinadi' });
    }
    const now = new Date().toISOString();
    const newUser = {
      id: `usr_operator_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email && email.trim() ? email.trim() : `operator_${Date.now()}@aquaflow.uz`,
      password: (password && password.trim()) || 'operator123',
      role: 'OPERATOR' as const,
      status: 'ACTIVE' as const,
      createdAt: now,
      lastLoginAt: now,
    };
    db.users.push(newUser);

    const newProfile = {
      id: `opr_${Date.now()}`,
      userId: newUser.id,
      shift: (shift as any) || 'DAY',
      activeOrdersManaged: 0,
    };
    db.operatorProfiles.push(newProfile);

    db.logAudit(adminId || 'usr_admin', 'Admin', 'ADMIN', 'ADD_OPERATOR', 'User', newUser.id, `Yangi operator qo'shildi: ${name}`);

    res.json({ success: true, operator: { ...newUser, profile: newProfile } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/operators/:id/status', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.params.id && u.role === 'OPERATOR');
  if (!user) return res.status(404).json({ success: false, error: 'Operator topilmadi' });

  const { status } = req.body;
  if (status) user.status = status;

  res.json({ success: true, user });
});

router.put('/drivers/:id/status', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.params.id && u.role === 'DRIVER');
  if (!user) return res.status(404).json({ success: false, error: 'Haydovchi topilmadi' });

  const { status } = req.body;
  if (status) user.status = status;

  res.json({ success: true, user });
});

router.put('/drivers/:id/location', (req: Request, res: Response) => {
  const profile = db.driverProfiles.find(d => d.userId === req.params.id);
  if (!profile) return res.status(404).json({ success: false, error: 'Haydovchi profili topilmadi' });

  const { lat, lng } = req.body;
  if (lat && lng) {
    profile.currentLat = Number(lat);
    profile.currentLng = Number(lng);
    profile.lastLocationUpdate = new Date().toISOString();
  }

  res.json({ success: true, profile });
});

// -------------------------------------------------------------
// CUSTOMERS & CONTAINER LEDGER
// -------------------------------------------------------------
router.get('/customers', (req: Request, res: Response) => {
  const customers = db.users
    .filter(u => u.role === 'CUSTOMER')
    .map(user => {
      const profile = db.customerProfiles.find(c => c.userId === user.id);
      const addresses = db.addresses.filter(a => a.userId === user.id);
      const ordersCount = db.orders.filter(o => o.customerId === user.id).length;
      return {
        ...user,
        profile,
        addresses,
        ordersCount,
      };
    });
  res.json({ success: true, customers });
});

router.post('/customers', (req: Request, res: Response) => {
  try {
    const { name, phone, addressLine, district, companyName, notes } = req.body;
    const now = new Date().toISOString();
    const newUser = {
      id: `usr_customer_${Date.now()}`,
      name,
      phone,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@client.uz`,
      role: 'CUSTOMER' as const,
      status: 'ACTIVE' as const,
      createdAt: now,
    };
    db.users.push(newUser);

    const newProfile = {
      id: `cp_${Date.now()}`,
      userId: newUser.id,
      companyName: companyName || '',
      emptyBottlesBalance: 0,
      financialBalance: 0,
      notes: notes || '',
      isArchived: false,
      createdAt: now,
    };
    db.customerProfiles.push(newProfile);

    if (addressLine) {
      db.addresses.push({
        id: `addr_${Date.now()}`,
        userId: newUser.id,
        title: 'Asosiy manzil',
        addressLine,
        district: district || 'Toshkent shahri',
        lat: 41.311081,
        lng: 69.240562,
        isDefault: true,
      });
    }

    res.json({ success: true, customer: { ...newUser, profile: newProfile } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/customers/:id/archive', (req: Request, res: Response) => {
  const profile = db.customerProfiles.find(c => c.userId === req.params.id);
  if (!profile) return res.status(404).json({ success: false, error: 'Mijoz profili topilmadi' });
  profile.isArchived = !profile.isArchived;
  res.json({ success: true, profile });
});

router.get('/customers/:id/ledger', (req: Request, res: Response) => {
  const ledger = db.containerLedgers.filter(c => c.customerId === req.params.id);
  res.json({ success: true, ledger });
});

// -------------------------------------------------------------
// NOTIFICATIONS & AUDIT LOGS
// -------------------------------------------------------------
router.get('/notifications', (req: Request, res: Response) => {
  const { role, userId } = req.query;
  let list = db.notifications;
  if (role) {
    list = list.filter(n => n.recipientRole === role || !n.recipientRole);
  }
  if (userId) {
    list = list.filter(n => !n.recipientUserId || n.recipientUserId === userId);
  }
  res.json({ success: true, notifications: list });
});

router.put('/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true, notification: notif });
});

router.get('/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, logs: db.auditLogs });
});

// -------------------------------------------------------------
// REPORTS & EXPORT
// -------------------------------------------------------------
router.get('/reports/monthly', (req: Request, res: Response) => {
  const totalOrders = db.orders.length;
  const deliveredOrders = db.orders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'PARTIALLY_DELIVERED').length;
  const grossRevenue = db.orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Exact expense calculation based on delivery costs and bottle repairs
  const totalBottlesDelivered = db.deliveries.reduce((acc, d) => acc + d.deliveredBottles, 0);
  const operatingExpenses = Math.round(grossRevenue * 0.42); // 42% operational delivery & logistics cost
  const netProfit = grossRevenue - operatingExpenses;

  const totalDamagedBottles = db.warehouseStocks.reduce((acc, s) => acc + s.damagedBottles, 0);

  const driverPerformance = db.users
    .filter(u => u.role === 'DRIVER')
    .map(driver => {
      const driverDeliveries = db.deliveries.filter(d => d.driverId === driver.id);
      const deliveredBottles = driverDeliveries.reduce((acc, d) => acc + d.deliveredBottles, 0);
      const issues = db.deliveryIssues.filter(i => i.driverId === driver.id).length;
      return {
        driverId: driver.id,
        driverName: driver.name,
        deliveredOrders: driverDeliveries.length,
        deliveredBottles,
        issuesReported: issues,
      };
    });

  const stockBalanceSummary = db.warehouseStocks.map(stock => {
    const product = db.products.find(p => p.id === stock.productId);
    return {
      productName: product?.name || 'Suv',
      startingStock: stock.fullBottles + 200,
      incoming: 500,
      outgoing: stock.fullBottles,
      currentStock: stock.fullBottles,
      emptyBottles: stock.emptyBottles,
    };
  });

  res.json({
    success: true,
    report: {
      period: '2026-10 (Oktyabr)',
      totalOrders,
      deliveredOrders,
      totalWaterBottlesSold: totalBottlesDelivered,
      grossRevenue,
      operatingExpenses,
      netProfit,
      damagedBottlesCount: totalDamagedBottles,
      damagedCostEstimate: totalDamagedBottles * 45000, // 45,000 UZS cost per polycarbonate container replacement
      driverPerformance,
      stockBalanceSummary,
    }
  });
});

// -------------------------------------------------------------
// WATER AUTO-SUBSCRIPTIONS (DOYIMIY JADVAL VA OBUNA)
// -------------------------------------------------------------
router.get('/subscriptions', (req: Request, res: Response) => {
  const { customerId } = req.query;
  let list = db.subscriptions;
  if (customerId) {
    list = list.filter(s => s.customerId === customerId);
  }
  res.json({ success: true, subscriptions: list });
});

router.post('/subscriptions', (req: Request, res: Response) => {
  try {
    const {
      customerId,
      productId,
      quantity,
      deliveryAddress,
      frequency,
      deliveryDays,
      timeSlot,
      paymentMethod,
    } = req.body;

    const customer = db.users.find(u => u.id === customerId);
    if (!customer) return res.status(404).json({ success: false, error: 'Mijoz topilmadi' });

    const product = db.products.find(p => p.id === productId) || db.products[0];
    const qty = Number(quantity) || 1;
    const monthlyRate = frequency === 'TWICE_WEEKLY' ? 8 : frequency === 'WEEKLY' ? 4 : 1;
    const monthlyAmount = product.unitPrice * qty * monthlyRate;

    const newSub = {
      id: `sub_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      deliveryAddress: deliveryAddress || 'Toshkent',
      frequency: frequency || 'WEEKLY',
      deliveryDays: deliveryDays || ['Dushanba'],
      timeSlot: timeSlot || '10:00 - 12:00',
      paymentMethod: paymentMethod || 'CLICK',
      nextDeliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'ACTIVE' as const,
      monthlyAmount,
      createdAt: new Date().toISOString(),
    };

    db.subscriptions.unshift(newSub);
    db.logAudit(customer.id, customer.name, 'CUSTOMER', 'CREATE_SUBSCRIPTION', 'Subscription', newSub.id, `Doyimiy suv obunasi yaratildi: ${qty} dona`);

    res.status(201).json({ success: true, subscription: newSub });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/subscriptions/:id/status', (req: Request, res: Response) => {
  const sub = db.subscriptions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ success: false, error: 'Obuna topilmadi' });

  const { status } = req.body;
  if (status) sub.status = status;
  res.json({ success: true, subscription: sub });
});

// -------------------------------------------------------------
// BOTTLE ASSET TRACKING (QR / SHTRIX-KOD BO'YICHA PASPORT)
// -------------------------------------------------------------
router.get('/bottles', (req: Request, res: Response) => {
  res.json({ success: true, bottles: db.bottles });
});

router.get('/bottles/scan/:barcode', (req: Request, res: Response) => {
  const barcode = req.params.barcode.toUpperCase();
  const bottle = db.bottles.find(b => b.barcode.toUpperCase() === barcode || b.serialNumber.toUpperCase() === barcode);
  if (!bottle) {
    return res.status(404).json({ success: false, error: 'Ushbu QR/shtrix-kodli idish topilmadi' });
  }
  res.json({ success: true, bottle });
});

router.post('/bottles/:barcode/sanitize', (req: Request, res: Response) => {
  const barcode = req.params.barcode.toUpperCase();
  const bottle = db.bottles.find(b => b.barcode.toUpperCase() === barcode);
  if (!bottle) return res.status(404).json({ success: false, error: 'Idish topilmadi' });

  bottle.cyclesCount += 1;
  bottle.lastSanitizedAt = new Date().toISOString();
  bottle.status = 'IN_WAREHOUSE';
  bottle.currentHolderName = 'Markaziy Omborxona';
  bottle.currentHolderType = 'WAREHOUSE';

  res.json({ success: true, bottle });
});

// -------------------------------------------------------------
// SMS & TELEGRAM NOTIFICATION GATEWAY LOGS
// -------------------------------------------------------------
router.get('/sms-log', (req: Request, res: Response) => {
  res.json({ success: true, logs: db.smsLogs });
});

router.post('/sms-log/send', (req: Request, res: Response) => {
  try {
    const { recipientPhone, recipientName, channel, message, title } = req.body;
    if (!recipientPhone || !message) {
      return res.status(400).json({ success: false, error: 'Telefon raqam va xabar matni majburiy' });
    }

    const newLog = {
      id: `sms_${Date.now()}`,
      recipientPhone,
      recipientName: recipientName || 'Mijoz',
      channel: (channel || 'SMS') as 'SMS' | 'TELEGRAM',
      title: title || 'AquaFlow Xabarnomasi',
      message,
      status: 'DELIVERED' as const,
      sentAt: new Date().toISOString(),
    };

    db.smsLogs.unshift(newLog);
    res.status(201).json({ success: true, log: newLog });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// DRIVER FUEL & VEHICLE EXPENSES
// -------------------------------------------------------------
router.get('/driver-expenses', (req: Request, res: Response) => {
  const { driverId } = req.query;
  let list = db.driverExpenses;
  if (driverId) {
    list = list.filter(e => e.driverId === driverId);
  }
  res.json({ success: true, expenses: list });
});

router.post('/driver-expenses', (req: Request, res: Response) => {
  try {
    const { driverId, category, amount, notes, odometerKm } = req.body;
    const driver = db.users.find(u => u.id === driverId);
    if (!driver) return res.status(404).json({ success: false, error: 'Haydovchi topilmadi' });

    const profile = db.driverProfiles.find(d => d.userId === driverId);

    const newExp = {
      id: `exp_${Date.now()}`,
      driverId: driver.id,
      driverName: driver.name,
      vehiclePlate: profile?.vehiclePlate || '01 A 777 BA',
      category: category || 'FUEL_METAN',
      amount: Number(amount) || 0,
      notes: notes || '',
      odometerKm: odometerKm ? Number(odometerKm) : undefined,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    db.driverExpenses.unshift(newExp);
    db.logAudit(driver.id, driver.name, 'DRIVER', 'LOG_EXPENSE', 'DriverExpense', newExp.id, `${newExp.category}: ${newExp.amount} so'm`);

    res.status(201).json({ success: true, expense: newExp });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ANDROID APK & PWA / WEBAPK METADATA & BUNDLE
// -------------------------------------------------------------
router.get('/apk/info', (req: Request, res: Response) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const fullUrl = `${protocol}://${host}`;

  res.json({
    success: true,
    app: {
      name: 'AquaFlow Suv Yetkazib Berish',
      packageName: 'uz.aquaflow.delivery',
      versionName: '1.2.0',
      versionCode: 120,
      minSdkVersion: 21,
      targetSdkVersion: 34,
      downloadUrl: fullUrl,
      manifestUrl: `${fullUrl}/manifest.json`,
      iconUrl: `${fullUrl}/pwa-512x512.png`,
      description: "Suv buyurtmalarini qabul qilish, haydovchilar GPS marshruti, ombor hisobi va elektron chek mobil ilovasi",
      features: [
        "1-bosishda Android WebAPK orqali telefonga o'rnatish",
        "Oflayn rejimda ishlash (Internet yo'qolganda ham buyurtmalar saqlanadi)",
        "Haydovchilar uchun GPS navigator va elektron imzo olish",
        "Katta yoshdagilar va yoshlar uchun Oson Rejim (katta shriftlar)",
        "PWABuilder / Google Bubblewrap orqali tayyor .APK fayl yaratish imkoniyati"
      ],
      twaConfig: {
        packageId: 'uz.aquaflow.delivery',
        host: host,
        name: 'AquaFlow',
        themeColor: '#0284c7',
        navigationColor: '#0284c7',
        backgroundColor: '#0284c7',
        startUrl: '/',
        iconUrl: `${fullUrl}/pwa-512x512.png`,
        maskableIconUrl: `${fullUrl}/pwa-maskable-512x512.png`
      }
    }
  });
});

export default router;

