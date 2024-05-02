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
        message_id = self.mailserver.send(message)
        self.ragserver.add_message(message, message_id)
        self.history.append(message_id)

    def respond(self, message):
        similar_ids = self.ragserver.search(message['To'], message)
        similar_messages = [self.mailserver.getmessage(i) for i in similar_ids]
        return self.model.respond(message, similar_messages)

    def timestep(self, respond=True):
        print ('respond', respond)
        if len(self.message_queue) == 0: return False

        message = self.message_queue.pop(0)
        response = None
        if respond:
            response = self.respond(message)
        self.send(message)
        if response is not None:
            self.message_queue.append(response)

        return len(self.message_queue)

    def simulate(self, limit=None):
        i = 1
        while (limit is None or i < limit) and len(self.message_queue):
            self.timestep()
            i += 1
        self.timestep(respond=False)

    def load(self, jsonobj):    
        for msgobj in jsonobj['emails']:
            message = email.message.EmailMessage()
            message['To'] = msgobj['recipient']
            message['From'] = msgobj['sender']
            message.set_content(msgobj['content'])
            self.message_queue.append(message)

    def save(self):
        all_messages = []
        for message_id in self.history:
            message = self.mailserver.getmessage(message_id)
            all_messages.append(dict(
                recipient = message['To'],
                sender = message['From'],
                content = message.get_content(),
            ))

        jsonobj = dict(
            emails = all_messages,
        )
        return jsonobj

