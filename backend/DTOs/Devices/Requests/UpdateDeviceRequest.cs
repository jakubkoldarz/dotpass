using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Devices.Requests
{
    public class UpdateDeviceRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
    }
}
