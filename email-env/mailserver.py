
class SimpleMailServer:
    def __init__(self):
        self.sent = {}
        self.recieved = {}

    def send(self, message):
        self.sent.setdefault(message['From'], []).append(message)
        self.recieved.setdefault(message['To'], []).append(message)
        message_id = (message['To'], len(self.recieved[message['To']]) - 1)
        return message_id

    def inbox(self, user):
        return self.recieved.get(user, [])

    def getmessage(self, message_id):
        return self.recieved[message_id[0]][message_id[1]]
