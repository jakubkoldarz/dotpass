using backend.Data;
using backend.DTOs.Devices.Requests;
using backend.Interfaces;
using MQTTnet;
using System.Text.Json;

namespace backend.Services
{
    public class MqttBackgroundService : BackgroundService
    {
        private readonly IMqttClient _mqttClient;
        private readonly MqttClientOptions _mqttOptions;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MqttBackgroundService> _logger;
        private readonly IConfiguration _configuration;

        public MqttBackgroundService(IServiceProvider serviceProvider, ILogger<MqttBackgroundService> logger, IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _configuration = configuration;

            var factory = new MqttClientFactory();
            _mqttClient = factory.CreateMqttClient();

            var username = _configuration["EMQX_BROKER_CLIENT_USERNAME"];
            var password = _configuration["EMQX_BROKER_CLIENT_PASSWORD"];

            _mqttOptions = new MqttClientOptionsBuilder()
                .WithTcpServer("emqx-broker", 1883)
                .WithCredentials(username, password)
                .WithClientId("DotPass_CSharp_Backend")
                .WithCleanSession()
                .Build();

            _mqttClient.ApplicationMessageReceivedAsync += HandleIncomingMessage;
        }

        private async Task HandleIncomingMessage(MqttApplicationMessageReceivedEventArgs e)
        {
            var topic = e.ApplicationMessage.Topic;
            var payload = e.ApplicationMessage.ConvertPayloadToString();

            _logger.LogInformation($"Message received [{topic}]: {payload}");

            if (topic == "access/requests")
            {
                try
                {
                    var request = JsonSerializer.Deserialize<UnlockRequest>(payload, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (request == null)
                    {
                        _logger.LogWarning("Received empty JSON request.");
                        return;
                    }

                    using var scope = _serviceProvider.CreateScope();
                    var deviceService = scope.ServiceProvider.GetRequiredService<IDeviceService>();
                    await deviceService.VerifyOfflineUnlock(request);
                    _logger.LogInformation($"Device [{request.MacAddress}] was successfuly activated offline!");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error occured during offline activation: {ex.Message}");
                }
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                if(!_mqttClient.IsConnected)
                {
                    try
                    {
                        _logger.LogInformation("Trying to connect with MQTT broker...");
                        await _mqttClient.ConnectAsync(_mqttOptions, stoppingToken);
                        _logger.LogInformation("Connected to MQTT!");

                        var subscribeOptions = new MqttClientSubscribeOptionsBuilder()
                            .WithTopicFilter("access/requests")
                            .Build();

                        await _mqttClient.SubscribeAsync(subscribeOptions, stoppingToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning($"Broker error. Waiting 5 seconds... Error: {ex.Message}");
                    }
                }

                await Task.Delay(5000, stoppingToken);
            }
        }
    }
}
