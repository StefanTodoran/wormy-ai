import sys
import email
import json
import argparse

import environment
import mailserver
import ragserver
import models

parser = argparse.ArgumentParser()
parser.add_argument('input', nargs='?', default=sys.stdin, type=argparse.FileType('r'))
parser.add_argument('output', nargs='?', default=sys.stdout, type=argparse.FileType('w'))

parser.add_argument('--mailserver', default='SimpleMailServer')
parser.add_argument('--ragserver', default='FakeRagServer')
parser.add_argument('--model', default='RandomModel')

parser.add_argument('--limit', default=10, type=int)

args = parser.parse_args()

def getclass(module, name):
    obj = getattr(module, name)
    if type(obj) == type or type(obj) == type(lambda: None):
        obj = obj()
    return obj


env = environment.EmailEnvironment(
    mailserver = getclass(mailserver, args.mailserver),
    ragserver = getclass(ragserver, args.ragserver),
    model = getclass(models, args.model),
)

jsonobj = json.load(args.input)
env.load(jsonobj)

while len(env.message_queue) > 1:
    env.timestep(respond=False)
env.simulate(limit=args.limit)
#env.simulate(limit=args.limit)

jsonobj = env.save()
json.dump(jsonobj, args.output, indent=4)
args.output.write('\n')

