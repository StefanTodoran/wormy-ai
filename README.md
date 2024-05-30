## Overview

This repository contains the code to reproduce a recent paper studying flow steering AI worms that can infect LLM-powered AI agents and propagate between users. The paper can be found [on arxiv](https://arxiv.org/abs/2403.02817), and has its own published code found [on github](https://github.com/StavC/ComPromptMized). Our code seeks to create a simple and reproducible pipeline for running simulations which can measure various metrics about LLM worms, 

## Setup

```shell
cd graph-maker
npm i
```

```shell
cd email-env
pip install -r requirements.txt
```

To use Gemini models, get an API key from [this link](https://ai.google.dev/). Then, paste the contents in a file called `api_key.txt`. This path is already included in the `.gitignore` file.

## Usage

The `/graph-maker/` directory contains the code for a webapp that allows for creation and visualization of test environments and their outputs. Email environment starting point files are stored in `/email-env/envs/` in JSON format, and can be loaded an manipulated using the webapp. To run the webapp once you've install all dependencies, run `npm run preview`, or visit the most recent version at served on [github pages](https://todoran.dev/wormy-ai/).

In the `/email-env/` directory we have a number of Python files that power the email environment simulation, which is controlled by `main.py`. Usage information is shown below:

```powershell
usage: main.py [-h] [--mailserver MAILSERVER] [--ragserver RAGSERVER] [--model MODEL] [--limit LIMIT] [--logging {DEBUG,VERBOSE,NORMAL,MINIMAL,QUIET}] [--rounds ROUNDS] [--num-documents NUM_DOCUMENTS] [--rounds RESUME] [--randomize-order RANDOMIZE_ORDER] [--randomize-senders RANDOMIZE_SENDERS] [input] [output]
```

The `mailserver`, `ragserver` and `model` arguments all refer to classes in the project, see `mailserver.py`, `ragserver.py` and `models.py` respectively. 

The `limit` parameter is the maximum number of generated emails that can be sent, used to avoid infinite loops (although in practice this rarely happens). The `rounds` parameter repeats the experiment for the given number of rounds (with randomization), and the output will contain the results of every simulated round. The `num-documents` parameter is the maximum number of documents retrived from the RAG server. 

Lastly, `randomize-order` will have the starting point emails be sent in a random order (BEWARE! This can and will break your graph structure if it depends on order!) and `randomize-senders` shuffles around the names of each node but preserves graph structure. All this information is also provided in the command usage, and can be found by running `python main.py -h`.

The simulation code has been designed to be modular, and can be easily retrofitted to use a different mailserver, ragserver, or model than those which we have provided.

## Format

Environment files used as starting points for simulations and their associated output files are specified by the interfaces below. The webapp will automatically generate compliant JSON code, so there is really no reason to ever write any of these files manually.

```typescript
// A specific email event for an environment starting point.
interface EmailEntry {
    name: string,
    sender: string,
    recipient: string,
    subject: string,
    content: string,
    infected: boolean,
    type: string,
    worm_variant?: string,
    order: number,
}

// An environment starting point representing a number of emails
// that will be sent by the simulated users, in order.
interface EnvironmentFile {
    name: string,
    emails: EmailEntry[],
}

// A specific email event which occured during a simulation.
// May correspond to an EmailEntry, or to an LLM generated email.
interface EmailEvent {
    name: string,
    sender: string,
    recipient: string,
    subject: string,
    content: string,
    infected: boolean,
    type: string,
    worm_variant?: string,
    order: number,
}

inteface SimulationRound {
    round: number,
    emails: EmailEvent[],
}

// The result of running the email environment simulation from 
// some EnvironmentFile starting point. Also contains metadata.
interface SimulationFile {
    name: string,
    rounds: SimulationRound[],
    arguments: {
        mailserver: string,
        ragserver: string,
        model: string,
        limit: number,
        rounds: number,
        num_documents: number,
        randomize_order: boolean,
        randomize_senders: boolean,
    },
    command: string[],
}
```


## Experiments

For ease of use, a number of commands to run various experiments are listed below. The email environment output JSON also contains metadata about the commands used, which can help if you've run an experiment but forgot the parameters used.

### `Long line`
```powershell
python .\main.py .\envs\long_line_with_original_worm.json .\out\long_line_with_original_worm.json --model ActionModel --ragserver FAISSRagServer --rounds 10  --randomize-senders
```
```powershell
python .\main.py .\envs\long_line_with_fixed_worm.json .\out\long_line_with_fixed_worm.json --model ActionModel --ragserver FAISSRagServer --rounds 10  --randomize-senders
```
```powershell
python .\main.py .\envs\long_line_with_single_worm.json .\out\long_line_with_single_worm.json --model ActionModel --ragserver FAISSRagServer --rounds 10  --randomize-senders
```
```powershell
python .\main.py .\envs\long_line_with_friendly_worm.json .\out\long_line_with_friendly_worm.json --model ActionModel --ragserver FAISSRagServer --rounds 10  --randomize-senders
```
```powershell
python .\main.py .\envs\long_line_with_business_worm.json .\out\long_line_with_business_worm.json --model ActionModel --ragserver FAISSRagServer --rounds 10  --randomize-senders
```

### `Reply rate by email type`

```powershell
python .\main.py .\envs\reply_rate_by_email_type.json .\out\reply_rate_by_email_type.json --model ActionModel --ragserver FAISSRagServer --rounds 20 --randomize-order --randomize-senders
```

### `Reply rate by domain`
```powershell
python .\main.py .\envs\reply_rate_by_domain.json .\out\reply_rate_by_domain.json --model ActionModel --ragserver FAISSRagServer --rounds 20 --randomize-order --randomize-senders
```

### `Grid spread test`
```powershell
python .\main.py .\envs\original_worm_grid.json .\out\original_worm_grid.json --model ActionModel --ragserver FAISSRagServer --rounds 20 --randomize-senders
```