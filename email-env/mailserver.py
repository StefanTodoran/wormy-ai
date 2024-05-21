
class SimpleMailServer:
    def __init__(self):
        self.sent = {}
        self.recieved = {}

    def send(self, message):
        self.sent.setdefault(message.sender, []).append(message)
        self.recieved.setdefault(message.recipient, []).append(message)
        message_id = (message.recipient, len(self.recieved[message.recipient]) - 1)
        message.id = message_id
        return message_id

    def inbox(self, user):
        return self.recieved.get(user, [])

    def getmessage(self, message_id):
        result = self.recieved[message_id[0]][message_id[1]]
        return result
