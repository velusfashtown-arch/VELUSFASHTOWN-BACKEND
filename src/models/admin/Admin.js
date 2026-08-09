const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../../constants');

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't include in queries by default
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.SUPPORT_MANAGER,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Indexes
AdminSchema.index({ role: 1 });

// Pre-save hook to hash password
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare password
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method: find by credentials
AdminSchema.statics.findByCredentials = async function (email, password) {
  const admin = await this.findOne({ email, isActive: true }).select('+password');
  if (!admin) return null;
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return null;
  return admin;
};

module.exports = mongoose.model('Admin', AdminSchema);

