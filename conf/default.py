import os.path

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PROJECT_NAME = os.path.split(PROJECT_ROOT)[-1]

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Philipp Bosch', 'admin@pb.io'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': '',                      # Or path to database file if using sqlite3.
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
    }
}

TIME_ZONE = 'Europe/Berlin'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_L10N = True

MEDIA_ROOT = os.path.join(PROJECT_ROOT, 'media')
MEDIA_URL = '/media/'
STATIC_ROOT = ''
STATIC_URL = '/static/'
PROJECT_STATIC_ROOT = os.path.join(PROJECT_ROOT, 'static')
STATICFILES_DIRS = (
    PROJECT_STATIC_ROOT,
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)

SECRET_KEY = '!4@1)%sgbpt5t*3ltkb(&z3+-d5rlsfr_$34pyesviu!nrr1kt'

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.contrib.messages.context_processors.messages',
    '%s.util.context_processors.is_ajax' % PROJECT_NAME,
)
ROOT_URLCONF = '%s.urls' % PROJECT_NAME

TEMPLATE_DIRS = (
    os.path.join(PROJECT_ROOT, 'templates'),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.markup',
    'south',
    'compressor',
    
    '%s.content' % PROJECT_NAME,
    '%s.figures' % PROJECT_NAME,
    '%s.glossary' % PROJECT_NAME,
    '%s.sources' % PROJECT_NAME,
    '%s.rsthelp' % PROJECT_NAME,
)

COMPRESS = True
COMPRESS_MTIME_DELAY = 1
COMPRESS_ROOT = PROJECT_STATIC_ROOT

MARKUP_FILTER = ('restructuredtext', {})
