using backend.Models.Enums;

namespace backend.DTOs.Devices.Responses
{
    public class DeviceResponse
    {
        public Guid Id { get; set; }
        public string? Name { get; set; } = string.Empty;
        public UnlockMode UnlockMode { get; set; }
        public string? MacAddress { get; set; } = string.Empty;
        public bool IsPublicInWorkspace { get; set; }
        public Guid? WorkspaceId { get; set; }
    }
}
