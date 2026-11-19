const { expressjwt } = require('express-jwt');

const requireAuth = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS512']
});

module.exports = { requireAuth }; 