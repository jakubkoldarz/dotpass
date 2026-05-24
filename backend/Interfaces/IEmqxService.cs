using backend.DTOs.EMQX;

namespace backend.Interfaces
{
    public interface IEmqxService
    {
        Task<IEnumerable<EmqxClientResponse>> GetDevicesAsync();
        Task PublishMessageAsync(string topic, string message);
    }
}
