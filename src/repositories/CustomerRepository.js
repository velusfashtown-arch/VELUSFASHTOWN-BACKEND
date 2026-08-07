const BaseRepository = require('./BaseRepository');
const Customer = require('../models/admin/Customer');

class CustomerRepository extends BaseRepository {
  constructor() {
    super(Customer);
  }

  /**
   * Find customer by email with sensitive fields.
   */
  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  /**
   * Find customer by email with password field.
   */
  async findByEmailWithPassword(email) {
    return this.model.findOne({ email }).select('+password');
  }

  /**
   * Find customer by email with OTP fields.
   */
  async findByEmailWithOTP(email) {
    return this.model.findOne({ email }).select('+otp +otpExpiry');
  }

  /**
   * Add address to customer's addresses.
   */
  async addAddress(customerId, address) {
    return this.model.findByIdAndUpdate(
      customerId,
      { $push: { addresses: address } },
      { new: true }
    );
  }

  /**
   * Update an address.
   */
  async updateAddress(customerId, addressId, addressData) {
    return this.model.findOneAndUpdate(
      { _id: customerId, 'addresses._id': addressId },
      { $set: { 'addresses.$': addressData } },
      { new: true }
    );
  }

  /**
   * Remove an address.
   */
  async removeAddress(customerId, addressId) {
    return this.model.findByIdAndUpdate(
      customerId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );
  }

  /**
   * Add product to wishlist.
   */
  async addToWishlist(customerId, productId) {
    return this.model.findByIdAndUpdate(
      customerId,
      { $addToSet: { wishlist: { product: productId } } },
      { new: true }
    );
  }

  /**
   * Remove product from wishlist.
   */
  async removeFromWishlist(customerId, productId) {
    return this.model.findByIdAndUpdate(
      customerId,
      { $pull: { wishlist: { product: productId } } },
      { new: true }
    );
  }

  /**
   * Get customer statistics.
   */
  async getStats() {
    return this.model.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          verifiedCustomers: {
            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] },
          },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
        },
      },
    ]);
  }
}

module.exports = new CustomerRepository();

