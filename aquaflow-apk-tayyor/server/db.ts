/**
 * Water Delivery Management System (AquaFlow)
 * Database Engine & Transactional Store
 * Implements 21 Relational Models with ACID-style validations
 */

import {
  User,
  CustomerProfile,
  OperatorProfile,
  DriverProfile,
  Address,
  Product,
  Warehouse,
  WarehouseStock,
  StockMovement,
  Order,
  OrderItem,
  OrderAssignment,
  Delivery,
  ContainerLedger,
  DeliveryIssue,
  DeliverySignature,
  Payment,
  Notification,
  AuditLog,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  IssueType,
  Subscription,
  BottleAsset,
  SmsNotification,
  DriverExpense
} from '../src/types/index.js';

class AquaFlowDatabase {
  users: User[] = [];
  customerProfiles: CustomerProfile[] = [];
  operatorProfiles: OperatorProfile[] = [];
  driverProfiles: DriverProfile[] = [];
  addresses: Address[] = [];
  products: Product[] = [];
  warehouses: Warehouse[] = [];
  warehouseStocks: WarehouseStock[] = [];
  stockMovements: StockMovement[] = [];
  orders: Order[] = [];
  orderAssignments: OrderAssignment[] = [];
  deliveries: Delivery[] = [];
  containerLedgers: ContainerLedger[] = [];
  deliveryIssues: DeliveryIssue[] = [];
  deliverySignatures: DeliverySignature[] = [];
  payments: Payment[] = [];
  notifications: Notification[] = [];
  auditLogs: AuditLog[] = [];
  subscriptions: Subscription[] = [];
  bottles: BottleAsset[] = [];
  smsLogs: SmsNotification[] = [];
  driverExpenses: DriverExpense[] = [];

  constructor() {
    this.seedInitialData();
  }

