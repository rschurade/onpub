from django.contrib import admin

from .models import Term

class TermAdmin(admin.ModelAdmin):
    list_display = ("term", "slug", "active",)
    actions = ["activate", "deactivate"]
    
    def deactivate(self, request, queryset):
        queryset.update(active=False)
    deactivate.short_description = "Deactivate selected terms"
    
    def activate(self, request, queryset):
        queryset.update(active=True)
    activate.short_description = "Activate selected terms"

admin.site.register(Term, TermAdmin)
