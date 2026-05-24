using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Devices.Requests
{
    public class AssignDeviceRequest
    {
        [Required]
        public Guid WorkspaceId { get; set; }
    }
}
