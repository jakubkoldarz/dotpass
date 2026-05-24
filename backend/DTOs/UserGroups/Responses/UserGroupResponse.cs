namespace backend.DTOs.UserGroups.Responses
{
    public class UserGroupResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid WorkspaceId { get; set; }
    }
}
