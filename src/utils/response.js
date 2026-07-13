export const sendSuccess = (
  res,
  data = null,
  message = "Success",
  statusCode = 200,
  extra = {},
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
};

export const sendError = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  errors = null,
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
