using backend.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Devices.Requests
{
    public class UpdateDeviceRequest
    {
        public string Name { get; set; } = string.Empty;
        [Required]
        public bool IsPublicInWorkspace { get; set; }
        [Required]
        public UnlockMode UnlockMode { get; set; }
    }
}
