// ✅ Success response
export const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

// ❌ Error response
export const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
/**
 Code	Meaning
400	Bad Request
401	Unauthorized
403	Forbidden
404	Not Found
500	Server Error
200 success code
 */