import json

import webapp2

import urllib2

class RestHandler(webapp2.RequestHandler):

  def dispatch(self):
    # time.sleep(1)
    super(RestHandler, self).dispatch()

  def send_json(self, content):
    self.response.headers['content-type'] = 'application/json'
    self.response.write(content)


class TasksHandler(RestHandler):

  def get(self):
    board = 'VI7zJBU0'
    key = '61cf04749fda864dd404009216cbe106'
    token = '2caecaa0245326fcc4b949a4780ad7fdcb8cd8d77b4394ad8590d244dbfa542f'
    url = 'https://api.trello.com/1/boards/'+board+'/cards?key='+key+'&token='+token
    try:
      response = urllib2.urlopen(url)
      data = response.read()
      self.send_json(data)
    except urllib2.URLError:
      logging.exception('Unable to resolve HTTP request')




APP = webapp2.WSGIApplication([
  ('/rest/tasks', TasksHandler)
], debug=True)
