namespace backend.DTOs.Devices.Requests
{
    public class UnlockRequest
    {
        public Guid UserId { get; set; }
        public string MacAddress { get; set; } = string.Empty;
        public string Nonce { get; set; } = string.Empty;
        public string Hash { get; set; } = string.Empty;
    }
}