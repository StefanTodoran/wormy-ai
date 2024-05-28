## Setup

```
cd email-env
pip install -r requirements.txt
```

## Experiments

`Long line`
```
python .\main.py .\envs\long_line_with_fixed_worm.json .\out\long_line_with_fixed_worm.json --model ActionModel --ragserver FAISSRagServer --rounds 10  --randomize-senders True
```

`Reply rate by email type`
```
python .\main.py .\envs\reply_rate_by_email_type.json .\out\reply_rate_by_email_type.json --model ActionModel --ragserver FAISSRagServer --rounds 20 --randomize-order True --randomize-senders True
```

`Reply rate by domain`
```
python .\main.py .\envs\reply_rate_by_domain.json .\out\reply_rate_by_domain.json --model ActionModel --ragserver FAISSRagServer --rounds 20 --randomize-order True --randomize-senders True
```