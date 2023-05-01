module.exports = function(app, passport, db) {

// normal routes ===============================================================

const workOut = {
  'back': {
      'description': 'Work your back muscles with exercises like Deadlifts, Pull-UPs, Seated Rows, and Lat-Pulldowns.',
      'title': 'You have selected a workout for your BACK',
      'url': 'https://www.youtube.com/watch?v=4AObAU-EcYE'
  },
  'arms':{
      'description': 'Strengthen your arm muscles with exercises like Push-ups, Hammer Curls, and Bicep Curls.',
      'title': 'You have selected a workout for your ARMS',
      'url': 'https://www.youtube.com/watch?v=Ks-lVDMtN3c'
  },
  'legs':{
      'description': 'Build strong legs with exercises like Squats, Lunges, Deadlifts, and Leg Presses.',
      'title': 'You have selected a workout for your LEGS',
      'url': 'https://www.youtube.com/watch?v=Xr6rG9cr-rI'
  },
  'shoulders': {
      'description': 'Develop strong shoulders with exercises like Military Presses, Arnold Presses, Lateral Raises, and Reverse Flies.',
      'title': 'You have selected a workout for your SHOULDERS',
      'url': 'https://www.youtube.com/watch?v=KFeFpBxj4wE'
  },
  'lower':{
      'description': 'Tone your lower body with exercises like Squats, Lunges, Deadlifts, Leg Presses, and Calf Raises.',
      'title': 'You have selected a workout for your LOWER BODY',
      'url': 'https://www.youtube.com/watch?v=Y1IGeJEXpF4'
  },
  'upper':{
      'description': 'Strengthen your upper body with exercises like Push-ups, Bench Presses, Pull-ups, Rows, and Shoulder Presses.',
      'title': 'You have selected a workout for your UPPER BODY',
      'url': 'https://www.youtube.com/watch?v=vc1E5CfRfos'
  },
  'unknown':{
      'description': 'Please enter a diffrent part of the body'
  }
  
};

app.get('/api/:name',(request,response)=>{
  const bodyPart = request.params.name.toLowerCase()

  if( workOut[bodyPart] ){
      response.json(workOut[bodyPart])
  }else{
      response.json(workOut['unknown'])
  }
  
})



    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');

    })
    app.get('/home', function(req, res) {
      res.render('home.ejs');

  });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('messages').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            messages: result
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/messages', (req, res) => {
      db.collection('messages').save({workOutName: req.body.workOutName, bodyPart: req.body.bodyPart, weight: req.body.weight, reps: req.body.reps, sets: req.body.sets }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({workOutName: req.body.workOut, bodyPart: req.body.bodyPart}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/home', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/home', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
