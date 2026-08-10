const BaseRepository = require('./BaseRepository');
const Auth = require('../models/admin/auth/auth');

class AuthRepository extends BaseRepository {
  constructor() {
    super(Auth);
  }

  /**
   * Find admin by email with password field included.
   */
  async findByEmailWithPassword(email) {
    return this.model.findOne({ email }).select('+password');
  }

  /**
   * Find admin by email and return a real Mongoose document (not lean)
   * so instance methods like .save() work. Used by the password reset flow.
   */
  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  /**
   * Update last login timestamp.
   */
  async updateLastLogin(adminId) {
    return this.model.findByIdAndUpdate(adminId, { lastLogin: new Date() }, { new: true });
  }
}

module.exports = new AuthRepository();