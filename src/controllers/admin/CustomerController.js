const CustomerService = require('../../services/CustomerService');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/response');

class CustomerController {
  list = asyncHandler(async (req, res) => {
    const result = await CustomerService.listCustomers(req.query);
    return ApiResponse.paginated(res, {
      data: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  });

  getById = asyncHandler(async (req, res) => {
    const customer = await CustomerService.getCustomer(req.params.id);
    return ApiResponse.success(res, { data: customer });
  });

  update = asyncHandler(async (req, res) => {
    const customer = await CustomerService.updateCustomer(req.params.id, req.body);
    return ApiResponse.success(res, { data: customer, message: 'Customer updated successfully' });
  });

  delete = asyncHandler(async (req, res) => {
    await CustomerService.deleteCustomer(req.params.id);
    return ApiResponse.success(res, { message: 'Customer deleted successfully' });
  });

  getStats = asyncHandler(async (req, res) => {
    const stats = await CustomerService.getCustomerStats();
    return ApiResponse.success(res, { data: stats });
  });
}

module.exports = new CustomerController();

