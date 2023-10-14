from gensim.models import fasttext
fasttext_model = fasttext.load_facebook_vectors("cc.en.300.bin")
import math
import torch
import torch.nn as nn

mymodel = nn.Sequential(nn.Linear(300, 64),
                        nn.ReLU(),
                        nn.Dropout(0.55),
                        nn.Linear(64, 20),
                        nn.ReLU(),
                        nn.Dropout(0.55),
                        nn.Linear(20, 2))
mymodel.load_state_dict(torch.load("importance_model.pkl"))

def sigmoid(x):
    return 1/(1+math.e**x)

def getans(text):
    return max(min(round(sigmoid(-predict(text)/2)*10), 10), 0)

mymodel.eval()

def predict(text):
    rettensor = mymodel(torch.from_numpy(fasttext_model[text]))
    return float((rettensor[1]-rettensor[0])/2)  # 0-ness and 1-ness??? how was this encoded in the first place?


from flask import Flask, json
app = Flask(__name__)

@app.route("/importance/<text>", methods=["GET"])
def get_importance(text):
    return {"text": text, "importance": getans(text)}

if __name__ == "__main__":
    app.run(port=5000)