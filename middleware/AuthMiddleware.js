const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
    const accessToken = req.header("accessToken");

    if (!accessToken) return res.json({ error: "User not logged in" });

    try {
        const validatedToken = verify(accessToken, "chweNXZ1234");
        req.user = validatedToken;

        if (validatedToken) {
            return next();
        }
    } catch (err) {
        return res.json({ error: err.message }); // Returning error message
    }
};

const verifyTokenAndAdmin = (req, res, next) => {
    validateToken(req, res, () => {
      if (req.user.isAdmin) {
        next();
      } else {
        res.status(403).json("You are not alowed to do that!");
      }
    });
  };
  

module.exports = { validateToken, verifyTokenAndAdmin };
