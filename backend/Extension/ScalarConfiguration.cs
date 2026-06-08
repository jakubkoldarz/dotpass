using Microsoft.OpenApi;

namespace backend.Extension
{
    public static class ScalarConfiguration
    {
        public static IServiceCollection AddScalarConfiguration(this IServiceCollection services)
        {

            services.AddOpenApi("v1", options =>
            {
                options.AddDocumentTransformer((document, context, cancellationToken) =>
                {
                    document.Info = new OpenApiInfo
                    {
                        Title = "DotPass API",
                        Version = "v1"
                    };

                    var securityScheme = new OpenApiSecurityScheme
                    {
                        Name = "Authorization",
                        Type = SecuritySchemeType.Http,
                        Scheme = "Bearer",
                        BearerFormat = "JWT",
                        In = ParameterLocation.Header
                    };

                    document.Components ??= new OpenApiComponents();
                    document.Components.SecuritySchemes = new Dictionary<string, IOpenApiSecurityScheme>
                    {
                        ["Bearer"] = securityScheme
                    };

                    document.Security = new List<OpenApiSecurityRequirement>
                    {
                        new OpenApiSecurityRequirement
                        {
                            {
                                new OpenApiSecuritySchemeReference("Bearer", document),
                                new List<string>()
                            }
                        }
                    };


                    return Task.CompletedTask;
                });
            });

            return services;
        }
    }
}
