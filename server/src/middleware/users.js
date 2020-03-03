// client/src/middleware/users.js

module.exports = {
  isLoggedIn: (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      console.log(token);
      const decoded = jwt.verify(
        token,
        'SECRETKEY'
      );
      console.log(decoded);
      req.userData = decoded;
      next();
    } catch (err) {
      return res.status(401).send({
        msg: 'Your session is not valid!'
      });
    }
  }
};
