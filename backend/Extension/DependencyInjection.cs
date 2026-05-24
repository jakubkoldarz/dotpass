using backend.Interfaces;
using backend.Services;

namespace backend.Extension
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IWorkspaceService, WorkspaceService>();
            services.AddScoped<IUserGroupService, UserGroupService>();
            services.AddScoped<IDeviceService, DeviceService>();

            return services;
        }
    }
}
