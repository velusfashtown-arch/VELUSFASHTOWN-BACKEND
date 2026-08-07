/**
 * Standard API response helper.
 *
 * All responses follow the format:
 * {
 *   success: true|false,
 *   message: "",
 *   data: {},
 *   pagination: {},
 *   errors: []
 * }
 */

class ApiResponse {
  static success(res, { data = null, message = 'Success', statusCode = 200, pagination = null } = {}) {
    const response = {
      success: true,
      message,
      data,
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, { data = null, message = 'Created successfully' } = {}) {
    return this.success(res, { data, message, statusCode: 201 });
  }

  static error(res, { message = 'Internal Server Error', statusCode = 500, errors = [] } = {}) {
    const response = {
      success: false,
      message,
      data: null,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static badRequest(res, { message = 'Bad Request', errors = [] } = {}) {
    return this.error(res, { message, statusCode: 400, errors });
  }

  static unauthorized(res, { message = 'Unauthorized' } = {}) {
    return this.error(res, { message, statusCode: 401 });
  }

  static forbidden(res, { message = 'Forbidden' } = {}) {
    return this.error(res, { message, statusCode: 403 });
  }

  static notFound(res, { message = 'Resource not found' } = {}) {
    return this.error(res, { message, statusCode: 404 });
  }

  static conflict(res, { message = 'Resource already exists' } = {}) {
    return this.error(res, { message, statusCode: 409 });
  }

  static tooManyRequests(res, { message = 'Too many requests, please try again later' } = {}) {
    return this.error(res, { message, statusCode: 429 });
  }

  static paginated(res, { data = [], total = 0, page = 1, limit = 20, message = 'Success' } = {}) {
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return this.success(res, { data, message, pagination });
  }
}

module.exports = ApiResponse;

