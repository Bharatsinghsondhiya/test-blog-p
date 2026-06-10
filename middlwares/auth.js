// middlwares/auth.js
const { validateToken } = require("../services/auth");

function checkforAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokencookievalue = (req.cookies && req.cookies[cookieName]) || null;
    console.log("[auth middleware] cookie value:", tokencookievalue ? "PRESENT" : "MISSING");

    if (!tokencookievalue) {
      req.user = null;
      return next();
    }

    try {
      const userpayload = validateToken(tokencookievalue);
      console.log("[auth middleware] token valid. payload:", userpayload);
      req.user = userpayload;
      return next();
    } catch (error) {
      console.error("[auth middleware] token validation failed:", error.message);
      req.user = null;
      return next();
    }
  };
}

module.exports = {
  checkforAuthenticationCookie,
};
