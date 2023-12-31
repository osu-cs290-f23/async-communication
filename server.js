var fs = require("fs")
var express = require('express')
var exphbs = require('express-handlebars')

var peopleData = require('./peopleData.json')

var app = express()
var port = process.env.PORT || 8000

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(express.json())
app.use(express.static('static'))

app.get('/', function (req, res, next) {
  res.status(200).render('homePage')
})

app.get('/people', function (req, res, next) {
  res.status(200).render('peoplePage', {
    people: peopleData
  })
})

app.get('/people/:person', function (req, res, next) {
  var person = req.params.person.toLowerCase()
  if (peopleData[person]) {
    res.status(200).render('photoPage', peopleData[person])
  } else {
    next()
  }
})

app.post('/people/:person/addPhoto', function (req, res, next) {
  console.log("  -- req.body:", req.body)
  var person = req.params.person.toLowerCase()
  if (peopleData[person]) {
    if (req.body && req.body.url && req.body.caption) {
      peopleData[person].photos.push({
        caption: req.body.caption,
        url: req.body.url
      })

      fs.writeFile(
        "./peopleData.json",
        JSON.stringify(peopleData, null, 2),
        function (err) {
          if (err) {
            res.status(500).send("Error writing photo to DB")
          } else {
            res.status(200).send("Photo successfully added to DB")
          }
        }
      )
    } else {
      res.status(400).send(
        "Requests need a JSON body with 'url' and 'caption'"
      )
    }
  } else {
    next()
  }
})

app.get('*', function (req, res, next) {
  res.status(404).render('404', {
    page: req.url
  })
})

app.listen(port, function () {
  console.log("== Server listening on port", port)
})
