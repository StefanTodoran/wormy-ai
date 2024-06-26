import email.message
import copy

class EmailMessage:
    def __init__(self, id=None, sender=None, recipient=None, subject=None,
            content=None, name=None, type=None, attachments=None,
            generated=False, respond_to=True, infected=True, worm_variant="unspecified", original_message=None,
            context_messages=None):
        self.id = id
        self.sender = sender
        self.recipient = recipient
        self.subject = subject
        self.name = name
        self.type = type
        self.attachments = attachments or []
        self.content = content
        self.generated = generated
        self.respond_to = respond_to
        self.infected = infected
        self.worm_variant = worm_variant
        self.original_message = original_message
        self.context_messages = context_messages or []

    def as_string(self):
        parts = []
        if self.sender:
            parts.append("To: " + self.sender)
        if self.recipient:
            parts.append("From: " + self.recipient)
        if self.subject:
            parts.append("Subject: " + self.subject)
        parts.append(self.content)
        return "\n".join(parts)

    def as_prompt(self):
        prompt = self.as_string()
        if len(self.attachments):
            prompt += "\nAttachments:"
        return [prompt] + self.attachments

    def set_content(self, content):
        self.content = content

    def get_content(self):
        return self.content

    def copy(self, **kwargs):
        result = copy.deepcopy(self)
        result.id = None
        for name, value in kwargs.items():
            setattr(result, name, value)
        return result

    def new_message(self, **kwargs):
        kwargs.setdefault("sender", self.recipient)
        kwargs.setdefault("recipient", self.sender)
        kwargs.setdefault("subject", "Reply to: " + self.subject)
        return self.copy(**kwargs)

class ModelPrompt():
    def __init__(self, template):
        self.template = template

    def format(self, **args):
        prompt = self.template
        for key, value in args.items():
            prompt = prompt.replace("{" + key + "}", value)
        return prompt
        """
        prompt = self.template.copy()
        extra = {}
        for name, val in args.items():
            if type(val) == list:
                if '{' + name + '}' in prompt:
                    index = prompt.index('{' + name + '}')
                    prompt = prompt[:index] + val + prompt[index+1:]
            else:
                extra[name] = val

        if extra:
            for i in range(len(prompt)):
                prompt[i] = prompt[i].format(**extra)

        return prompt
        """
