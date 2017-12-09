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


class BoardsHandler(RestHandler):

  def get(self):
    board_ids = self.request.GET.getall('board_ids')
    data = mongodb.list_where_value_in_array('boards', 'idShort', board_ids)
    self.send_json(dumps(data))


APP = webapp2.WSGIApplication([
  ('/rest/boards', BoardsHandler)
], debug=True)
