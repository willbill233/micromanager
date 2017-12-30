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
  def get(self):
    users = mongodb.list('users')
    email = self.request.get('email')
    response = None
    for user in users:
      if user["email"] == email:
        response = user
        response["message"] = "User Authenticated"
        response["failed"] = False
    if response is None:
      response = { "message": "User Authentication Failed. Email or Password incorrect.", "failed": True }
    self.send_json(dumps(response))


APP = webapp2.WSGIApplication([
  ('/rest/auth', AuthHandler)
], debug=True)
