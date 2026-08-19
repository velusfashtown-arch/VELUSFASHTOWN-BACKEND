const Customer = require('../../../../models/admin/Customers/Customer/Customer');
const logger = require('../../../../utils/logger');

async function seedCustomers() {
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

  if (forceReset) {
    await Customer.deleteMany({});
  }

  const existingCount = await Customer.countDocuments({});
  if (existingCount > 0) {
    logger.info(`Customers already seeded (${existingCount}). Skipping.`);
    return;
  }

  const customers = [
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '9876543210',
      password: 'Demo@1234',
      isVerified: true,
      addresses: [{
        name: 'Priya Sharma', phone: '9876543210', address: '12 MG Road, Andheri West',
        city: 'Mumbai', state: 'Maharashtra', pincode: '400058', isDefault: true, type: 'home',
      }],
    },
    {
      name: 'Ananya Iyer',
      email: 'ananya.iyer@example.com',
      phone: '9876543211',
      password: 'Demo@1234',
      isVerified: true,
      addresses: [{
        name: 'Ananya Iyer', phone: '9876543211', address: '45 Anna Salai',
        city: 'Chennai', state: 'Tamil Nadu', pincode: '600002', isDefault: true, type: 'home',
      }],
    },
    {
      name: 'Kavita Patel',
      email: 'kavita.patel@example.com',
      phone: '9876543212',
      password: 'Demo@1234',
      isVerified: true,
      addresses: [{
        name: 'Kavita Patel', phone: '9876543212', address: '7 SG Highway',
        city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', isDefault: true, type: 'home',
      }],
    },
    {
      name: 'Meera Reddy',
      email: 'meera.reddy@example.com',
      phone: '9876543213',
      password: 'Demo@1234',
      isVerified: false,
      addresses: [{
        name: 'Meera Reddy', phone: '9876543213', address: '23 Banjara Hills',
        city: 'Hyderabad', state: 'Telangana', pincode: '500034', isDefault: true, type: 'home',
      }],
    },
    {
      name: 'Sneha Gupta',
      email: 'sneha.gupta@example.com',
      phone: '9876543214',
      password: 'Demo@1234',
      isVerified: true,
      addresses: [{
        name: 'Sneha Gupta', phone: '9876543214', address: '18 Connaught Place',
        city: 'New Delhi', state: 'Delhi', pincode: '110001', isDefault: true, type: 'home',
      }],
    },
  ];

  // Uses .create() (not insertMany) so the pre-save password-hashing hook runs.
  for (const customer of customers) {
    await Customer.create(customer);
  }
  logger.info(`Seeded ${customers.length} customers`);
}

module.exports = { seedCustomers };
