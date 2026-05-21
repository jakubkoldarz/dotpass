using backend.Exceptions;
using System.Security.Claims;

namespace backend.Extension
{
    public static class ClaimsExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal principal)
        {
            var stringUUID = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if(!Guid.TryParse(stringUUID, out var userUUID))
            {
                throw new UnauthorizedException("");
            }
            return userUUID;
        }

        public static bool IsAdmin(this ClaimsPrincipal principal)
        {
            var isAdmin = principal.FindFirstValue("IsAdmin");

            if(!bool.TryParse(isAdmin, out bool isAdminValue))
            {
                return false;
            }

            return isAdminValue;
        }
    }
}
