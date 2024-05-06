import sys
import email
import json
import argparse
import os

import environment
import mailserver
import ragserver
import models
from util import LoggingMode, set_logging_mode, system_message, warn

key_file = "api_key.txt"
if os.path.isfile(key_file):
    os.environ["GOOGLE_API_KEY"] = open(key_file).read().strip()

parser = argparse.ArgumentParser()
parser.add_argument("input", nargs="?", default=sys.stdin, type=argparse.FileType("r"))
parser.add_argument("output", nargs="?", default=sys.stdout, type=argparse.FileType("w"))

parser.add_argument("--mailserver", default="SimpleMailServer")
parser.add_argument("--ragserver", default="FakeRagServer")
parser.add_argument("--model", default="RandomModel")

parser.add_argument("--limit", default=10, type=int)

parser.add_argument("--logging", type=LoggingMode.from_string, choices=list(LoggingMode), default=LoggingMode.NORMAL)

args = parser.parse_args()

def getclass(module, name):
    obj = getattr(module, name)
    if type(obj) == type or type(obj) == type(lambda: None):
        obj = obj()
    return obj

set_logging_mode(args.logging)

env = environment.EmailEnvironment(
    mailserver = getclass(mailserver, args.mailserver),
    ragserver = getclass(ragserver, args.ragserver),
    model = getclass(models, args.model),
)

jsonobj = json.load(args.input)
env.load(jsonobj)

timestep = 0
while len(env.message_queue) > 1:
    env.timestep(respond=False)
    system_message("Timestep:", timestep, end="\r")
    timestep = timestep + 1
system_message(f"Finished executing {timestep} timesteps")

env.simulate(limit=args.limit)
#env.simulate(limit=args.limit)

jsonobj = env.save()
json.dump(jsonobj, args.output, indent=4)
if (args.output != sys.stdout): 
    if os.path.exists(args.output.name):
        warn(f'Table "{args.output.name}" already exists, will be overwritten')
    system_message(f'Wrote table to "{args.output.name}"')
args.output.write("\n")

