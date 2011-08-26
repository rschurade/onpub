from django.db import models
from django.template.defaultfilters import slugify

class Source(models.Model):
    identifier = models.CharField(max_length=255)
    title = models.CharField(max_length=255, blank=True)
    text = models.TextField(blank=True)
    link = models.URLField(blank=True, verify_exists=False)
    slug = models.SlugField(editable=False, blank=True, unique=True, max_length=255)
    
    def __unicode__(self):
        return u"%s" % self.identifier
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.identifier)
        super(Source, self).save(*args, **kwargs)
    
    class Meta:
        ordering = ('title', 'identifier')