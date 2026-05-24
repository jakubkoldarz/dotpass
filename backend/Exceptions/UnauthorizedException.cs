using System.Net;

namespace backend.Exceptions
{
    public class UnauthorizedException : AppException
    {
        public UnauthorizedException(string message = "Authentication is required. Please log in to access this resource") : base(message, HttpStatusCode.Unauthorized)
        {
        }
    }
}
