using backend.Exceptions;
using System.Security.Claims;

namespace backend.Extension
{
    public static class ClaimsExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal principal)
        {
            var stringUUID = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if(Guid.TryParse(stringUUID, out var userUUID))
            {
                throw new UnauthorizedException("");
            }
            return userUUID;
        }
    }
}
