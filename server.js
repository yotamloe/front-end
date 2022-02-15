var express      = require("express")
  , morgan       = require("morgan")
  , bodyParser   = require("body-parser")
  , session      = require("express-session")
  , helpers      = require("./helpers")
  , cart         = require("./api/cart")
  , catalogue    = require("./api/catalogue")
  , orders       = require("./api/orders")
  , user         = require("./api/user")
  , metrics      = require("./api/metrics")
  , app          = express()
const cookieParser = require("cookie-parser");

function makeTraceId(length) {
    let result = '';
    const characters = 'abcde0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}


app.use(helpers.rewriteSlash);
app.use(metrics);
app.use(express.static("public"));

console.log('Using local session manager');

const secret = makeTraceId(32)
// session data will expire after 30 minutes
app.use(session({
        name: 'md.sid',
    saveUninitialized: true,
    resave: true,
    secret: secret,
    cookie: { maxAge: 1800000, sameSite: true },
}
))
app.get('/*',function(req,res,next){
    req.session.traceparent = (req.session.traceparent || '00-' + makeTraceId(32) + '-d21f7bc17caa5aba-01')
    res.cookie('traceparent', req.session.traceparent)
    res.cookie('sid',req.sessionID)
    res.cookie('SameSite','Strict')
    next(); // http://expressjs.com/guide.html#passing-route control
});


app.use(bodyParser.json());
app.use(cookieParser(secret));
app.use(helpers.sessionMiddleware);
app.use(morgan("dev", {}));

var domain = "";
process.argv.forEach(function (val, index, array) {
  var arg = val.split("=");
  if (arg.length > 1) {
    if (arg[0] == "--domain") {
      domain = arg[1];
      console.log("Setting domain to:", domain);
    }
  }
});

/* Mount API endpoints */
app.use(cart);
app.use(catalogue);
app.use(orders);
app.use(user);

app.use(helpers.errorHandler);

var server = app.listen(process.env.PORT || 8079, function () {
  var port = server.address().port;
  console.log("App now running in %s mode on port %d", app.get("env"), port);
});
