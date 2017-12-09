import json

import webapp2

from . import mongodb

from bson.json_util import dumps

class RestHandler(webapp2.RequestHandler):

  def dispatch(self):
    # time.sleep(1)
    super(RestHandler, self).dispatch()

  def send_json(self, content):
    self.response.headers['content-type'] = 'application/json'
    self.response.write(content)


class AuthHandler(RestHandler):

  def post(self):
    users = mongodb.list('users')
    payload = json.loads(self.request.body)
    response = None
    for user in users:
      if user["email"] == payload["email"] and user["password"] == payload["password"]:
        response = user
    if response is None:
      response = "User Authentication Failed"
    self.send_json(dumps(response))


APP = webapp2.WSGIApplication([
  ('/rest/auth', AuthHandler)
], debug=True)
