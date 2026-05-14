using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace backend.Tests;

// public class PingEndpointTests : IClassFixture<WebApplicationFactory<Program>>
// {
//     private readonly WebApplicationFactory<Program> _factory;

//     public PingEndpointTests(WebApplicationFactory<Program> factory)
//     {
//         _factory = factory;
//     }

//     [Fact]
//     public async Task Ping_ReturnsPong()
//     {
//         // Arrange
//         var client = _factory.CreateClient();

//         // Act
//         var response = await client.GetAsync("/Ping");
//         var content = await response.Content.ReadAsStringAsync();

//         // Assert
//         response.EnsureSuccessStatusCode(); // Zwraca błąd jeśli status to nie 2xx (np. 200 OK)
//         Assert.Equal("Pong", content);
//     }
// }