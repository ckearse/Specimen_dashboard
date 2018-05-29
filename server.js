const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({saveUninitialized: true, secret: "topsecret", resave: true}));
app.use(flash());

mongoose.connect('mongodb://localhost/specimen_dashboard');

const SpecimenSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 1},
  age: {type: Number, required: true},
  notes: {type: String, required: false}
});

mongoose.model("Specimen", SpecimenSchema);

const Specimen = mongoose.model("Specimen");

app.get('/', (req, res)=>{
  Specimen.find({}, (err, specimens)=>{
    if(!err){
      console.log('DB successfully queried!');
    }
    else{
      console.log(err);
    }

    res.render('index', {'specimens': specimens});
  })
})

app.get('/pack/new', (req, res)=>{
  console.log("GET request to /pack/new");
  res.render('new');
})

app.get('/pack/:id', (req, res)=>{
  console.log('Request to /pack/:id=' + req.params.id);

  Specimen.findById(req.params.id, (err, specimen)=>{
    if(!err){
      console.log("Specimen name: " + specimen.name);

      res.render('details', {'specimen': specimen});
    }
    else{
      console.log(err);

      res.redirect('/');
    }
  });
})

app.post('/pack', (req, res)=>{
  console.log('POST request to /pack');

  let specimen = new Specimen({
    name: req.body.name,
    age: req.body.age,
    notes: req.body.notes
  })

  specimen.save(err=>{
    if(!err){
      console.log('Specimen successfully added to DB!');

      res.redirect('/');
    }
    else{
      console.log('Error encountered while adding DB entry!');

      for(var error in err.errors){
        req.flash("form_errors", err.errors[error].message);
      }

      res.render('new');
    }
  })
})

app.get('/pack/edit/:id', (req, res)=>{
  console.log('Request to /pack/edit/:id')

  Specimen.findById(req.params.id, (err, specimen)=>{
    if(!err){
      res.render('edit', {'specimen': specimen});
    }
    else{
      res.redirect('/');
    }
  });

})

app.post('/pack/:id', (req, res)=>{
  console.log('POST request to /pack/:id')

  Specimen.update({_id: req.params.id},
    {$set: {
      name: req.body.name,
      age: req.body.age,
      notes: req.body.notes
    },
  },
  {
    runValidators: true
  },
  (err, status)=>{

    if(!err){
      console.log("DB update successful!");
      res.redirect('/');
    }
    else{
      console.log('Error encountered!');

      for(var error in err.errors){
        req.flash("form_errors", err.errors[error].message);
      }
      console.log('/pack/${req.params.id}');
      res.redirect('/pack/edit/' + req.params.id);
    }

  });

})

app.post('/pack/destroy/:id', (req, res)=>{
  console.log('Request to /pack/destroy/:id')

  Specimen.findByIdAndRemove(req.params.id, (err, status)=>{
    if(!err){
      console.log("Deletion successful!");

      res.redirect('/');
    }
    else{
      console.log(err);

      res.redirect('/');
    }
  });

})

app.listen(7777, function(){
  console.log("Express app listening on port 7777");
})