  // -------------------------------------------------------------
  // SEED INITIAL DATA
  // -------------------------------------------------------------
  seedInitialData() {
    const now = new Date('2026-10-14T09:30:00+05:00').toISOString();

    // 1. Users
    this.users = [
      {
        id: 'usr_admin',
        name: 'Sardor Rahimov',
        phone: '+998 90 123 45 67',
        email: 'admin@aquaflow.uz',
        password: 'admin123',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        id: 'usr_operator',
        name: 'Nilufar Karimova',
        phone: '+998 93 234 56 78',
        email: 'operator@aquaflow.uz',
        password: 'operator123',
        role: 'OPERATOR',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        id: 'usr_driver_1',
        name: 'Jasurbek Toirov',
        phone: '+998 97 345 67 89',
        email: 'driver1@aquaflow.uz',
        password: 'driver123',
        role: 'DRIVER',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        id: 'usr_driver_2',
        name: 'Umidbek Qodirov',
        phone: '+998 99 456 78 90',
        email: 'driver2@aquaflow.uz',
        password: 'driver123',
        role: 'DRIVER',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        id: 'usr_customer_1',
        name: 'Ali Valiyev',
        phone: '+998 90 987 65 43',
        email: 'ali@valiyev.uz',
        password: 'customer123',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        id: 'usr_customer_2',
        name: 'Otabek Boboyev',
        phone: '+998 71 200 00 11',
        email: 'otabek@artel.uz',
        password: 'customer123',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: now,
      },
      {
        id: 'usr_customer_3',
        name: 'Gulnoza Shokirova',
        phone: '+998 94 555 12 34',
        email: 'gulnoza@mail.uz',
        password: 'customer123',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: now,
      }
    ];

    // 2. Profiles
    this.operatorProfiles = [
      {
        id: 'opr_1',
        userId: 'usr_operator',
        shift: 'DAY',
        activeOrdersManaged: 5,
      }
    ];

    this.driverProfiles = [
      {
        id: 'drv_1',
        userId: 'usr_driver_1',
        vehicleModel: 'Isuzu Labo Suv Tashiydigan',
        vehiclePlate: '01 A 777 BA',
        status: 'AVAILABLE',
        currentLat: 41.3284,
        currentLng: 69.2812, // Tashkent center / Yunusobod
        lastLocationUpdate: now,
        dailyDeliveredCount: 8,
        rating: 4.9,
        activeOrdersCount: 1,
      },
      {
        id: 'drv_2',
        userId: 'usr_driver_2',
        vehicleModel: 'Chevrolet Damas Van',
        vehiclePlate: '01 B 888 BB',
        status: 'ON_ROUTE',
        currentLat: 41.2858,
        currentLng: 69.2039, // Chilonzor
        lastLocationUpdate: now,
        dailyDeliveredCount: 6,
        rating: 4.8,
        activeOrdersCount: 2,
      }
    ];

    this.customerProfiles = [
      {
        id: 'cp_1',
        userId: 'usr_customer_1',
        companyName: 'Xususiy Xonadon',
        emptyBottlesBalance: 4, // holds 4 empty bottles currently
        financialBalance: 0,
        notes: 'Domofon 24, 4-qavat, lift bor',
        isArchived: false,
        createdAt: now,
      },
      {
        id: 'cp_2',
        userId: 'usr_customer_2',
        companyName: 'Artel Texnopark MCHJ',
        emptyBottlesBalance: 25,
        financialBalance: 250000,
        notes: 'KPP orqali 3-bino, 2-qavat',
        isArchived: false,
        createdAt: now,
      },
      {
        id: 'cp_3',
        userId: 'usr_customer_3',
        companyName: 'IT Park Rezident Ofisi',
        emptyBottlesBalance: 8,
        financialBalance: 0,
        notes: 'Soat 14:00 gacha yetkazish kerak',
        isArchived: false,
        createdAt: now,
      }
    ];

    // 3. Addresses
    this.addresses = [
      {
        id: 'addr_1',
        userId: 'usr_customer_1',
        title: 'Asosiy xonadon',
        addressLine: 'Yunusobod tumani, 11-mavze, 24-uy, 42-xonadon',
        district: 'Yunusobod',
        apartment: '42',
        floor: '4',
        doorCode: '2442',
        landmark: 'Megaplanet savdo majmuasi yaqinida',
        lat: 41.3653,
        lng: 69.2885,
        isDefault: true,
      },
      {
        id: 'addr_2',
        userId: 'usr_customer_2',
        title: 'Bosh ofis (Artel)',
        addressLine: 'Yashnobod tumani, Ohangaron shox ko\'chasi, 2-bino',
        district: 'Yashnobod',
        apartment: 'Ofis 204',
        floor: '2',
        landmark: 'Texnopark hududi',
        lat: 41.2982,
        lng: 69.3418,
        isDefault: true,
      },
      {
        id: 'addr_3',
        userId: 'usr_customer_3',
        title: 'Ish joyi',
        addressLine: 'Mirzo Ulug\'bek tumani, Tepamasjid ko\'chasi 4-bino',
        district: 'Mirzo Ulug\'bek',
        apartment: '301',
        floor: '3',
        landmark: 'IT Park Toshkent',
        lat: 41.3411,
        lng: 69.3344,
        isDefault: true,
      }
    ];

    // 4. Products
    this.products = [
      {
        id: 'prd_19l',
        code: 'WTR-19L',
        name: 'AquaFlow Premium 18.9L Suv',
        volumeLiters: 18.9,
        unitPrice: 20000,
        description: 'Tog\' buloqlari zilol suvi, 7 bosqichli kumush filtrlangan 19 litrli toza ichimlik suvi.',
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=300&q=80',
        isArchived: false,
        minStockAlert: 150,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prd_10l',
        code: 'WTR-10L',
        name: 'AquaFlow Daily 10L Suv',
        volumeLiters: 10,
        unitPrice: 14000,
        description: 'Qulay ixcham 10 litrli mineral toza suv.',
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
        isArchived: false,
        minStockAlert: 80,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prd_pump',
        code: 'ACC-PUMP',
        name: 'Smart Elektr Pompa USB',
        volumeLiters: 0,
        unitPrice: 110000,
        description: 'Zaryadlanuvchi avtomatik suv chiqarish pompasi, tez va shovqinsiz.',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80',
        isArchived: false,
        minStockAlert: 20,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prd_dispenser',
        code: 'ACC-DISP',
        name: 'Stol usti Suv Dispenseri',
        volumeLiters: 0,
        unitPrice: 280000,
        description: 'Issiq va sovuq suv tarqatish uchun ixcham zamonaviy stol dispenseri.',
        imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=300&q=80',
        isArchived: false,
        minStockAlert: 10,
        createdAt: now,
        updatedAt: now,
      }
    ];

    // 5. Warehouse
    this.warehouses = [
      {
        id: 'wh_main',
        name: 'Toshkent Markaziy Suv Zavod Ombori',
        address: 'Yunusobod tumani, Bog\'ishamol ko\'chasi, 45-bino',
        managerName: 'Qodirxon Saidov',
        phone: '+998 71 230 40 50',
        lat: 41.3508,
        lng: 69.2941,
      }
    ];

    // 6. Warehouse Stock
    this.warehouseStocks = [
      {
        id: 'stk_1',
        warehouseId: 'wh_main',
        productId: 'prd_19l',
        fullBottles: 1420,
        reservedBottles: 85,
        emptyBottles: 640,
        damagedBottles: 18,
        minStockAlert: 150,
        updatedAt: now,
      },
      {
        id: 'stk_2',
        warehouseId: 'wh_main',
        productId: 'prd_10l',
        fullBottles: 480,
        reservedBottles: 20,
        emptyBottles: 190,
        damagedBottles: 6,
        minStockAlert: 80,
        updatedAt: now,
      },
      {
        id: 'stk_3',
        warehouseId: 'wh_main',
        productId: 'prd_pump',
        fullBottles: 85,
        reservedBottles: 5,
        emptyBottles: 0,
        damagedBottles: 1,
        minStockAlert: 20,
        updatedAt: now,
      },
      {
        id: 'stk_4',
        warehouseId: 'wh_main',
        productId: 'prd_dispenser',
        fullBottles: 32,
        reservedBottles: 2,
        emptyBottles: 0,
        damagedBottles: 0,
        minStockAlert: 10,
        updatedAt: now,
      }
    ];

    // 7. Stock Movements History
    this.stockMovements = [
      {
        id: 'sm_1',
        warehouseId: 'wh_main',
        productId: 'prd_19l',
        type: 'INCOMING',
        quantity: 500,
        previousBalance: 920,
        newBalance: 1420,
        referenceType: 'MANUAL',
        referenceId: 'BATCH-2026-10-14',
        operatorId: 'usr_admin',
        operatorName: 'Sardor Rahimov',
        notes: 'Chorvoq zavodidan yangi toza suv partiyasi qabul qilindi',
        timestamp: '2026-10-14T07:15:00+05:00',
      },
      {
        id: 'sm_2',
        warehouseId: 'wh_main',
        productId: 'prd_19l',
        type: 'CONTAINER_RETURN',
        quantity: 120,
        previousBalance: 520,
        newBalance: 640,
        referenceType: 'INSPECTION',
        referenceId: 'ROUTE-01',
        operatorId: 'usr_operator',
        operatorName: 'Nilufar Karimova',
        notes: 'Haydovchi Jasurbek tomonidan 120 ta bo\'sh idish topshirildi',
        timestamp: '2026-10-14T08:00:00+05:00',
      }
    ];

    // 8. Orders
    this.orders = [
      {
        id: 'ord_1050',
        orderNumber: 'ORD-1050',
        customerId: 'usr_customer_1',
        customerName: 'Ali Valiyev',
        customerPhone: '+998 90 987 65 43',
        deliveryAddress: 'Yunusobod tumani, 11-mavze, 24-uy, 42-xonadon',
        district: 'Yunusobod',
        lat: 41.3653,
        lng: 69.2885,
        deliveryTimeSlot: '10:00 - 12:00',
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        items: [
          {
            id: 'item_1050_1',
            orderId: 'ord_1050',
            productId: 'prd_19l',
            productName: 'AquaFlow Premium 18.9L Suv',
            volumeLiters: 18.9,
            quantity: 3,
            unitPrice: 20000,
            subtotal: 60000,
          }
        ],
        totalQuantity: 3,
        totalAmount: 60000,
        customerNote: 'Eshik qo\'ng\'irog\'ini bosing',
        assignedDriverId: 'usr_driver_1',
        assignedDriverName: 'Jasurbek Toirov',
        assignedDriverPhone: '+998 97 345 67 89',
        assignedAt: '2026-10-14T08:15:00+05:00',
        createdAt: '2026-10-14T08:00:00+05:00',
        updatedAt: '2026-10-14T09:10:00+05:00',
      },
      {
        id: 'ord_1051',
        orderNumber: 'ORD-1051',
        customerId: 'usr_customer_2',
        customerName: 'Artel Texnopark MCHJ',
        customerPhone: '+998 71 200 00 11',
        deliveryAddress: 'Yashnobod tumani, Ohangaron shox ko\'chasi, 2-bino',
        district: 'Yashnobod',
        lat: 41.2982,
        lng: 69.3418,
        deliveryTimeSlot: '11:00 - 13:00',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PAID',
        orderStatus: 'ON_THE_WAY',
        items: [
          {
            id: 'item_1051_1',
            orderId: 'ord_1051',
            productId: 'prd_19l',
            productName: 'AquaFlow Premium 18.9L Suv',
            volumeLiters: 18.9,
            quantity: 50,
            unitPrice: 20000,
            subtotal: 1000000,
          }
        ],
        totalQuantity: 50,
        totalAmount: 1000000,
        customerNote: 'KPP orqali 3-bino, bo\'sh idishlar tayyorlab qo\'yilgan',
        assignedDriverId: 'usr_driver_2',
        assignedDriverName: 'Umidbek Qodirov',
        assignedDriverPhone: '+998 99 456 78 90',
        assignedAt: '2026-10-14T08:30:00+05:00',
        createdAt: '2026-10-14T08:10:00+05:00',
        updatedAt: '2026-10-14T09:20:00+05:00',
      },
      {
        id: 'ord_1052',
        orderNumber: 'ORD-1052',
        customerId: 'usr_customer_3',
        customerName: 'Gulnoza Shokirova',
        customerPhone: '+998 94 555 12 34',
        deliveryAddress: 'Mirzo Ulug\'bek tumani, Tepamasjid ko\'chasi 4-bino, IT Park',
        district: 'Mirzo Ulug\'bek',
        lat: 41.3411,
        lng: 69.3344,
        deliveryTimeSlot: '14:00 - 16:00',
        paymentMethod: 'CLICK',
        paymentStatus: 'PENDING',
        orderStatus: 'ASSIGNED',
        items: [
          {
            id: 'item_1052_1',
            orderId: 'ord_1052',
            productId: 'prd_19l',
            productName: 'AquaFlow Premium 18.9L Suv',
            volumeLiters: 18.9,
            quantity: 10,
            unitPrice: 20000,
            subtotal: 200000,
          },
          {
            id: 'item_1052_2',
            orderId: 'ord_1052',
            productId: 'prd_pump',
            productName: 'Smart Elektr Pompa USB',
            volumeLiters: 0,
            quantity: 1,
            unitPrice: 110000,
            subtotal: 110000,
          }
        ],
        totalQuantity: 11,
        totalAmount: 310000,
        customerNote: 'Kvitansiya berishingiz so\'raladi',
        assignedDriverId: 'usr_driver_1',
        assignedDriverName: 'Jasurbek Toirov',
        assignedDriverPhone: '+998 97 345 67 89',
        assignedAt: '2026-10-14T09:00:00+05:00',
        createdAt: '2026-10-14T08:45:00+05:00',
        updatedAt: '2026-10-14T09:00:00+05:00',
      },
      {
        id: 'ord_1053',
        orderNumber: 'ORD-1053',
        customerId: 'usr_customer_1',
        customerName: 'Ali Valiyev',
        customerPhone: '+998 90 987 65 43',
        deliveryAddress: 'Yunusobod tumani, 11-mavze, 24-uy',
        district: 'Yunusobod',
        lat: 41.3653,
        lng: 69.2885,
        deliveryTimeSlot: '16:00 - 18:00',
        paymentMethod: 'PAYME',
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        items: [
          {
            id: 'item_1053_1',
            orderId: 'ord_1053',
            productId: 'prd_19l',
            productName: 'AquaFlow Premium 18.9L Suv',
            volumeLiters: 18.9,
            quantity: 2,
            unitPrice: 20000,
            subtotal: 40000,
          }
        ],
        totalQuantity: 2,
        totalAmount: 40000,
        customerNote: 'Iltimos 17:00 dan keyin',
        createdAt: '2026-10-14T09:25:00+05:00',
        updatedAt: '2026-10-14T09:25:00+05:00',
      }
    ];

    // 9. Deliveries
    this.deliveries = [
      {
        id: 'del_1050',
        orderId: 'ord_1050',
        orderNumber: 'ORD-1050',
        driverId: 'usr_driver_1',
        driverName: 'Jasurbek Toirov',
        customerId: 'usr_customer_1',
        customerName: 'Ali Valiyev',
        startedAt: '2026-10-14T08:20:00+05:00',
        arrivedAt: '2026-10-14T08:50:00+05:00',
        completedAt: '2026-10-14T09:05:00+05:00',
        plannedBottles: 3,
        deliveredBottles: 3,
        emptyBottlesCollected: 3,
        damagedBottlesReported: 0,
        signatureImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M10 50 Q 50 10 90 50 T 170 40" stroke="%230284c7" stroke-width="3" fill="none"/></svg>',
        deliveryLat: 41.3653,
        deliveryLng: 69.2885,
        status: 'DELIVERED',
        createdAt: '2026-10-14T08:15:00+05:00',
      }
    ];

    // 10. Container Ledger
    this.containerLedgers = [
      {
        id: 'cld_1',
        customerId: 'usr_customer_1',
        orderId: 'ord_1050',
        driverId: 'usr_driver_1',
        transactionType: 'RETURNED',
        quantity: 3,
        balanceAfter: 4,
        notes: 'Topshirildi: 3 ta to\'la suv, qaytarildi: 3 ta bo\'sh idish',
        timestamp: '2026-10-14T09:05:00+05:00',
      }
    ];

    // 11. Delivery Issues
    this.deliveryIssues = [
      {
        id: 'iss_1',
        issueNumber: 'ISS-0089',
        orderId: 'ord_1051',
        orderNumber: 'ORD-1051',
        driverId: 'usr_driver_2',
        driverName: 'Umidbek Qodirov',
        driverPhone: '+998 99 456 78 90',
        customerName: 'Artel Texnopark MCHJ',
        customerPhone: '+998 71 200 00 11',
        issueType: 'DAMAGED_BOTTLE',
        quantityAffected: 2,
        notes: 'Ortish jarayonida 2 ta idishning bo\'g\'iz qismi yorilgani aniqlandi, almashtirildi',
        photoUrls: [
          'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80'
        ],
        reportedAt: '2026-10-14T08:45:00+05:00',
        status: 'UNDER_REVIEW',
        operatorResponse: 'Omborga kirim dalolatnomasi tuzildi, yangi idish berildi',
        lat: 41.2982,
        lng: 69.3418,
      }
    ];

    // 12. Notifications
    this.notifications = [
      {
        id: 'notif_1',
        recipientRole: 'OPERATOR',
        title: 'Yangi buyurtma tushdi',
        message: 'ORD-1053 raqamli 2 ta suv uchun buyurtma tushdi. Tasdiqlash kutilmoqda.',
        type: 'ORDER',
        isRead: false,
        metadata: { orderId: 'ord_1053' },
        createdAt: '2026-10-14T09:25:00+05:00',
      },
      {
        id: 'notif_2',
        recipientRole: 'ADMIN',
        title: 'Ombor ogohlantirishi',
        message: 'Smart Elektr Pompa qoldig\'i kamaydi (85 dona qoldi).',
        type: 'STOCK',
        isRead: false,
        createdAt: '2026-10-14T09:00:00+05:00',
      },
      {
        id: 'notif_3',
        recipientRole: 'DRIVER',
        recipientUserId: 'usr_driver_1',
        title: 'Yangi buyurtma biriktirildi',
        message: 'Sizga ORD-1052 raqamli buyurtma biriktirildi (Mirzo Ulug\'bek, IT Park).',
        type: 'DELIVERY',
        isRead: false,
        metadata: { orderId: 'ord_1052' },
        createdAt: '2026-10-14T09:00:00+05:00',
      }
    ];

    // 13. Audit Logs
    this.auditLogs = [
      {
        id: 'aud_1',
        userId: 'usr_admin',
        userName: 'Sardor Rahimov',
        userRole: 'ADMIN',
        action: 'INCOMING_STOCK',
        entity: 'WarehouseStock',
        entityId: 'stk_1',
        details: '1420 ta 19L suv qabul qilindi',
        ipAddress: '192.168.1.10',
        timestamp: '2026-10-14T07:15:00+05:00',
      },
      {
        id: 'aud_2',
        userId: 'usr_operator',
        userName: 'Nilufar Karimova',
        userRole: 'OPERATOR',
        action: 'ASSIGN_DRIVER',
        entity: 'Order',
        entityId: 'ord_1052',
        details: 'ORD-1052 buyurtmasi Jasurbek Toirovga biriktirildi',
        ipAddress: '192.168.1.25',
        timestamp: '2026-10-14T09:00:00+05:00',
      }
    ];

    // 14. Water Auto-Subscriptions
    this.subscriptions = [
      {
        id: 'sub_1',
        customerId: 'usr_customer_2',
        customerName: 'Artel Texnopark MCHJ',
        customerPhone: '+998 71 200 00 11',
        productId: 'prd_19l',
        productName: 'AquaFlow Premium 18.9L Suv',
        quantity: 25,
        deliveryAddress: 'Yashnobod tumani, Ohangaron shox ko\'chasi, 2-bino',
        frequency: 'TWICE_WEEKLY',
        deliveryDays: ['Dushanba', 'Payshanba'],
        timeSlot: '10:00 - 12:00',
        paymentMethod: 'BANK_TRANSFER',
        nextDeliveryDate: '2026-10-16',
        status: 'ACTIVE',
        monthlyAmount: 4000000,
        createdAt: now,
      },
      {
        id: 'sub_2',
        customerId: 'usr_customer_3',
        customerName: 'Gulnoza Shokirova (IT Park)',
        customerPhone: '+998 94 555 12 34',
        productId: 'prd_19l',
        productName: 'AquaFlow Premium 18.9L Suv',
        quantity: 8,
        deliveryAddress: 'Mirzo Ulug\'bek tumani, Tepamasjid ko\'chasi 4-bino',
        frequency: 'WEEKLY',
        deliveryDays: ['Chorshanba'],
        timeSlot: '14:00 - 16:00',
        paymentMethod: 'CLICK',
        nextDeliveryDate: '2026-10-21',
        status: 'ACTIVE',
        monthlyAmount: 640000,
        createdAt: now,
      },
      {
        id: 'sub_3',
        customerId: 'usr_customer_1',
        customerName: 'Ali Valiyev',
        customerPhone: '+998 90 987 65 43',
        productId: 'prd_19l',
        productName: 'AquaFlow Premium 18.9L Suv',
        quantity: 3,
        deliveryAddress: 'Yunusobod tumani, 11-mavze, 24-uy, 42-xonadon',
        frequency: 'WEEKLY',
        deliveryDays: ['Shanba'],
        timeSlot: '16:00 - 18:00',
        paymentMethod: 'CASH',
        nextDeliveryDate: '2026-10-17',
        status: 'ACTIVE',
        monthlyAmount: 240000,
        createdAt: now,
      }
    ];

    // 15. Tagged Bottle Assets (QR / Barcode tracking)
    this.bottles = [
      {
        id: 'btl_1',
        barcode: 'BTL-19L-00841',
        serialNumber: 'AF-2025-0841',
        volumeLiters: 18.9,
        cyclesCount: 14,
        maxCycles: 60,
        status: 'IN_WAREHOUSE',
        currentHolderName: 'Markaziy Omborxona',
        currentHolderType: 'WAREHOUSE',
        productionDate: '2025-04-10',
        lastSanitizedAt: '2026-10-13T16:00:00+05:00',
        qualityGrade: 'EXCELLENT',
      },
      {
        id: 'btl_2',
        barcode: 'BTL-19L-00842',
        serialNumber: 'AF-2025-0842',
        volumeLiters: 18.9,
        cyclesCount: 28,
        maxCycles: 60,
        status: 'WITH_CUSTOMER',
        currentHolderName: 'Artel Texnopark MCHJ',
        currentHolderType: 'CUSTOMER',
        productionDate: '2025-02-15',
        lastSanitizedAt: '2026-10-10T11:00:00+05:00',
        qualityGrade: 'GOOD',
      },
      {
        id: 'btl_3',
        barcode: 'BTL-19L-00843',
        serialNumber: 'AF-2025-0843',
        volumeLiters: 18.9,
        cyclesCount: 39,
        maxCycles: 60,
        status: 'WITH_CUSTOMER',
        currentHolderName: 'Ali Valiyev',
        currentHolderType: 'CUSTOMER',
        productionDate: '2024-11-20',
        lastSanitizedAt: '2026-10-12T09:30:00+05:00',
        qualityGrade: 'GOOD',
      },
      {
        id: 'btl_4',
        barcode: 'BTL-19L-00844',
        serialNumber: 'AF-2025-0844',
        volumeLiters: 18.9,
        cyclesCount: 57,
        maxCycles: 60,
        status: 'IN_SANITATION',
        currentHolderName: 'Yuvish va Zararsizlantirish Tsex',
        currentHolderType: 'WAREHOUSE',
        productionDate: '2024-06-01',
        lastSanitizedAt: '2026-10-14T08:00:00+05:00',
        qualityGrade: 'INSPECTION_NEEDED',
      },
      {
        id: 'btl_5',
        barcode: 'BTL-19L-00845',
        serialNumber: 'AF-2025-0845',
        volumeLiters: 18.9,
        cyclesCount: 19,
        maxCycles: 60,
        status: 'DAMAGED',
        currentHolderName: 'Karantin / Chiqit bo\'limi',
        currentHolderType: 'WAREHOUSE',
        productionDate: '2025-03-12',
        lastSanitizedAt: '2026-10-08T14:00:00+05:00',
        qualityGrade: 'REJECT',
      }
    ];

    // 16. SMS & Telegram Dispatch Logs
    this.smsLogs = [
      {
        id: 'sms_1',
        recipientPhone: '+998 90 987 65 43',
        recipientName: 'Ali Valiyev',
        channel: 'SMS',
        title: 'Buyurtma tasdiqlandi',
        message: 'AquaFlow: ORD-1050 buyurtmangiz tasdiqlandi. Kuryer: Jasurbek (+998973456789), Isuzu 01 A 777 BA',
        status: 'DELIVERED',
        sentAt: '2026-10-14T08:20:00+05:00',
      },
      {
        id: 'sms_2',
        recipientPhone: '+998 71 200 00 11',
        recipientName: 'Artel Texnopark MCHJ',
        channel: 'TELEGRAM',
        title: 'Haydovchi yo\'lga chiqdi',
        message: 'AquaFlow Bot: 50 ta 19L suv yuklangan Damas 01 B 888 BB manzil sari yo\'lga chiqdi. Kutilayotgan vaqt: 11:30',
        status: 'DELIVERED',
        sentAt: '2026-10-14T08:40:00+05:00',
      },
      {
        id: 'sms_3',
        recipientPhone: '+998 90 987 65 43',
        recipientName: 'Ali Valiyev',
        channel: 'SMS',
        title: 'Suv topshirildi',
        message: 'AquaFlow: Xaridingiz uchun rahmat! 3 ta toza suv topshirildi, 3 ta bo\'sh idish qabul qilindi. Elektron chek: https://aquaflow.uz/c/1050',
        status: 'DELIVERED',
        sentAt: '2026-10-14T09:06:00+05:00',
      }
    ];

    // 17. Driver Expenses (Fuel & maintenance)
    this.driverExpenses = [
      {
        id: 'exp_1',
        driverId: 'usr_driver_1',
        driverName: 'Jasurbek Toirov',
        vehiclePlate: '01 A 777 BA',
        category: 'FUEL_METAN',
        amount: 68000,
        notes: 'Chig\'atoy AGNKS metan gaz to\'ldirish (24 kub)',
        odometerKm: 142850,
        date: '2026-10-14',
        createdAt: '2026-10-14T07:45:00+05:00',
      },
      {
        id: 'exp_2',
        driverId: 'usr_driver_2',
        driverName: 'Umidbek Qodirov',
        vehiclePlate: '01 B 888 BB',
        category: 'CAR_WASH',
        amount: 35000,
        notes: 'Yuk bo\'limi va kuzov tozalash',
        odometerKm: 98400,
        date: '2026-10-14',
        createdAt: '2026-10-14T08:00:00+05:00',
      }
    ];
  }

