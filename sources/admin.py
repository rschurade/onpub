from django.contrib import admin

from .models import Source

class SourceAdmin(admin.ModelAdmin):
    list_display = ("identifier",)

admin.site.register(Source, SourceAdmin)
