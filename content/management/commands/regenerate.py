from django.core.management.base import NoArgsCommand
from django.conf import settings
from django.utils.importlib import import_module
from onpub.content.models import Section

class Command(NoArgsCommand):
    can_import_settings = True
    
    def handle_noargs(self, *args, **options):
        for app in settings.INSTALLED_APPS:
            try:
                import_module("%s.rstextensions" % app)
            except ImportError:
                pass
        
        for section in Section.objects.all():
            section.save()
