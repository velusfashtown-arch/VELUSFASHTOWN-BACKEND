const { z } = require('zod');

const createOrderSchema = z.object({
  body: z.object({
    customer: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
      phone: z.string().min(10, 'Valid phone is required'),
      address: z.string().min(1, 'Address is required'),
      landmark: z.string().optional().default(''),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      pincode: z.string().min(6, 'Valid pincode is required'),
    }),
    items: z.array(z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })).min(1, 'At least one item is required'),
    paymentMethod: z.enum(['COD', 'ONLINE']).optional().default('COD'),
    couponCode: z.string().optional().default(''),
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.string().min(1, 'Status is required'),
    notes: z.string().optional().default(''),
  }),
});

const updatePaymentSchema = z.object({
  body: z.object({
    paymentStatus: z.enum(['Pending', 'Paid', 'Refunded', 'Failed']),
    transactionId: z.string().optional().default(''),
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentSchema,
};

