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

  def update_trello_card(self, id, params):
    card_url = 'https://api.trello.com/1/cards/' + id
    return requests.post(card_url, params=params)

  def create_trello_card(self, params):
    card_url = 'https://api.trello.com/1/cards'
    return requests.post(card_url, params=params)

class TasksHandler(RestHandler):

  def get(self):
    board_id = self.request.get('board_id')
    data = mongodb.list_where_value_matches('tasks', 'boards', board_id)
    self.send_json(dumps(data))

class CreateTaskHandler(RestHandler):
  def post(self):
    key = '61cf04749fda864dd404009216cbe106'
    token = '2caecaa0245326fcc4b949a4780ad7fdcb8cd8d77b4394ad8590d244dbfa542f'
    payload = json.loads(self.request.body)

    phase_id = payload['phase']['projectManager']['listId']
    team_phase_id = payload['phase']['team']['listId']
    params = { 'idList': phase_id, 'name': payload['name'], 'desc': payload['desc'], 'key': key, 'token': token }
    team_params = { 'idList': team_phase_id, 'name': payload['name'], 'desc': payload['desc'], 'key': key, 'token': token }

    requests_toolbelt.adapters.appengine.monkeypatch()
    response = self.create_trello_card(params)
    payload['projectManagementTrelloId'] = json.loads(response.text)['id']
    if team_phase_id is not None:
      response = self.create_trello_card(team_params)
      print response
      payload['teamTrelloId'] = json.loads(response.text)['id']

    payload['dateLastActivity'] = datetime.datetime.utcnow().isoformat()
    mongodb.create(payload, 'tasks')

    self.send_json(dumps(response.text))

class UpdateTaskHandler(RestHandler):
  def post(self):
    key = '61cf04749fda864dd404009216cbe106'
    token = '2caecaa0245326fcc4b949a4780ad7fdcb8cd8d77b4394ad8590d244dbfa542f'
    payload = json.loads(self.request.body)

    phase_id = payload['phase']['projectManager']['listId']
    team_phase_id = payload['phase']['team']['listId']
    params = { 'idList': phase_id, 'name': payload['name'], 'desc': payload['desc'], 'key': key, 'token': token }
    team_params = { 'idList': team_phase_id, 'name': payload['name'], 'desc': payload['desc'], 'key': key, 'token': token }

    requests_toolbelt.adapters.appengine.monkeypatch()
    response = self.update_trello_card(payload['projectManagementTrelloId'], params)
    if team_phase_id is not None:
      if payload.get('teamTrelloId') is None:
        response = self.create_trello_card(team_params)
        payload['teamTrelloId'] = json.loads(response.text)['id']
      else:
        response = self.update_trello_card(payload['teamTrelloId'], team_params)

    payload['dateLastActivity'] = datetime.datetime.utcnow().isoformat()
    mongodb.update(payload, payload['_id'], 'tasks')

    self.send_json(dumps(response.text))


APP = webapp2.WSGIApplication([
  ('/rest/tasks', TasksHandler),
  ('/rest/task/create', CreateTaskHandler),
  ('/rest/task/update', UpdateTaskHandler)
], debug=True)
