"""
AquaFlow Water Delivery Management System
Django Models & PostgreSQL Architecture Reference (Bosqich 2 uchun Django REST Framework mos modeli)
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from decimal import Decimal

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrator'
    OPERATOR = 'OPERATOR', 'Operator'
    DRIVER = 'DRIVER', 'Haydovchi'
    CUSTOMER = 'CUSTOMER', 'Mijoz'

class UserStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Faol'
    BLOCKED = 'BLOCKED', 'Bloklangan'
    ARCHIVED = 'ARCHIVED', 'Arxivlangan'

# 1. User
class User(AbstractUser):
    phone = models.CharField(max_length=20, unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.CUSTOMER, db_index=True)
    status = models.CharField(max_length=20, choices=UserStatus.choices, default=UserStatus.ACTIVE)
    avatar_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

# 2. CustomerProfile
class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    company_name = models.CharField(max_length=255, blank=True, null=True)
    empty_bottles_balance = models.IntegerField(default=0)  # Mijozdagi bo'sh idishlar soni
    financial_balance = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    notes = models.TextField(blank=True, null=True)
    is_archived = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

# 3. OperatorProfile
class OperatorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='operator_profile')
    shift = models.CharField(max_length=50, default='DAY')
    active_orders_managed = models.PositiveIntegerField(default=0)

# 4. DriverProfile
class DriverProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    vehicle_model = models.CharField(max_length=100)
    vehicle_plate = models.CharField(max_length=30, unique=True)
    status = models.CharField(max_length=30, default='AVAILABLE', db_index=True)
    current_lat = models.DecimalField(max_digits=9, decimal_places=6, default=Decimal('41.311081'))
    current_lng = models.DecimalField(max_digits=9, decimal_places=6, default=Decimal('69.240562'))
    last_location_update = models.DateTimeField(auto_now=True)
    daily_delivered_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('5.00'))
    active_orders_count = models.PositiveIntegerField(default=0)

# 5. Address
class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    title = models.CharField(max_length=100, default='Asosiy manzil')
    address_line = models.TextField()
    district = models.CharField(max_length=100, db_index=True)
    apartment = models.CharField(max_length=50, blank=True, null=True)
    floor = models.CharField(max_length=20, blank=True, null=True)
    door_code = models.CharField(max_length=50, blank=True, null=True)
    landmark = models.CharField(max_length=255, blank=True, null=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    is_default = models.BooleanField(default=True)

# 6. Product
class Product(models.Model):
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    volume_liters = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('18.90'))
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True, null=True)
    is_archived = models.BooleanField(default=False)
    min_stock_alert = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# 7. Warehouse
class Warehouse(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    manager_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)

# 8. WarehouseStock
class WarehouseStock(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stocks')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='warehouse_stocks')
    full_bottles = models.PositiveIntegerField(default=0)
    reserved_bottles = models.PositiveIntegerField(default=0)  # Zaxira qilingan
    empty_bottles = models.PositiveIntegerField(default=0)
    damaged_bottles = models.PositiveIntegerField(default=0)
    min_stock_alert = models.PositiveIntegerField(default=50)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('warehouse', 'product')

# 9. StockMovement
class StockMovement(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    type = models.CharField(max_length=40, db_index=True)
    quantity = models.IntegerField()
    previous_balance = models.IntegerField()
    new_balance = models.IntegerField()
    reference_type = models.CharField(max_length=50, blank=True)
    reference_id = models.CharField(max_length=100, blank=True)
    operator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

# 10. Order
class Order(models.Model):
    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=30)
    delivery_address = models.TextField()
    district = models.CharField(max_length=100)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    delivery_time_slot = models.CharField(max_length=100)
    payment_method = models.CharField(max_length=30)
    payment_status = models.CharField(max_length=30, default='PENDING', db_index=True)
    order_status = models.CharField(max_length=40, default='PENDING', db_index=True)
    total_quantity = models.PositiveIntegerField()
    total_amount = models.DecimalField(max_digits=14, decimal_places=2)
    customer_note = models.TextField(blank=True, null=True)
    operator_note = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    assigned_driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_orders')
    assigned_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

# 11. OrderItem
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2)

# 12. OrderAssignment
class OrderAssignment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='assignments')
    driver = models.ForeignKey(User, on_delete=models.PROTECT, related_name='driver_assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='operator_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, default='ASSIGNED')

# 13. Delivery
class Delivery(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    driver = models.ForeignKey(User, on_delete=models.PROTECT, related_name='deliveries')
    started_at = models.DateTimeField(blank=True, null=True)
    arrived_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    planned_bottles = models.PositiveIntegerField()
    delivered_bottles = models.PositiveIntegerField()
    empty_bottles_collected = models.PositiveIntegerField(default=0)
    damaged_bottles_reported = models.PositiveIntegerField(default=0)
    discrepancy_reason = models.TextField(blank=True, null=True)
    signature_image = models.TextField(blank=True, null=True) # Base64 or Object Storage URL
    delivery_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    delivery_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    status = models.CharField(max_length=40, default='PENDING')

# 14. DeliveryItem
class DeliveryItem(models.Model):
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity_delivered = models.PositiveIntegerField()

# 15. ContainerLedger
class ContainerLedger(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='container_ledgers')
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    driver = models.ForeignKey(User, on_delete=models.PROTECT)
    transaction_type = models.CharField(max_length=20) # ISSUED, RETURNED, DAMAGED
    quantity = models.IntegerField()
    balance_after = models.IntegerField()
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

# 16. DeliveryIssue
class DeliveryIssue(models.Model):
    issue_number = models.CharField(max_length=50, unique=True, db_index=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='issues')
    driver = models.ForeignKey(User, on_delete=models.PROTECT, related_name='reported_issues')
    issue_type = models.CharField(max_length=50, db_index=True)
    quantity_affected = models.PositiveIntegerField(default=0)
    notes = models.TextField()
    photo_urls = models.JSONField(default=list)
    reported_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, default='NEW', db_index=True)
    operator_response = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_issues')

# 17. IssueAttachment
class IssueAttachment(models.Model):
    issue = models.ForeignKey(DeliveryIssue, on_delete=models.CASCADE, related_name='attachments')
    file_url = models.URLField()
    file_type = models.CharField(max_length=50)
    uploaded_at = models.DateTimeField(auto_now_add=True)

# 18. DeliverySignature
class DeliverySignature(models.Model):
    delivery = models.OneToOneField(Delivery, on_delete=models.CASCADE, related_name='signature')
    signature_data_url = models.TextField()
    signed_by_name = models.CharField(max_length=200)
    signed_at = models.DateTimeField(auto_now_add=True)

# 19. Payment
class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    customer = models.ForeignKey(User, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    method = models.CharField(max_length=30)
    status = models.CharField(max_length=30, default='PENDING')
    transaction_reference = models.CharField(max_length=100, blank=True)
    paid_at = models.DateTimeField(blank=True, null=True)

# 20. Notification
class Notification(models.Model):
    recipient_role = models.CharField(max_length=30, db_index=True)
    recipient_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50)
    is_read = models.BooleanField(default=False, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

# 21. AuditLog
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    user_name = models.CharField(max_length=200)
    user_role = models.CharField(max_length=30)
    action = models.CharField(max_length=100, db_index=True)
    entity = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=100)
    details = models.TextField()
    ip_address = models.GenericIPAddressField(default='127.0.0.1')
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
