from gensim.models import fasttext
from gensim.test.utils import datapath

# https://stackoverflow.com/questions/62059196/gensim-fasttext-why-load-facebook-vectors-doesnt-work
fasttext_model = fasttext.load_facebook_vectors("cc.en.300.bin")


# https://www.cs.toronto.edu/~lczhang/aps360_20191/lec/w06/sentiment.html

import csv
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import torchtext
import numpy as np
import matplotlib.pyplot as plt
import math

def sigmoid(x):
    return 1/(1+math.e**x)

def split_text(tweet):
    # separate punctuations
    tweet = tweet.replace(".", " . ") \
                 .replace(",", " , ") \
                 .replace(";", " ; ") \
                 .replace("?", " ? ")
    return tweet.lower().split()


words = []
value = []
with open("data/luxury.txt", 'r') as file:
    for line in file.readlines():
        words.append(line.strip().lower())
        value.append(0)
with open("data/needs.txt", 'r') as file:
    for line in file.readlines():
        words.append(line.strip().lower())
        value.append(1)
# with open("data/pointfive.txt", 'r') as file:
#     for line in file.readlines():
#         words.append(line.strip().lower())
#         value.append(0.5)


def get_text_vectors(model):
    train, valid, test = [], [], []
    for i, (text, val) in enumerate(zip(words, value)):
        vector_sum = model[text]
        label = val
        if i % 5 < 3:
            train.append((vector_sum, label))
        elif i % 5 == 4:
            valid.append((vector_sum, label))
        else:
            test.append((vector_sum, label))
            
    return train, valid, test


train, valid, test = get_text_vectors(fasttext_model)

train_loader = torch.utils.data.DataLoader(train, batch_size=128, shuffle=True)
valid_loader = torch.utils.data.DataLoader(valid, batch_size=128, shuffle=True)
test_loader = torch.utils.data.DataLoader(test, batch_size=128, shuffle=True)



def train_network(model, train_loader, valid_loader, num_epochs=50, learning_rate=1e-5):
    criterion = nn.CrossEntropyLoss()
    # criterion = nn.L1Loss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    losses, train_acc, valid_acc = [], [], []
    epochs = []
    for epoch in range(num_epochs):
        for tweets, labels in train_loader:
            optimizer.zero_grad()
            pred = model(tweets)
            loss = criterion(pred, labels)
            loss.backward()
            optimizer.step()
        losses.append(float(loss))     
        if epoch % 5 == 4:
            epochs.append(epoch)
            train_acc.append(get_accuracy(model, train_loader))
            valid_acc.append(get_accuracy(model, valid_loader))
            print("Epoch %d; Loss %f; Train Acc %f; Val Acc %f" % (
                epoch+1, loss, train_acc[-1], valid_acc[-1]))
            

def get_accuracy(model, data_loader):
    correct, total = 0, 0
    for tweets, labels in data_loader:
        output = model(tweets)
        pred = output.max(1, keepdim=True)[1]
        correct += pred.eq(labels.view_as(pred)).sum().item()
        total += labels.shape[0]
    return correct / total

mymodel = nn.Sequential(nn.Linear(300, 64),
                        nn.ReLU(),
                        nn.Dropout(0.55),
                        nn.Linear(64, 20),
                        nn.ReLU(),
                        nn.Dropout(0.55),
                        nn.Linear(20, 2))
train_network(mymodel, train_loader, valid_loader, num_epochs=500, learning_rate=1e-4)


mymodel.eval()

print(get_accuracy(mymodel, test_loader))

def predict(text):
    rettensor = mymodel(torch.from_numpy(fasttext_model[text]))
    return float((rettensor[1]-rettensor[0])/2)  # 0-ness and 1-ness??? how was this encoded in the first place?

tests = [
    "mcdonalds",
    "food and drink",
    "food",
    "and",
    "drink",
    "shelter",
    "rent",
    "bathroom",
    "home",
    "running water",
    "education",
    "chairs",
    "fancy restaurant",
    "bubble tea",
    "toy",
    "ninja sword",
    "many servants",
    "helpful robots",
    "gifts to friends",
    "hobbies",
    "lake"
    ]

with torch.no_grad():
    for i in tests:
        print(i, sigmoid(-predict(i)/2))
        
def getans(text):
    return max(min(round(sigmoid(-predict(text)/2)*10), 10), 0)


from flask import Flask, json
app = Flask(__name__)

@app.route("/importance/<text>", methods=["GET"])
def get_importance(text):
    return {"text": text, "importance": getans(text)}

if __name__ == "__main__":
    app.run(port=5000)