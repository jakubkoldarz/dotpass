using System.Net;

namespace backend.Exceptions
{
    public class AppException(string message, HttpStatusCode statusCode = HttpStatusCode.InternalServerError) : Exception(message)
    {
        public HttpStatusCode StatusCode { get; } = statusCode;
    }
}
