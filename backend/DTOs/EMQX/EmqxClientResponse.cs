using System.Text.Json.Serialization;

namespace backend.DTOs.EMQX
{
    public class EmqxClientResponse
    {
        [JsonPropertyName("clientid")]
        public string ClientId { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public bool IsConnected { get; set; }
        public string ConnectedAt { get; set; } = string.Empty;
    }
}
