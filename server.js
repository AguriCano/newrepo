/* ******************************************
 * Primary server file
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
// const session = require("express-session"); // ⛔ TEMPORALMENTE DESACTIVADO
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const flash = require("connect-flash"); // ⛔ DESACTIVADO TEMPORALMENTE
require("dotenv").config();

/* ***********************
 * Local Modules
 *************************/
const staticRoutes = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const messageRoute = require("./routes/messageRoute");
const intentionalErrorRoute = require("./routes/intentionalErrorRoute");
const utilities = require("./utilities");
const pool = require("./database"); // DB sigue funcionando

/* ***********************
 * App Initialization
 *************************/
const app = express();

/* =====================================================
 * 🔒 SESSION DESACTIVADA TEMPORALMENTE
 * (NO express-session, NO secret, NO store)
 * ===================================================== */

/*
const pgSession = require("connect-pg-simple")(session);

app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    name: "sessionId",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
*/

/* ***********************
 * General Middleware
 *************************/

// Flash desactivado temporalmente (requiere sesiones)
// app.use(flash());
//
// app.use((req, res, next) => {
//   res.locals.messages = require("express-messages")(req, res);
//   next();
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* JWT Middleware (sigue funcionando sin sesiones) */
app.use(utilities.checkJWTToken);

/* ***********************
 * View Engine Setup
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes);

app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use("/message", messageRoute);
app.use("/ierror", intentionalErrorRoute);

/* ***********************
 * 404 Handler
 *************************/
app.use((req, res, next) => {
  next({
    status: 404,
    message: "Unfortunately, we don't have that page in stock.",
  });
});

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  console.error(`Error at "${req.originalUrl}": ${err.message}`);

  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Server Listener (RENDER SAFE)
 *************************/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ App running on port ${PORT}`);
});
