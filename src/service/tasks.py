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
    task = mongodb.create(payload, 'tasks')

    phase_id = payload['phase']['listId']
    team_phase_id = payload['phase']['teamListId']
    params = { 'idList': phase_id, 'name': payload['name'], 'desc': payload['desc'], 'key': key, 'token': token }
    team_params = { 'idList': team_phase_id, 'name': payload['name'], 'desc': payload['desc'], 'key': key, 'token': token }

    cards_url = 'https://api.trello.com/1/cards'
    requests_toolbelt.adapters.appengine.monkeypatch()
    response = requests.post(cards_url, params=params)
    if team_phase_id is not None:
      response = requests.post(cards_url, params=team_params)

    self.send_json(dumps(response.text))


APP = webapp2.WSGIApplication([
  ('/rest/tasks', TasksHandler),
  ('/rest/task', TaskHandler)
], debug=True)
