from google.appengine.ext import vendor
import os, sys
import tempfile

tempfile.SpooledTemporaryFile = tempfile.TemporaryFile
on_appengine = os.environ.get('SERVER_SOFTWARE','').startswith('Development')
if on_appengine and os.name == 'nt':
  sys.platform = "Not Windows"

vendor.add('lib')
