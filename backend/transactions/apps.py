from django.apps import AppConfig


class TransactionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'transactions'
    verbose_name = 'Transactions'

    def ready(self):
        # Importing signals here registers them with Django's signal dispatcher
        # once all apps are loaded. This is the canonical Django pattern.
        import transactions.signals  # noqa: F401
