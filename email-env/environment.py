import email.message

class EmailEnvironment:
    def __init__(self, mailserver, ragserver, model, message_queue=None):
        self.mailserver = mailserver
        self.ragserver = ragserver
        self.model = model
        self.message_queue = message_queue or []
        self.history = []

    def send(self, message):
        message_id = len(self.history)
        self.mailserver.send(message)
        self.ragserver.add_message(message, message_id)
        self.history.append(message)

    def respond(self, message):
        similar_ids = self.ragserver.search(message['To'], message)
        similar_messages = [self.history[i] for i in similar_ids]
        return self.model.respond(message, similar_messages)

    def timestep(self):
        if len(self.message_queue) == 0: return False

        message = self.message_queue.pop(0)
        self.send(message)
        response = self.respond(message)
        if response is not None:
            self.message_queue.append(response)

    def simulate(self, limit=None):
        i = 0
        while (limit is None or i < limit) and len(self.message_queue):
            self.timestep()

    def load(self, jsonobj):    
        for msgobj in jsonobj['emails']:
            message = email.message.EmailMessage()
            message['To'] = jsonobj['recipient']
            message['From'] = jsonobj['sender']
            message.set_content(jsonobj['content'])
            self.message_queue.append(message)

