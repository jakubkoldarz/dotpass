using System.Net;

namespace backend.Tests;

public class HealthcheckControllerTest : BaseIntegrationTest
{
  public HealthcheckControllerTest(CustomWebApplicationFactory factory) : base(factory) { }

  [Fact]
  public async Task CheckHealth_Test()
  {
    await Client.GetAsync("/api/check").ContinueWith(response =>
    {
      Assert.Equal(HttpStatusCode.OK, response.Result.StatusCode);
    });
  }
}