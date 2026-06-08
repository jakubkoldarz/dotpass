using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class DeviceGroupAccess
    {
        [Required]
        public Guid UserGroupId { get; set; }
        
        [Required]
        public Guid DeviceId { get; set; }

        [ForeignKey(nameof(UserGroupId))]
        public UserGroup? UserGroup { get; set; }

        [ForeignKey(nameof(DeviceId))]
        public Device? Device { get; set; }
    }
}
