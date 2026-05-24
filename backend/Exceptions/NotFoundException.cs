using System.Net;

namespace backend.Exceptions
{
    public class NotFoundException : AppException
    {
        public NotFoundException(string message = "The requested resource could not be found") : base(message, HttpStatusCode.NotFound)
        {
        }
    }
}
