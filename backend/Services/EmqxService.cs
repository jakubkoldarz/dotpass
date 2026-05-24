using backend.DTOs.EMQX;
using backend.Exceptions;
using backend.Interfaces;
using System.Buffers.Text;
using System.Net.Http.Headers;
using System.Runtime.InteropServices.Marshalling;
using System.Text;
using System.Text.Json;

namespace backend.Services
{
    public class EmqxService(HttpClient _httpClient, IConfiguration _config) : IEmqxService
    {
        private readonly string? baseUrl = _config["EMQX_API_URL"];
        private readonly string? apiKey = _config["EMQX_API_KEY"];
        private readonly string? secretKey = _config["EMQX_API_SECRET"];

        public async Task<IEnumerable<EmqxClientResponse>> GetDevicesAsync()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{baseUrl}/api/v5/clients");
            var response = await SendRequest(request);

            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            var emqxResponse = JsonSerializer.Deserialize<EmqxClientsResponse>(content, options);

            return emqxResponse?.Data ?? [];
        }

        public async Task PublishMessageAsync(string topic, string message)
        {
            var request = new HttpRequestMessage(HttpMethod.Post,  $"{baseUrl}/api/v5/publish");

            var body = JsonSerializer.Serialize(new
            {
                topic,
                payload = message,
                qos = 0
            });

            request.Content = new StringContent(body, Encoding.UTF8, "application/json");
            await SendRequest(request);
        }

        private async Task<HttpResponseMessage> SendRequest(HttpRequestMessage request)
        {
            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(secretKey))
            {
                throw new BadRequestException("Invalid broker configuration");
            }

            var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{apiKey}:{secretKey}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", auth);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            return response;
        }
    }
}
