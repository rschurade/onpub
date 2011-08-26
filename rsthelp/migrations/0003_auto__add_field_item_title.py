# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding field 'Item.title'
        db.add_column('rsthelp_item', 'title', self.gf('django.db.models.fields.CharField')(default='', max_length=100), keep_default=False)


    def backwards(self, orm):
        
        # Deleting field 'Item.title'
        db.delete_column('rsthelp_item', 'title')


    models = {
        'rsthelp.item': {
            'Meta': {'ordering': "('order',)", 'object_name': 'Item'},
            'code': ('django.db.models.fields.TextField', [], {}),
            'code_html': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['rsthelp']
