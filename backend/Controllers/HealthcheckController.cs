using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/check")]
    [ApiController]
    public class HealthcheckController : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> CheckHealth()
        {
            return Ok();
        }
    }
}
