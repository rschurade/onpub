# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding field 'Section.number'
        db.add_column('content_section', 'number', self.gf('django.db.models.fields.PositiveIntegerField')(default=None, null=True, blank=True), keep_default=False)


    def backwards(self, orm):
        
        # Deleting field 'Section.number'
        db.delete_column('content_section', 'number')


    models = {
        'content.section': {
            'Meta': {'object_name': 'Section'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'number': ('django.db.models.fields.PositiveIntegerField', [], {'default': 'None', 'null': 'True', 'blank': 'True'}),
            'order': ('django.db.models.fields.PositiveIntegerField', [], {'blank': 'True'}),
            'scene': ('django.db.models.fields.CharField', [], {'max_length': '64', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'db_index': 'True'}),
            'subtitle': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {}),
            'text_html': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['content']
