import email

import environment
import mailserver
import ragserver
import models

message_content = """
Hello there Bob!
I hope things are going well with you, I hear you had a great trip to the mountants this weekend. How was the snow?
I was wondering if you could send me a list of the steps for the backyard fence project, I seem to have forgotten where I put the list you send me before. We've got to get on it, it's been too long.
Thanks,
Joe
"""

jsonobj = {
    "emails": [
        {"sender": "user1@gmail.com", "recipient": "user2@gmail.com", "content": message_content}
    ]
}

env = environment.EmailEnvironment(
    mailserver = mailserver.SimpleMailServer(),
    ragserver = ragserver.FakeRagServer(),
    model = models.ActionModel(),
)

env.load(jsonobj)

#env.simulate(limit=10)
while len(env.message_queue):
    env.timestep()
    input()

result = env.save()
#result = {'emails': [{'recipient': 'user2@gmail.com', 'sender': 'user1@gmail.com', 'content': 'Hello there!\n'}, {'recipient': 'user1@gmail.com', 'sender': 'user2@gmail.com', 'content': ' Hello there! How are you doing today?\n'}, {'recipient': 'user2@gmail.com', 'sender': 'user1@gmail.com', 'content': ' Hello there! I am doing well, thank you for asking. How are you doing today?\n'}]}

for limit in range(1, len(result['emails']) + 1):
    print ('digraph timepoint_' + str(limit) + ' {')
    for message in result['emails'][:limit]:
        #print ('    "' + message['sender'] + '" -> "' + message['recipient'] + '"')
    #message = result['emails'][limit-1]
        print ('    "' + message['sender'] + '" -> "' + message['recipient'] + '"', '[ label=" ' + message['content'].strip() + '" ]')
    print ('}')
