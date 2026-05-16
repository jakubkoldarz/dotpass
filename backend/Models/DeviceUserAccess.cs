using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class DeviceUserAccess
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid DeviceId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [ForeignKey(nameof(DeviceId))]
        public Device? Device { get; set; }
    }
}