  // -------------------------------------------------------------
  // AUDIT & NOTIFICATION HELPERS
  // -------------------------------------------------------------
  logAudit(userId: string, userName: string, userRole: any, action: string, entity: string, entityId: string, details: string) {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      userName,
      userRole,
      action,
      entity,
      entityId,
      details,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  createNotification(recipientRole: any, title: string, message: string, type: any, recipientUserId?: string, metadata?: any) {
    const notif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      recipientRole,
      recipientUserId,
      title,
      message,
      type,
      isRead: false,
      metadata,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    return notif;
  }

  // -------------------------------------------------------------
  // TRANSACTIONAL ORDER WORKFLOWS
  // -------------------------------------------------------------

  // 1. Customer places order
  createOrder(data: {
    customerId: string;
    items: { productId: string; quantity: number }[];
    deliveryAddress: string;
    district?: string;
    lat: number;
    lng: number;
    deliveryTimeSlot: string;
    paymentMethod: PaymentMethod;
    customerNote?: string;
  }) {
    const customer = this.users.find(u => u.id === data.customerId);
    if (!customer) throw new Error('Mijoz topilmadi');

    const orderNumber = `ORD-${1000 + this.orders.length + 1}`;
    let totalQuantity = 0;
    let totalAmount = 0;

    const orderItems: OrderItem[] = data.items.map((item, idx) => {
      const product = this.products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Mahsulot topilmadi: ${item.productId}`);
      const subtotal = product.unitPrice * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += subtotal;
      return {
        id: `item_${orderNumber}_${idx + 1}`,
        orderId: `ord_${orderNumber.toLowerCase()}`,
        productId: product.id,
        productName: product.name,
        volumeLiters: product.volumeLiters,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        subtotal,
      };
    });

    const now = new Date().toISOString();
    const newOrder: Order = {
      id: `ord_${orderNumber.toLowerCase()}`,
      orderNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: data.deliveryAddress,
      district: data.district || 'Toshkent shahri',
      lat: data.lat || 41.311081,
      lng: data.lng || 69.240562,
      deliveryTimeSlot: data.deliveryTimeSlot,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      items: orderItems,
      totalQuantity,
      totalAmount,
      customerNote: data.customerNote,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.unshift(newOrder);

    // Operator notification
    this.createNotification(
      'OPERATOR',
      'Yangi buyurtma qabul qilindi',
      `${newOrder.orderNumber}: ${newOrder.customerName} - ${totalQuantity} dona suv`,
      'ORDER',
      undefined,
      { orderId: newOrder.id }
    );

    this.logAudit(
      customer.id,
      customer.name,
      'CUSTOMER',
      'CREATE_ORDER',
      'Order',
      newOrder.id,
      `Yangi buyurtma berildi: ${orderNumber}, jami: ${totalAmount} so'm`
    );

    return newOrder;
  }

  // 2. Operator confirms order (Atomic Stock Reservation)
  confirmOrder(orderId: string, operatorId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Buyurtma topilmadi');
    if (order.orderStatus !== 'PENDING') {
      throw new Error(`Buyurtma faqat PENDING holatida tasdiqlanadi. Joriy holat: ${order.orderStatus}`);
    }

    const operator = this.users.find(u => u.id === operatorId) || { name: 'Operator', role: 'OPERATOR' };

    // Check available warehouse stock for every item
    for (const item of order.items) {
      const stock = this.warehouseStocks.find(s => s.productId === item.productId);
      if (!stock) {
        throw new Error(`Mahsulot omborda mavjud emas: ${item.productName}`);
      }
      const available = stock.fullBottles - stock.reservedBottles;
      if (available < item.quantity) {
        throw new Error(
          `Omborda yetarli mahsulot yo'q! "${item.productName}" uchun mavjud: ${available} dona, buyurtma: ${item.quantity} dona.`
        );
      }
    }

    // Atomically reserve stock
    for (const item of order.items) {
      const stock = this.warehouseStocks.find(s => s.productId === item.productId)!;
      stock.reservedBottles += item.quantity;
      stock.updatedAt = new Date().toISOString();
    }

    order.orderStatus = 'CONFIRMED';
    order.updatedAt = new Date().toISOString();

    this.createNotification(
      'CUSTOMER',
      'Buyurtmangiz tasdiqlandi!',
      `${order.orderNumber} raqamli buyurtma operator tomonidan tasdiqlandi va zaxira band qilindi.`,
      'ORDER',
      order.customerId,
      { orderId: order.id }
    );

    this.logAudit(
      operatorId,
      operator.name,
      'OPERATOR',
      'CONFIRM_ORDER',
      'Order',
      order.id,
      `Buyurtma tasdiqlandi, ${order.totalQuantity} dona zaxira band qilindi`
    );

    return order;
  }

  // 3. Reject order
  rejectOrder(orderId: string, operatorId: string, reason: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Buyurtma topilmadi');

    // If stock was already reserved, unreserve it
    if (order.orderStatus === 'CONFIRMED' || order.orderStatus === 'ASSIGNED') {
      for (const item of order.items) {
        const stock = this.warehouseStocks.find(s => s.productId === item.productId);
        if (stock) {
          stock.reservedBottles = Math.max(0, stock.reservedBottles - item.quantity);
          stock.updatedAt = new Date().toISOString();
        }
      }
    }

    order.orderStatus = 'CANCELLED';
    order.rejectionReason = reason;
    order.updatedAt = new Date().toISOString();

    const operator = this.users.find(u => u.id === operatorId) || { name: 'Operator' };

    this.createNotification(
      'CUSTOMER',
      'Buyurtma rad etildi',
      `${order.orderNumber} raqamli buyurtma rad etildi. Sabab: ${reason}`,
      'ORDER',
      order.customerId,
      { orderId: order.id }
    );

    this.logAudit(
      operatorId,
      operator.name,
      'OPERATOR',
      'REJECT_ORDER',
      'Order',
      order.id,
      `Buyurtma bekor qilindi. Sabab: ${reason}`
    );

    return order;
  }

  // 4. Operator assigns order to Driver
  assignOrder(orderId: string, driverId: string, operatorId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Buyurtma topilmadi');

    const driver = this.users.find(u => u.id === driverId);
    if (!driver || driver.role !== 'DRIVER') throw new Error('Haydovchi topilmadi');

    const driverProfile = this.driverProfiles.find(d => d.userId === driverId);
    if (driver.status === 'BLOCKED') throw new Error('Haydovchi bloklangan holatda');

    // If order was PENDING, auto-confirm and reserve stock
    if (order.orderStatus === 'PENDING') {
      this.confirmOrder(orderId, operatorId);
    }

    order.assignedDriverId = driver.id;
    order.assignedDriverName = driver.name;
    order.assignedDriverPhone = driver.phone;
    order.assignedAt = new Date().toISOString();
    order.orderStatus = 'ASSIGNED';
    order.updatedAt = new Date().toISOString();

    if (driverProfile) {
      driverProfile.activeOrdersCount += 1;
    }

    // Record assignment
    const assignment: OrderAssignment = {
      id: `asg_${Date.now()}`,
      orderId: order.id,
      driverId: driver.id,
      driverName: driver.name,
      assignedByOperatorId: operatorId,
      assignedAt: order.assignedAt,
      status: 'ASSIGNED',
    };
    this.orderAssignments.unshift(assignment);

    // Notify Driver
    this.createNotification(
      'DRIVER',
      'Yangi buyurtma biriktirildi',
      `Sizga ${order.orderNumber} raqamli buyurtma biriktirildi (${order.totalQuantity} dona suv). Manzil: ${order.deliveryAddress}`,
      'DELIVERY',
      driver.id,
      { orderId: order.id }
    );

    // Notify Customer
    this.createNotification(
      'CUSTOMER',
      'Haydovchi biriktirildi',
      `Buyurtmangiz haydovchi ${driver.name}ga biriktirildi (${driver.phone}).`,
      'ORDER',
      order.customerId,
      { orderId: order.id }
    );

    const operator = this.users.find(u => u.id === operatorId) || { name: 'Operator' };
    this.logAudit(
      operatorId,
      operator.name,
      'OPERATOR',
      'ASSIGN_ORDER',
      'Order',
      order.id,
      `Buyurtma ${driver.name}ga biriktirildi`
    );

    return order;
  }

  // 5. Driver accepts order
  driverAcceptOrder(orderId: string, driverId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Buyurtma topilmadi');
    if (order.assignedDriverId !== driverId) throw new Error('Bu buyurtma sizga biriktirilmagan');

    order.orderStatus = 'ACCEPTED';
    order.updatedAt = new Date().toISOString();

    const driver = this.users.find(u => u.id === driverId)!;
    this.logAudit(driverId, driver.name, 'DRIVER', 'ACCEPT_ORDER', 'Order', order.id, 'Haydovchi qabul qildi');
    return order;
  }

  // 6. Driver departs ("Yo'lga chiqish")
  driverDepart(orderId: string, driverId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Buyurtma topilmadi');
    if (order.assignedDriverId !== driverId) throw new Error('Bu buyurtma sizga biriktirilmagan');

    order.orderStatus = 'ON_THE_WAY';
    order.updatedAt = new Date().toISOString();

    const driverProfile = this.driverProfiles.find(d => d.userId === driverId);
    if (driverProfile) {
      driverProfile.status = 'ON_ROUTE';
    }

    // Customer Notification
    this.createNotification(
      'CUSTOMER',
      'Haydovchi yo\'lga chiqdi',
      `Buyurtmangiz yo\'lda! Haydovchi tez orada yetib keladi.`,
      'ORDER',
      order.customerId,
      { orderId: order.id }
    );

    const driver = this.users.find(u => u.id === driverId)!;
    this.logAudit(driverId, driver.name, 'DRIVER', 'DEPART', 'Order', order.id, 'Haydovchi manzil sari yo\'lga chiqdi');
    return order;
  }

  // 7. Driver arrives ("Manzilga yetib keldim")
  driverArrive(orderId: string, driverId: string, lat?: number, lng?: number) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Buyurtma topilmadi');
    if (order.assignedDriverId !== driverId) throw new Error('Bu buyurtma sizga biriktirilmagan');

    order.orderStatus = 'ARRIVED';
    order.updatedAt = new Date().toISOString();

    const driverProfile = this.driverProfiles.find(d => d.userId === driverId);
    if (driverProfile && lat && lng) {
      driverProfile.currentLat = lat;
      driverProfile.currentLng = lng;
      driverProfile.lastLocationUpdate = new Date().toISOString();
    }

    // Customer Notification
    this.createNotification(
      'CUSTOMER',
      'Haydovchi yetib keldi',
      `Haydovchi manzilingizga yetib keldi. Iltimos eshikni oching yoki qo\'ng\'iroqqa javob bering.`,
      'ORDER',
      order.customerId,
      { orderId: order.id }
    );

    const driver = this.users.find(u => u.id === driverId)!;
    this.logAudit(driverId, driver.name, 'DRIVER', 'ARRIVED', 'Order', order.id, 'Haydovchi manzilga yetib keldi');
    return order;
  }

  // 8. Driver reports an issue with photo & notes
  reportIssue(data: {
    orderId: string;
    driverId: string;
    issueType: IssueType;
    quantityAffected: number;
    notes: string;
    photoUrls: string[];
    lat?: number;
    lng?: number;
  }) {
    const order = this.orders.find(o => o.id === data.orderId);
    if (!order) throw new Error('Buyurtma topilmadi');

    const driver = this.users.find(u => u.id === data.driverId);
    if (!driver) throw new Error('Haydovchi topilmadi');

    const issueNumber = `ISS-${(this.deliveryIssues.length + 1).toString().padStart(4, '0')}`;
    const newIssue: DeliveryIssue = {
      id: `iss_${Date.now()}`,
      issueNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      driverId: driver.id,
      driverName: driver.name,
      driverPhone: driver.phone,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      issueType: data.issueType,
      quantityAffected: data.quantityAffected || 0,
      notes: data.notes,
      photoUrls: data.photoUrls || [],
      reportedAt: new Date().toISOString(),
      status: 'NEW',
      lat: data.lat,
      lng: data.lng,
    };

    this.deliveryIssues.unshift(newIssue);
    order.orderStatus = 'ISSUE_REPORTED';
    order.updatedAt = new Date().toISOString();

    // Alert Operator and Admin
    this.createNotification(
      'OPERATOR',
      'Haydovchidan yangi muammo xabari!',
      `${issueNumber} (${driver.name}): ${data.notes} - Buyurtma: ${order.orderNumber}`,
      'ISSUE',
      undefined,
      { issueId: newIssue.id, orderId: order.id }
    );

    this.createNotification(
      'ADMIN',
      'Muammo qayd etildi',
      `${issueNumber}: ${order.orderNumber} buyurtmasida muammo qayd etildi.`,
      'ISSUE',
      undefined,
      { issueId: newIssue.id }
    );

    this.logAudit(
      driver.id,
      driver.name,
      'DRIVER',
      'REPORT_ISSUE',
      'DeliveryIssue',
      newIssue.id,
      `Muammo qayd etildi: ${data.issueType}, ${data.notes}`
    );

    return newIssue;
  }

  // 9. Complete Delivery with Electronic Signature, Bottles Collected & Ledger Update
  completeDelivery(data: {
    orderId: string;
    driverId: string;
    deliveredBottles: number;
    emptyBottlesCollected: number;
    damagedBottlesReported: number;
    discrepancyReason?: string;
    signatureImage: string; // Base64 data URL
    deliveryLat?: number;
    deliveryLng?: number;
  }) {
    const order = this.orders.find(o => o.id === data.orderId);
    if (!order) throw new Error('Buyurtma topilmadi');

    // Server-level prevention of double delivery
    if (order.orderStatus === 'DELIVERED' || order.orderStatus === 'PARTIALLY_DELIVERED') {
      throw new Error('Bu buyurtma allaqachon topshirilgan!');
    }

    const driver = this.users.find(u => u.id === data.driverId);
    if (!driver) throw new Error('Haydovchi topilmadi');

    if (!data.signatureImage || data.signatureImage.trim().length === 0) {
      throw new Error('Mijozning elektron imzosi majburiy!');
    }

    const plannedBottles = order.totalQuantity;
    const isPartial = data.deliveredBottles < plannedBottles;

    if (isPartial && (!data.discrepancyReason || data.discrepancyReason.trim().length === 0)) {
      throw new Error('Yetkazilgan miqdor buyurtmadan kam bo\'lsa, sababi ko\'rsatilishi shart!');
    }

    const finalStatus: OrderStatus = isPartial ? 'PARTIALLY_DELIVERED' : 'DELIVERED';
    const now = new Date().toISOString();

    // 1. Update Order status
    order.orderStatus = finalStatus;
    order.paymentStatus = 'PAID';
    order.updatedAt = now;

    // 2. Atomic Warehouse Stock Reconciliation
    // Deduct actual delivered bottles from fullBottles, release unused reserved bottles
    for (const item of order.items) {
      const stock = this.warehouseStocks.find(s => s.productId === item.productId);
      if (stock) {
        // Unreserve
        stock.reservedBottles = Math.max(0, stock.reservedBottles - item.quantity);
        // Deduct actual delivered
        const actualDeducted = Math.min(item.quantity, data.deliveredBottles);
        stock.fullBottles = Math.max(0, stock.fullBottles - actualDeducted);

        // Add returned empty bottles
        stock.emptyBottles += data.emptyBottlesCollected;

        // Add damaged bottles
        stock.damagedBottles += data.damagedBottlesReported;

        stock.updatedAt = now;

        // Record stock movements
        this.stockMovements.unshift({
          id: `sm_${Date.now()}_out`,
          warehouseId: stock.warehouseId,
          productId: stock.productId,
          type: 'OUTGOING_ORDER',
          quantity: actualDeducted,
          previousBalance: stock.fullBottles + actualDeducted,
          newBalance: stock.fullBottles,
          referenceType: 'ORDER',
          referenceId: order.id,
          operatorId: driver.id,
          operatorName: driver.name,
          notes: `${order.orderNumber} bo'yicha mijozga yetkazildi`,
          timestamp: now,
        });

        if (data.emptyBottlesCollected > 0) {
          this.stockMovements.unshift({
            id: `sm_${Date.now()}_ret`,
            warehouseId: stock.warehouseId,
            productId: stock.productId,
            type: 'CONTAINER_RETURN',
            quantity: data.emptyBottlesCollected,
            previousBalance: stock.emptyBottles - data.emptyBottlesCollected,
            newBalance: stock.emptyBottles,
            referenceType: 'ORDER',
            referenceId: order.id,
            operatorId: driver.id,
            operatorName: driver.name,
            notes: `${order.orderNumber} bo'yicha ${data.emptyBottlesCollected} ta bo'sh idish qaytarildi`,
            timestamp: now,
          });
        }

        if (data.damagedBottlesReported > 0) {
          this.stockMovements.unshift({
            id: `sm_${Date.now()}_dmg`,
            warehouseId: stock.warehouseId,
            productId: stock.productId,
            type: 'DAMAGE_WRITE_OFF',
            quantity: data.damagedBottlesReported,
            previousBalance: stock.damagedBottles - data.damagedBottlesReported,
            newBalance: stock.damagedBottles,
            referenceType: 'ORDER',
            referenceId: order.id,
            operatorId: driver.id,
            operatorName: driver.name,
            notes: `${order.orderNumber} topshirishda ${data.damagedBottlesReported} ta shikastlangan idish qayd etildi`,
            timestamp: now,
          });
        }
      }
    }

    // 3. Update Customer Container Balance (Ledger)
    const customerProfile = this.customerProfiles.find(cp => cp.userId === order.customerId);
    const bottleDiff = data.deliveredBottles - data.emptyBottlesCollected;
    const currentBalance = customerProfile ? customerProfile.emptyBottlesBalance : 0;
    const newCustomerBalance = currentBalance + bottleDiff;

    if (customerProfile) {
      customerProfile.emptyBottlesBalance = newCustomerBalance;
    }

    this.containerLedgers.unshift({
      id: `cld_${Date.now()}`,
      customerId: order.customerId,
      orderId: order.id,
      driverId: driver.id,
      transactionType: bottleDiff > 0 ? 'ISSUED' : 'RETURNED',
      quantity: Math.abs(bottleDiff),
      balanceAfter: newCustomerBalance,
      notes: `Yetkazildi: ${data.deliveredBottles} dona, Qaytarildi: ${data.emptyBottlesCollected} dona, Shikastlangan: ${data.damagedBottlesReported} dona`,
      timestamp: now,
    });

    // 4. Record Delivery entity
    const delivery: Delivery = {
      id: `del_${order.id}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      driverId: driver.id,
      driverName: driver.name,
      customerId: order.customerId,
      customerName: order.customerName,
      completedAt: now,
      plannedBottles,
      deliveredBottles: data.deliveredBottles,
      emptyBottlesCollected: data.emptyBottlesCollected,
      damagedBottlesReported: data.damagedBottlesReported,
      discrepancyReason: data.discrepancyReason,
      signatureImage: data.signatureImage,
      deliveryLat: data.deliveryLat,
      deliveryLng: data.deliveryLng,
      status: finalStatus === 'DELIVERED' ? 'DELIVERED' : 'PARTIALLY_DELIVERED',
      createdAt: now,
    };
    this.deliveries.unshift(delivery);

    // 5. Update Driver daily count
    const driverProfile = this.driverProfiles.find(d => d.userId === driver.id);
    if (driverProfile) {
      driverProfile.dailyDeliveredCount += 1;
      driverProfile.activeOrdersCount = Math.max(0, driverProfile.activeOrdersCount - 1);
      driverProfile.status = driverProfile.activeOrdersCount > 0 ? 'ON_ROUTE' : 'AVAILABLE';
    }

    // 6. Notifications to Operator and Admin
    const msg = isPartial
      ? `${order.orderNumber} qisman topshirildi (${data.deliveredBottles}/${plannedBottles}). Sabab: ${data.discrepancyReason}`
      : `${order.orderNumber} muvaffaqiyatli to'liq yetkazildi va elektron imzo bilan tasdiqlandi.`;

    this.createNotification(
      'OPERATOR',
      isPartial ? 'Buyurtma qisman topshirildi' : 'Buyurtma muvaffaqiyatli topshirildi',
      msg,
      'DELIVERY',
      undefined,
      { orderId: order.id }
    );

    this.createNotification(
      'ADMIN',
      'Yetkazib berish yakunlandi',
      `${order.orderNumber}: ${data.deliveredBottles} dona suv topshirildi, ${data.emptyBottlesCollected} ta bo'sh idish qaytdi.`,
      'DELIVERY',
      undefined,
      { orderId: order.id }
    );

    this.createNotification(
      'CUSTOMER',
      'Suv yetkazib berildi',
      `Rahmat! ${order.orderNumber} raqamli buyurtmangiz muvaffaqiyatli topshirildi.`,
      'DELIVERY',
      order.customerId,
      { orderId: order.id }
    );

    this.logAudit(
      driver.id,
      driver.name,
      'DRIVER',
      'COMPLETE_DELIVERY',
      'Order',
      order.id,
      `Yetkazildi: ${data.deliveredBottles}/${plannedBottles}, bo'sh idishlar: ${data.emptyBottlesCollected}, shikastlangan: ${data.damagedBottlesReported}`
    );

    return { order, delivery };
  }

  // -------------------------------------------------------------
  // WAREHOUSE OPERATIONS (ADMIN)
  // -------------------------------------------------------------
  recordStockReceipt(productId: string, quantity: number, notes: string, adminId: string) {
    const stock = this.warehouseStocks.find(s => s.productId === productId);
    if (!stock) throw new Error('Mahsulot zaxirasi topilmadi');

    const prev = stock.fullBottles;
    stock.fullBottles += quantity;
    stock.updatedAt = new Date().toISOString();

    const admin = this.users.find(u => u.id === adminId) || { name: 'Admin', role: 'ADMIN' };

    this.stockMovements.unshift({
      id: `sm_${Date.now()}_in`,
      warehouseId: stock.warehouseId,
      productId,
      type: 'INCOMING',
      quantity,
      previousBalance: prev,
      newBalance: stock.fullBottles,
      referenceType: 'MANUAL',
      operatorId: adminId,
      operatorName: admin.name,
      notes,
      timestamp: new Date().toISOString(),
    });

    this.logAudit(adminId, admin.name, 'ADMIN', 'STOCK_RECEIPT', 'WarehouseStock', stock.id, `Omborga ${quantity} dona kirim qilindi`);
    return stock;
  }

  recordInventoryAdjustment(productId: string, actualFull: number, actualEmpty: number, actualDamaged: number, notes: string, adminId: string) {
    const stock = this.warehouseStocks.find(s => s.productId === productId);
    if (!stock) throw new Error('Mahsulot zaxirasi topilmadi');

    const admin = this.users.find(u => u.id === adminId) || { name: 'Admin', role: 'ADMIN' };

    stock.fullBottles = actualFull;
    stock.emptyBottles = actualEmpty;
    stock.damagedBottles = actualDamaged;
    stock.updatedAt = new Date().toISOString();

    this.stockMovements.unshift({
      id: `sm_${Date.now()}_inv`,
      warehouseId: stock.warehouseId,
      productId,
      type: 'INVENTORY_ADJUST',
      quantity: actualFull,
      previousBalance: actualFull,
      newBalance: actualFull,
      referenceType: 'INSPECTION',
      operatorId: adminId,
      operatorName: admin.name,
      notes: `Inventarizatsiya: ${notes}`,
      timestamp: new Date().toISOString(),
    });

    this.logAudit(adminId, admin.name, 'ADMIN', 'INVENTORY_ADJUST', 'WarehouseStock', stock.id, notes);
    return stock;
  }

  // -------------------------------------------------------------
  // METRICS & DASHBOARD STATS
  // -------------------------------------------------------------
  getDashboardStats() {
    const todayStr = '2026-10-14';
    const ordersToday = this.orders.filter(o => o.createdAt.startsWith(todayStr));
    const deliveredToday = ordersToday.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'PARTIALLY_DELIVERED').length;
    const pendingOrders = this.orders.filter(o => o.orderStatus === 'PENDING').length;
    const inProgressOrders = this.orders.filter(o => ['CONFIRMED', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED'].includes(o.orderStatus)).length;
    const cancelledOrders = this.orders.filter(o => o.orderStatus === 'CANCELLED').length;

    const totalCustomers = this.users.filter(u => u.role === 'CUSTOMER').length;
    const activeDrivers = this.driverProfiles.filter(d => d.status === 'AVAILABLE' || d.status === 'ON_ROUTE').length;

    let totalFullBottles = 0;
    let totalEmptyBottles = 0;
    let totalDamagedBottles = 0;

    this.warehouseStocks.forEach(s => {
      totalFullBottles += s.fullBottles;
      totalEmptyBottles += s.emptyBottles;
      totalDamagedBottles += s.damagedBottles;
    });

    const revenueToday = ordersToday
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    const revenueThisMonth = this.orders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    const unassignedOrdersCount = this.orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED').length;
    const activeIssuesCount = this.deliveryIssues.filter(i => i.status === 'NEW' || i.status === 'UNDER_REVIEW').length;

    return {
      ordersToday: ordersToday.length,
      deliveredToday,
      pendingOrders,
      inProgressOrders,
      cancelledOrders,
      totalCustomers,
      activeDrivers,
      totalFullBottles,
      totalEmptyBottles,
      totalDamagedBottles,
      revenueToday,
      revenueThisMonth,
      unassignedOrdersCount,
      activeIssuesCount,
    };
  }

  // -------------------------------------------------------------
  // AUTHENTICATION & REGISTRATION
  // -------------------------------------------------------------
  authenticateUser(identifier: string, passwordAttempt: string): User {
    if (!identifier || !passwordAttempt) {
      throw new Error('Login va parol kiritilishi shart');
    }

    const cleanInput = identifier.trim().toLowerCase();
    const cleanPhoneDigits = identifier.replace(/\D/g, '');

    const user = this.users.find(u => {
      if (u.email.toLowerCase() === cleanInput) return true;
      if (u.id.toLowerCase() === cleanInput) return true;
      if (cleanInput === 'admin' && u.role === 'ADMIN') return true;
      if (cleanInput === 'operator' && u.role === 'OPERATOR') return true;
      if (cleanInput === 'driver' && u.id === 'usr_driver_1') return true;

      const userPhoneDigits = u.phone.replace(/\D/g, '');
      if (cleanPhoneDigits.length >= 7 && userPhoneDigits.endsWith(cleanPhoneDigits.slice(-7))) {
        return true;
      }
      return false;
    });

    if (!user) {
      throw new Error('Bunday login, telefon raqami yoki email bilan foydalanuvchi topilmadi');
    }

    if (user.status === 'BLOCKED') {
      throw new Error('Hisobingiz ma\'muriyat tomonidan vaqtincha bloklangan. Iltimos operatorga murojaat qiling.');
    }

    if (user.password && user.password !== passwordAttempt.trim()) {
      throw new Error('Kiritilgan parol noto\'g\'ri!');
    }

    user.lastLoginAt = new Date().toISOString();
    this.logAudit(user.id, user.name, user.role, 'LOGIN', 'User', user.id, 'Tizimga muvaffaqiyatli kirdi');
    return user;
  }

  registerCustomer(data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    addressLine: string;
    district?: string;
    companyName?: string;
  }): User {
    const { name, phone, email, password, addressLine, district, companyName } = data;

    if (!name || name.trim().length < 2) {
      throw new Error('Ism va familiyangizni to\'liq kiriting');
    }
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      throw new Error('Telefon raqamini to\'g\'ri formatda kiriting (+998...)');
    }
    if (!password || password.length < 4) {
      throw new Error('Parol kamida 4 ta belgidan iborat bo\'lishi kerak');
    }

    const phoneDigits = phone.replace(/\D/g, '');
    const existing = this.users.find(u => {
      const uDigits = u.phone.replace(/\D/g, '');
      return uDigits.endsWith(phoneDigits.slice(-9));
    });

    if (existing) {
      throw new Error('Ushbu telefon raqami bilan allaqachon hisob mavjud! Iltimos tizimga kiring.');
    }

    const now = new Date().toISOString();
    const cleanEmail = email && email.trim().length > 0
      ? email.trim().toLowerCase()
      : `cust_${Date.now()}@aquaflow.uz`;

    const newUser: User = {
      id: `usr_customer_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: now,
      lastLoginAt: now,
    };
    this.users.push(newUser);

    // Create Customer Profile
    this.customerProfiles.push({
      id: `cp_${Date.now()}`,
      userId: newUser.id,
      companyName: companyName?.trim() || '',
      emptyBottlesBalance: 0,
      financialBalance: 0,
      notes: 'Yangi onlayn ro\'yxatdan o\'tgan mijoz',
      isArchived: false,
      createdAt: now,
    });

    // Create Address
    this.addresses.push({
      id: `addr_${Date.now()}`,
      userId: newUser.id,
      title: 'Asosiy manzil',
      addressLine: addressLine || 'Toshkent shahri',
      district: district || 'Yunusobod',
      lat: 41.311081,
      lng: 69.240562,
      isDefault: true,
    });

    this.createNotification(
      'ADMIN',
      'Yangi mijoz ro\'yxatdan o\'tdi',
      `${newUser.name} (${newUser.phone}) tizimda ro'yxatdan o'tdi.`,
      'SYSTEM',
      undefined,
      { customerId: newUser.id }
    );

    this.logAudit(newUser.id, newUser.name, 'CUSTOMER', 'REGISTER', 'User', newUser.id, 'Yangi mijoz ro\'yxatdan o\'tdi');
    return newUser;
  }
}

export const db = new AquaFlowDatabase();
