namespace backend.Tests.Fakes;

using backend.Interfaces;
using backend.DTOs.EMQX;

public class FakeEmqxService : IEmqxService
{
    public Task<IEnumerable<EmqxClientResponse>> GetDevicesAsync() 
        => Task.FromResult(Enumerable.Empty<EmqxClientResponse>());

    public Task PublishMessageAsync(string topic, string message) 
        => Task.CompletedTask; 
}