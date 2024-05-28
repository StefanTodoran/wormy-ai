## Overview

This repository contains the code to reproduce a recent paper studying flow steering AI worms that can infect LLM-powered AI agents and propagate between users. The paper can be found [on arxiv](https://arxiv.org/abs/2403.02817), and has its own published code found [on github](https://github.com/StavC/ComPromptMized). Our code seeks to create a simple and reproducible pipeline for running simulations which can measure various metrics about LLM worms, 

## Setup

```
cd graph-maker
npm i
```

```
cd email-env
pip install -r requirements.txt
```

To use Gemini models, get an API key from [this link](https://ai.google.dev/). Then, paste the contents in a file called `api_key.txt`. This path is already included in the `.gitignore` file.

## Usage

The `/graph-maker/` directory contains the code for a webapp that allows for creation and visualization of test environments and their outputs. Email environment starting point files are stored in `/email-env/envs/` in JSON format, and can be loaded an manipulated using the webapp. To run the webapp once you've install all dependencies, run `npm run preview`, or visit the most recent version at served on [github pages](https://todoran.dev/wormy-ai/).

In the `/email-env/` directory we have a number of Python files that power the email environment simulation, which is controlled by `main.py`. Usage information is shown below:

```
usage: main.py [-h] [--mailserver MAILSERVER] [--ragserver RAGSERVER] [--model MODEL] [--limit LIMIT] [--logging {DEBUG,VERBOSE,NORMAL,MINIMAL,QUIET}] [--rounds ROUNDS] [--num-documents NUM_DOCUMENTS] [--randomize-order RANDOMIZE_ORDER] [--randomize-senders RANDOMIZE_SENDERS] [input] [output]
```

The simulation code has been designed to be modular, and can be easily retrofitted to use a different mailserver, ragserver, or model than those which we have provided.

## Format

TODO: how are envs formatted, how are out files formatted

## Experiments

For ease of use, a number of commands to run various experiments are listed below. The email environment output JSON also contains metadata about the commands used, which can help if you've run an experiment but forgot the parameters used.

### `Long line`
```
python .\main.py .\envs\long_line_with_fixed_worm.json .\out\long_line_with_fixed_worm.json --model ActionModel --ragserver FAISSRagServer --rounds 10  --randomize-senders True
```

### `Reply rate by email type`
```
python .\main.py .\envs\reply_rate_by_email_type.json .\out\reply_rate_by_email_type.json --model ActionModel --ragserver FAISSRagServer --rounds 20 --randomize-order True --randomize-senders True
```

### `Reply rate by domain`
```
python .\main.py .\envs\reply_rate_by_domain.json .\out\reply_rate_by_domain.json --model ActionModel --ragserver FAISSRagServer --rounds 20 --randomize-order True --randomize-senders True
```