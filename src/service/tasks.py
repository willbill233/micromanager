import json

import webapp2

import urllib2

from . import mongodb

from bson.json_util import dumps

class RestHandler(webapp2.RequestHandler):

  def dispatch(self):
    # time.sleep(1)
    super(RestHandler, self).dispatch()

  def send_json(self, content):
    print (content)
    self.response.headers['content-type'] = 'application/json'
    self.response.write(content)


class TasksHandler(RestHandler):

  def get(self):
    # board = 'VI7zJBU0'
    # key = '61cf04749fda864dd404009216cbe106'
    # token = '2caecaa0245326fcc4b949a4780ad7fdcb8cd8d77b4394ad8590d244dbfa542f'
    # url = 'https://api.trello.com/1/boards/'+board+'/cards?key='+key+'&token='+token
    try:
      data = mongodb.list()
      self.send_json(dumps(data))
    except urllib2.URLError:
      logging.exception('Unable to resolve HTTP request')




APP = webapp2.WSGIApplication([
  ('/rest/tasks', TasksHandler)
], debug=True)
