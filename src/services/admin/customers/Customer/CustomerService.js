const CustomerRepository = require('../../../../repositories/admin/customers/Customer/CustomerRepository');
const AppError = require('../../../../utils/AppError');
const logger = require('../../../../utils/logger');

class CustomerService {
  /**
   * List customers with pagination and search.
   */
  async listCustomers(queryParams) {
    const { page = 1, limit = 20, search, isActive, isVerified } = queryParams;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    return CustomerRepository.findAll(filter, {
      sort: { createdAt: -1 },
      page: Number(page),
      limit: Number(limit),
      select: '-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpires',
    });
  }

  /**
   * Get single customer by ID.
   */
  async getCustomer(id) {
    const customer = await CustomerRepository.findById(id, {
      select: '-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpires',
    });
    return customer;
  }

  /**
   * Update a customer.
   */
  async updateCustomer(id, data) {
    // Don't allow updating sensitive fields through this method
    const allowedFields = ['name', 'phone', 'avatar', 'isActive', 'isVerified'];
    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const customer = await CustomerRepository.updateById(id, updateData);
    logger.info(`Customer updated: ${customer.email}`);
    return customer;
  }

  /**
   * Delete a customer.
   */
  async deleteCustomer(id) {
    await CustomerRepository.deleteById(id);
    logger.info(`Customer deleted: ${id}`);
  }

  /**
   * Get customer statistics.
   */
  async getCustomerStats() {
    const stats = await CustomerRepository.getStats();
    return stats[0] || { totalCustomers: 0, verifiedCustomers: 0, activeCustomers: 0 };
  }

  /**
   * Register a new customer (website).
   */
  async register(data) {
    const existing = await CustomerRepository.findByEmail(data.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const customer = await CustomerRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      password: data.password,
    });

    logger.info(`Customer registered: ${customer.email}`);
    return customer;
  }
}

module.exports = new CustomerService();
