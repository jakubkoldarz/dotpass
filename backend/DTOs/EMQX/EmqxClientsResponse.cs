namespace backend.DTOs.EMQX
{
    public class EmqxClientsResponse
    {
        public IEnumerable<EmqxClientResponse> Clients { get; set; } = [];
    }
}
