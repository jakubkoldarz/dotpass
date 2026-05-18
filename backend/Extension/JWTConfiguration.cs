using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace backend.Extension
{
    public static class JWTConfiguration
    {
        public static IServiceCollection AddJWTConfiguration(this IServiceCollection services, IConfiguration config)
        {
            var jwtKey = config["JWT_SECRET"] ?? config["Jwt:Secret"];
            var issuer = config["Jwt:Issuer"];
            var audience = config["Jwt:Audience"];

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateAudience = true,
                        ValidateIssuer = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = issuer,
                        ValidAudience = audience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
                    }
                );

            services.AddAuthorization();

            return services;
        }
    }
}
