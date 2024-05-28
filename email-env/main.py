import sys
import email
import json
import argparse
import os
import glob
import copy

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

parser.add_argument("--limit", default=100, type=int)
parser.add_argument("--logging", type=LoggingMode.from_string, choices=list(LoggingMode), default=LoggingMode.NORMAL)
parser.add_argument("--rounds", default=1, type=int)
parser.add_argument("--num-documents", default=10, type=int)

parser.add_argument("--randomize-order", default=False, type=bool)
parser.add_argument("--randomize-senders", default=False, type=bool)

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
env.num_documents = args.num_documents

if not os.path.exists(args.input.name):
    warn(f'Environment with path "{args.input.name}" does not exist!')    
    envs = glob.glob("./envs/*.json")
    system_message("Available environment files:", envs)
    sys.exit()

jsonobj = json.load(args.input)

round_results = []
for round in range(args.rounds):
    system_message(f"Simulating round #{round + 1}...", end=(" " * 10 + "\r"))
    env = environment.EmailEnvironment(
        mailserver = getclass(mailserver, args.mailserver),
        ragserver = getclass(ragserver, args.ragserver),
        model = getclass(models, args.model),
    )

    env.load(
        copy.deepcopy(jsonobj), 
        randomize_order=args.randomize_order,
        randomize_senders=args.randomize_senders,
    )
    env.simulate(limit=len(env.message_queue) + args.limit)
    
    all_messages = env.save()
    round_result = dict(
        round = round,
        emails = all_messages,
    )
    round_results.append(round_result)
    system_message(f"Completed simulation of round #{round + 1}", end="\r" if round < args.rounds - 1 else "\n")

jsonobj = dict(name = env.name)
if args.rounds > 1:
    jsonobj["rounds"] = round_results
else:
    jsonobj["emails"] = round_results[0]["emails"]

arg_dict = vars(args).copy()
arg_dict.pop("input")
arg_dict.pop("output")
arg_dict.pop("logging")
jsonobj["arguments"] = arg_dict
jsonobj["command"] = [sys.executable] + sys.argv

json.dump(jsonobj, args.output, indent=4)
if (args.output != sys.stdout): system_message(f'Wrote table to "{args.output.name}"')
args.output.write("\n")

