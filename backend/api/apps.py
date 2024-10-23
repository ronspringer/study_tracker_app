from django.apps import AppConfig

class YourAppConfig(AppConfig):
    name = 'api'

    def ready(self):
        import api.signals  # Import signals when the app is ready
