namespace backend.DTOs.Devices.Responses
{
    public class BasicDeviceResponse
    {
        public Guid Id { get; set; }
        public string? Name { get; set; } = string.Empty;
        public bool? IsPublicInWorkspace { get; set; }
    }
}
