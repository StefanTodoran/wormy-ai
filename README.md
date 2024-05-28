```
cd email-env
pip install -r requirements.txt
```

```
python .\main.py .\envs\line.json .\out\line.json --model ActionModel --ragserver FAISSRagServer
python .\main.py .\envs\reply_rate_by_email_type.json .\out\reply_rate_by_email.json --model ActionModel --ragserver FAISSRagServer --rounds 10 --randomize-senders
```