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
parser.add_argument("input", type=str)
parser.add_argument("output", type=str)

parser.add_argument("--mailserver", default="SimpleMailServer")
parser.add_argument("--ragserver", default="FakeRagServer")
parser.add_argument("--model", default="RandomModel")

parser.add_argument("--limit", default=100, type=int, help="The maximum number of emails to generate.")
parser.add_argument("--logging", type=LoggingMode.from_string, choices=list(LoggingMode), default=LoggingMode.NORMAL)
parser.add_argument("--rounds", default=1, type=int, help="The number of times to run the simulation.")
parser.add_argument("--num-documents", default=10, type=int, help="The maximum number of context emails to fetch from the RAG server.")

parser.add_argument("--resume", action=argparse.BooleanOptionalAction, help="Whether to start the simulation anew or keep going from the last saved round.")
parser.add_argument("--randomize-order", action=argparse.BooleanOptionalAction, help="Whether to randomize the order of emails in the starting environment.")
parser.add_argument("--randomize-senders", action=argparse.BooleanOptionalAction, help="Whether to shuffle the names of the senders (does not affect graph structure).")

args = parser.parse_args()

def getclass(module, name):
    obj = getattr(module, name)
    if type(obj) == type or type(obj) == type(lambda: None):
        obj = obj()
    return obj

set_logging_mode(args.logging)

if not os.path.exists(args.input):
    warn(f'Environment with path "{args.input}" does not exist!')    
    envs = glob.glob("./envs/*.json")
    system_message("Available environment files:", envs)
    sys.exit()
with open(args.input, "r") as input_file: 
    jsonobj = json.load(input_file)

if args.resume and not os.path.exists(args.output):
    warn(f'Simulation output with path "{args.output}" does not exist, cannot resume!')    
    envs = glob.glob("./out/*.json")
    system_message("Available simulation files to resume:", envs)
    sys.exit()

def save_results(results):
    jsonobj = dict(name = env.name)
    if args.rounds > 1: jsonobj["rounds"] = results
    else: jsonobj["emails"] = results[0]["emails"]

    arg_dict = vars(args).copy()
    arg_dict.pop("input")
    arg_dict.pop("output")
    arg_dict.pop("logging")
    jsonobj["arguments"] = arg_dict
    jsonobj["command"] = [sys.executable] + sys.argv

    with open(args.output, "w") as out_file:
        json.dump(jsonobj, out_file, indent=4)
        out_file.write("\n")
        system_message(f'Wrote results to "{args.output}"')

round_results = []
if args.resume:
    with open(args.output, "r") as results_file:
        prev_results = json.load(results_file)
        round_results = prev_results["rounds"]
    system_message(f"Resumed simulation from round #{len(round_results)}")

starting_round = len(round_results)

for curr_round in range(starting_round, args.rounds):
    system_message(f"Simulating round #{curr_round + 1}...", end=(" " * 10 + "\r"))
    env = environment.EmailEnvironment(
        mailserver = getclass(mailserver, args.mailserver),
        ragserver = getclass(ragserver, args.ragserver),
        model = getclass(models, args.model),
        num_documents = args.num_documents,
    )

    env.load(
        copy.deepcopy(jsonobj), 
        randomize_order=args.randomize_order,
        randomize_senders=args.randomize_senders,
    )
    env.simulate(limit=len(env.message_queue) + args.limit)
    
    all_messages = env.save()
    round_result = dict(
        round = curr_round,
        emails = all_messages,
    )
    round_results.append(round_result)
    system_message(f"Completed simulation of round #{curr_round + 1}")
    save_results(round_results)