using System.Text.Json.Serialization;

namespace backend.DTOs.EMQX
{
    public class EmqxClientsResponse
    {
        public IEnumerable<EmqxClientResponse> Data { get; set; } = [];
    }
}
