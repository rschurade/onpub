# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Item'
        db.create_table('rsthelp_item', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('code', self.gf('django.db.models.fields.TextField')()),
            ('order', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
        ))
        db.send_create_signal('rsthelp', ['Item'])


    def backwards(self, orm):
        
        # Deleting model 'Item'
        db.delete_table('rsthelp_item')


    models = {
        'rsthelp.item': {
            'Meta': {'ordering': "('order',)", 'object_name': 'Item'},
            'code': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['rsthelp']
