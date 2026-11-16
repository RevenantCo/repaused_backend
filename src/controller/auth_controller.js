const User = require('../model/user');
const { registerValidation } = require('../utils/validator');

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

module.exports = {
    register
};