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
                .WithClientId($"DotPass_Backend_{Guid.NewGuid().ToString()[..5]}")
                .WithCleanSession()
                .WithKeepAlivePeriod(TimeSpan.FromSeconds(30))
                .Build();

            _mqttClient.ApplicationMessageReceivedAsync += HandleIncomingMessage;

            _mqttClient.ConnectedAsync += async e =>
            {
                _logger.LogInformation("Connected to MQTT broker successfully!");

                var subscribeOptions = new MqttClientSubscribeOptionsBuilder()
                    .WithTopicFilter("access/requests")
                    .Build();

                await _mqttClient.SubscribeAsync(subscribeOptions);
                _logger.LogInformation("Successfully subscribed to topic: access/requests");
            };

            _mqttClient.DisconnectedAsync += async e =>
            {
                _logger.LogWarning("Disconnected from MQTT broker! Trying to reconnect in 5 seconds...");
                await Task.Delay(TimeSpan.FromSeconds(5));

                try
                {
                    await _mqttClient.ConnectAsync(_mqttOptions);
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Automatic reconnect failed: {ex.Message}");
                }
            };
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
            try
            {
                _logger.LogInformation("Initializing first MQTT connection...");
                await _mqttClient.ConnectAsync(_mqttOptions, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Initial connection failed (Broker might be offline): {ex.Message}");
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
        }
    }
}
