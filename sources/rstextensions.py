import re

from django.core.urlresolvers import reverse
from django.template.defaultfilters import slugify
from docutils import nodes
from docutils.parsers.rst import roles

from onpub.sources.models import Source


def source_role(name, rawtext, text, lineno, inliner, options={}, content=[]):
    matches = re.search('([^<]+) ?(?:<(.*)>)?', text).groups()
    text = matches[0].strip()
    identifier = len(matches) == 2 and matches[1] or matches[0].strip()
    
    source_obj, created = Source.objects.get_or_create(slug=slugify(identifier))
    if created:
        source_obj.identifier = identifier
        source_obj.save()
    return [nodes.raw(rawtext, '<a href="%s#%s" class="source">%s</a>' % (reverse('source_list'), source_obj.slug, text), format='html')], []

roles.register_canonical_role('source', source_role)
