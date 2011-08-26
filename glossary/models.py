from django.db import models
from django.template.defaultfilters import slugify

class Term(models.Model):
    term = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    slug = models.SlugField(editable=False, blank=True, unique=True)
    
    def __unicode__(self):
        return u"%s" % self.term
    
    def save(self, *args, **kwargs):
        self.slug = slugify(self.term)
        super(Term, self).save(*args, **kwargs)
    
    @models.permalink
    def get_absolute_url(self):
        return ('glossary_term', (self.slug,))