import matplotlib.pyplot as plt
import json
import sys

import metrics

jsonobjs = [json.load(open(path)) for path in sys.argv[1:]]

for jsonobj in jsonobjs:
    metrics.calc_round(jsonobj)

def comparison_graph(jsonobjs):
    stat_names = 'retrieval replication recall_rate precision'.split()
    pretty_names = ['Retrieval rate', 'Replication rate', 'Recall rate', 'Precision']

    fig, axes = plt.subplots(nrows=len(stat_names), figsize=(6, 5*len(stat_names)))

    for i in range(len(stat_names)):
        num_docs = []
        values = []
        for jsonobj in jsonobjs:
            num_docs.append(jsonobj['arguments']['num_documents'])
            values.append(jsonobj['metrics'][stat_names[i]])
        axes[i].plot(num_docs, values)
        axes[i].set_xlabel('Number of emails retrieved')
        axes[i].set_ylabel(pretty_names[i])

    fig.savefig('plots/{}.png'.format(sys.argv[1].replace('/', '_').replace('.json', '')))

def time_graph(jsonobjs):
    stat_names = 'retrieval replication recall_rate precision'.split()
    pretty_names = ['Retrieval rate', 'Replication rate', 'Recall rate', 'Precision']
    stat_names = ['payload_correct']
    pretty_names = ['Number of emails in infected message']

    fig, axes = plt.subplots(nrows=len(stat_names), figsize=(6, 5*len(stat_names)), squeeze=False)

    for jsonobj in jsonobjs:
        metrics = [msg['metrics'] for msg in jsonobj['emails']]

        for i in range(len(stat_names)):
            num_docs = []
            values = []
            for stats in metrics:
                if stat_names[i] in stats:
                    values.append(stats[stat_names[i]])
            axes[i,0].plot(values, alpha=0.5)
            axes[i,0].set_xlabel('Timepoint in worm propagation')
            axes[i,0].set_ylabel(pretty_names[i])
            axes[i,0].set_title('Number of payload emails accumulated by the worm (8 trials)')

    fig.savefig('plots/{}.png'.format(sys.argv[1].replace('/', '_').replace('.json', '_time')))

time_graph(jsonobjs)
