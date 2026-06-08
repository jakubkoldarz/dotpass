using System.Net;

namespace backend.Exceptions
{
    public class ForbiddenException : AppException
    {
        public ForbiddenException(string message = "Access denied. You do not have the required permissions to perform this action") : base(message, HttpStatusCode.Forbidden)
        {
        }
    }
}
