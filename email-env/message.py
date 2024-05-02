import email.message

class EmailMessage:
    def __init__(self, sender=None, recipient=None, content=None):
        self.sender = sender
        self.recipient = recipient
        self.content = content

    def as_string(self):
        parts = []
        if self.sender:
            parts.append('To: ' + self.sender)
        if self.recipient:
            parts.append('From: ')

