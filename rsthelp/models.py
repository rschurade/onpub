from django.db import models
from onpub.util.markup import formatter

class Item(models.Model):
    title = models.CharField(max_length=100)
    code = models.TextField()
    code_html = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if not len(self.code_html): 
            self.code_html = formatter(self.code)
        if not self.order:
            try:
                self.order = Item.objects.order_by('-order')[0].order + 1
            except:
                pass
        super(Item, self).save(*args, **kwargs)
    
    class Meta:
        ordering = ('order',)
