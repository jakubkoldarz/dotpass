using backend.Data;
using backend.Extension;
using backend.Middleware;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using System.Net;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().ConfigureApiBehaviorOptions(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errorMessage = context.ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .FirstOrDefault() ?? "Validation failed";

        return new BadRequestObjectResult(new
        {
            error = errorMessage,
            status = HttpStatusCode.BadRequest
        });
    };
});  
builder.Services.AddEndpointsApiExplorer();


builder.Services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

builder.Services.AddDatabaseConfiguration(builder.Configuration);
builder.Services.AddJWTConfiguration(builder.Configuration);
builder.Services.AddServices();
builder.Services.AddAuthorization();
builder.Services.AddScalarConfiguration();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();
        Console.WriteLine("--> Migration executed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--> Migration error: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.MapScalarApiReference(options =>
        options.WithTitle("DotPass API - Scalar")
        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
        .AddPreferredSecuritySchemes("Bearer")
        .AddHttpAuthentication("Bearer", bearer => { bearer.Token = ""; })
    );
}

app.UseMiddleware<ExceptionMiddleware>();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();

public partial class Program { }