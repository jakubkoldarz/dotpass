using System.Net;

namespace backend.Exceptions
{
    public class BadRequestException : AppException
    {
        public BadRequestException(string message = "The request could not be processed due to invalid or missing data") : base(message, HttpStatusCode.BadRequest)
        {
        }
    }
}
