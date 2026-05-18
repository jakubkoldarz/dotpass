using backend.Exceptions;
using System.Net;

namespace backend.Middleware
{
    public class ExceptionMiddleware(RequestDelegate _next, ILogger<ExceptionMiddleware> _logger)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex.Message);
                await HandleException(context, ex);
            }

        }

        public static Task HandleException(HttpContext context, Exception exception)
        {
            HttpStatusCode statusCode;
            string message;

            if(exception is AppException appEx)
            {
                statusCode = appEx.StatusCode;
                message = appEx.Message;
            }
            else
            {
                statusCode = HttpStatusCode.InternalServerError;
                message = "Internal server error";
            }

            context.Response.StatusCode = ((int)statusCode);

            return context.Response.WriteAsJsonAsync(new
            {
                error = message,
            });
        }
    }
}
