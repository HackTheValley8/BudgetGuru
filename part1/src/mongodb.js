const mongoose = require("mongoose")

// Replace <password> with your actual MongoDB Atlas password
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

//insert data into mongodb


const logInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  tables: [
    {
      content: String,
      price: Number,
      importance: Number
    }
  ]
});

const LogInCollection = new mongoose.model('LogInCollection', logInSchema);


module.exports = LogInCollection;

//pass: LoLg4wQfe2ylcvme  user:aloisekua
