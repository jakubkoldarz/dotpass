using System.Net;

namespace backend.Exceptions
{
    public class BadRequestException : AppException
    {
        public BadRequestException(string message) : base(message, HttpStatusCode.BadRequest)
        {
        }
    }
}
