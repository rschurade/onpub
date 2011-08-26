import os

from .default import PROJECT_ROOT

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(PROJECT_ROOT, 'database.db'),
        'USER': '',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}

MEDIA_ROOT = os.path.join(PROJECT_ROOT, 'media')

EMAIL_HOST = 'imap.gmail.com'
EMAIL_HOST_USER = 'test@pb.io'
EMAIL_HOST_PASSWORD = 'test3579'
EMAIL_USE_TLS = True
