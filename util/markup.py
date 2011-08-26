from docutils import core


def formatter(text, **kwargs):
    parts = core.publish_parts(source=text,
                               writer_name='html4css1',
                               **kwargs)
    return parts['html_body']
