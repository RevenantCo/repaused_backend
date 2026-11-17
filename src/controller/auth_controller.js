const User = require('../model/user');
let jwt = require('jsonwebtoken');

const { registerValidation, loginValidation } = require('../utils/validator');

async function register(req, res, next) {
    try {
        const result = registerValidation(req.body);

        if (!result.ok) {
            return res.status(400).json({
                error: {
                    message: 'Validation failed',
                    fields: result.fields,
                    status: 400,
                }
            });
        }
        const { name, nickname, github_username, email, password } = result.data;

        const user = new User({
            name,
            nickname,
            github_username,
            email,
        });

        user.password = password;

        await user.save();

        return res.status(201).json({
            ok: true,
            message: 'User created successfully',
            data: {
                name: user.name,
                nickname: user.nickname,
                github_username: user.github_username,
                email: user.email,
            },
        });
    } catch (error) {
        if (error && error.code === 11000) {
            const key = Object.keys(error.keyPattern || error.keyValue || {})[0];

            if (key === 'nickname') {
                return res.status(409).json({
                    error: {
                        message: 'Nickname already taken',
                        status: 409,
                        code: 'NICKNAME_TAKEN',
                    },
                });
            }
            if (key === 'github_username_lower' || key === 'github_username') {
                return res.status(409).json({
                    error: {
                        message: 'GitHub username already taken',
                        status: 409,
                        code: 'GITHUB_USERNAME_TAKEN',
                    },
                });
            }
            if (key === 'email') {
                return res.status(409).json({
                    error: {
                        message: 'Email already registered',
                        status: 409,
                        code: 'EMAIL_TAKEN',
                    },
                });
            }

            return res.status(409).json({
                error: {
                    message: 'Duplicate value',
                    status: 409,
                    code: 'DUPLICATE_KEY',
                },
            });
        }

        return next(error);
    }

}

async function login(req, res, next) {
    try {
        const result = loginValidation(req.body);
        if (!result.ok) {
            return res.status(400).json({
                error: {
                    message: 'Validation failed',
                    fields: result.fields,
                    status: 400,
                }
            });
        }
        const { nickname, password } = result.data;

        const user = await User.findOne({ nickname });

        const unauthorized = () => res.status(401).json({
            error: {
                message: 'Unauthorized',
                status: 401,
                code: 'UNAUTHORIZED',
            },
        });

        if (!user) {
            return unauthorized();
        }
        if (user.is_deleted) {
            return unauthorized();
        }
        if (!user.authenticate(password)) {
            return unauthorized();
        }

        const expiresIn = 86400;
        const payload = {
            id: user._id,
            nickname: user.nickname,
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            algorithm: 'HS512',
            expiresIn: expiresIn,
        });

        return res.status(200).json({
            ok: true,
            message: 'Login successful',
            data: {
                token: token,
                expiresIn: expiresIn,
            },
        });


    } catch (error) {
        console.log(error);
        next(error);
    }
}
module.exports.logtoken = async function (req, res, next) {
    console.log(req.headers);
    next();
}

module.exports = {register, login };