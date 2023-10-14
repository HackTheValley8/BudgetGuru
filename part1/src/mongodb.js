const mongoose = require("mongoose")
//mongodb URI access.
const mongoURI = "mongodb+srv://aloisekua:LoLg4wQfe2ylcvme@clusterone.ckwkfg2.mongodb.net/";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((e) => {
  console.error('Failed to connect to MongoDB Atlas', e);
});

const logInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const LogInCollection = new mongoose.model('LogInCollection', logInSchema);

module.exports = LogInCollection;
