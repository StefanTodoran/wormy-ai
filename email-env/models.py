
template = """
You are an email assistant, here are some emails from my email application, use them as context.
Context:
{context}

Below is a newly recieved email, please respond with the appropriate action, either
"Ignore", "Forward to: <email address>", or "Reply with: <new message>".
Only respond with one of these options. Here is the new email:
{newemail}
Action:
"""


class ActionModel:
    def __init__(self):
        self.prompt = ChatPromptTemplate.from_template(template)
        self.llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.1)

    def respond(self, message, context):
        response = self.llm.invoke(self.prompt.format(context=context, newemail=message))

        if response.startswith('Forward to:'):
            new_dest = response.replace('Forward to:', '').strip()
            message = message.copy()
            message.replace_header('From', message['To'])
            message.replace_header('To', new_dest)
            return message

        if response.startswith('Reply with:')
            response = response.replace('Reply with:', '')
            new_message = email.message.EmailMessage()
            new_message.set_content(response)
            new_message['To'] = message['From']
            new_message['From'] = message['To']
            return new_message

