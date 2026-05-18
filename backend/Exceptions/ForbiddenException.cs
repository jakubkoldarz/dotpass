using System.Net;

namespace backend.Exceptions
{
    public class ForbiddenException : AppException
    {
        public ForbiddenException(string message) : base(message, HttpStatusCode.Forbidden)
        {
        }
    }
}
