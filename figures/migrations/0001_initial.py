# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Figure'
        db.create_table('figures_figure', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('number', self.gf('django.db.models.fields.PositiveIntegerField')(default=None, null=True, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('image', self.gf('django.db.models.fields.files.ImageField')(max_length=100)),
            ('text', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('text_html', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal('figures', ['Figure'])


    def backwards(self, orm):
        
        # Deleting model 'Figure'
        db.delete_table('figures_figure')


    models = {
        'figures.figure': {
            'Meta': {'ordering': "('number', 'id')", 'object_name': 'Figure'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.files.ImageField', [], {'max_length': '100'}),
            'number': ('django.db.models.fields.PositiveIntegerField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'text_html': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['figures']
