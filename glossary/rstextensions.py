import re

from django.template.defaultfilters import slugify
from docutils import nodes
from docutils.parsers.rst import roles

from onpub.glossary.models import Term


def glossary_role(name, rawtext, text, lineno, inliner, options={}, content=[]):
    matches = re.search('([^<]+) ?(?:<(.*)>)?', text).groups()
    text = matches[0].strip()
    term = len(matches) == 2 and matches[1] or matches[0].strip()
    
    term_obj, created = Term.objects.get_or_create(slug=slugify(term))
    if created:
        term_obj.term = term
    term_obj.active = True
    term_obj.save()
    return [nodes.raw(rawtext, '<a href="%s" class="glossary">%s</a>' % (term_obj.get_absolute_url(), text), format='html')], []

roles.register_canonical_role('glossary', glossary_role)
