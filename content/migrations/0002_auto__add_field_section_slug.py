# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding field 'Section.slug'
        db.add_column('content_section', 'slug', self.gf('django.db.models.fields.SlugField')(default='', max_length=50, db_index=True), keep_default=False)


    def backwards(self, orm):
        
        # Deleting field 'Section.slug'
        db.delete_column('content_section', 'slug')


    models = {
        'content.section': {
            'Meta': {'object_name': 'Section'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.PositiveIntegerField', [], {'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'db_index': 'True'}),
            'text': ('django.db.models.fields.TextField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['content']
