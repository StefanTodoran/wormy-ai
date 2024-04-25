
class SimpleMailServer:
    def __init__(self):
        self.sent = {}
        self.recieved = {}

    def send(self, message):
        self.sent.setdefault(message['From'], []).append(message)
        self.recieved.setdefault(message['To'], []).append(message)

    def inbox(self, user):
        return self.recieved[user]

    def related(self, user, message):
        return self.inbox(user)

