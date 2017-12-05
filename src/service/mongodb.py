# Copyright 2015 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from bson.objectid import ObjectId
from flask.ext.pymongo import MongoClient


builtin_list = list
mongo = None


def _id(id):
  if not isinstance(id, ObjectId):
    return ObjectId(id)
  return id


# [START from_mongo]
def from_mongo(data):
  """
  Translates the MongoDB dictionary format into the format that's expected
  by the application.
  """
  if not data:
    return None

  data['id'] = str(data['_id'])
  return data
# [END from_mongo]


def init_app():
  client = MongoClient("mongodb://admin:admin@ds127536.mlab.com:27536/micro-manager-db")
  return client['micro-manager-db']


# [START list]
def list():
  mongo = init_app()
  results = mongo.tasks.find().sort('name')
  tasks = builtin_list(map(from_mongo, results))

  return tasks
# [END list]


# [START read]
def read(id):
  result = mongo.db.tasks.find_one(_id(id))
  return from_mongo(result)
# [END read]


# [START create]
def create(data):
  new_id = mongo.db.tasks.insert(data)
  return read(new_id)
# [END create]


# [START update]
def update(data, id):
  mongo.db.tasks.update({'_id': _id(id)}, data)
  return read(id)
# [END update]


def delete(id):
  mongo.db.tasks.remove(_id(id))
