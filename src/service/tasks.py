import json

import webapp2

import requests

import requests_toolbelt.adapters.appengine

from . import mongodb

import datetime

from bson.json_util import dumps

class RestHandler(webapp2.RequestHandler):

  def dispatch(self):
    # time.sleep(1)
    super(RestHandler, self).dispatch()

  def send_json(self, content):
    self.response.headers['content-type'] = 'application/json'
    self.response.write(content)


class TasksHandler(RestHandler):

  def get(self):
    board_id = self.request.get('board_id')
    data = mongodb.list_where_value_matches('tasks', 'boards', board_id)
    self.send_json(dumps(data))

class TaskHandler(RestHandler):
  def post(self):
    key = '61cf04749fda864dd404009216cbe106'
    token = '2caecaa0245326fcc4b949a4780ad7fdcb8cd8d77b4394ad8590d244dbfa542f'

    payload = json.loads(self.request.body)
    payload['dateLastActivity'] = datetime.datetime.utcnow().isoformat()
    #task = mongodb.create(payload)

    boards = mongodb.list('boards')
    board = (board for board in boards if board["name"] == payload['team']['label']).next()
    phase_id = board['lists'][payload['phase']['id']]['id']
    params = { 'idList': phase_id, 'name': payload['name'], 'desc': payload['desc'], 'key': key, 'token': token }
    #this works need to sort out what is sent from client now and ensure that when new cards
    #are created they're added to both the relevant boards.
    #consider making a call to get all boards ids for reference data to be used by client
    cards_url = 'https://api.trello.com/1/cards'
    requests_toolbelt.adapters.appengine.monkeypatch()
    response = requests.post(cards_url, params=params)

    self.send_json(dumps(response.text))


APP = webapp2.WSGIApplication([
  ('/rest/tasks', TasksHandler),
  ('/rest/task', TaskHandler)
], debug=True)
