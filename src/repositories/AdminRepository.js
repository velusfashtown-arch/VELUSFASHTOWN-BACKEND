const BaseRepository = require('./BaseRepository');
const Admin = require('../models/admin/Admin');

class AdminRepository extends BaseRepository {
  constructor() {
    super(Admin);
  }

  /**
   * Find admin by email with password field included.
   */
  async findByEmailWithPassword(email) {
    return this.model.findOne({ email }).select('+password');
  }

  /**
   * Find admin by ID with refresh token.
   */
  async findByIdWithRefreshToken(id) {
    return this.model.findById(id).select('+refreshToken');
  }

  /**
   * Update refresh token.
   */
  async updateRefreshToken(adminId, refreshToken) {
    return this.model.findByIdAndUpdate(adminId, { refreshToken }, { new: true });
  }

  /**
   * Update last login timestamp.
   */
  async updateLastLogin(adminId) {
    return this.model.findByIdAndUpdate(adminId, { lastLogin: new Date() }, { new: true });
  }
}

module.exports = new AdminRepository();

