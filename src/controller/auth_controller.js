const User = require('../model/user');
let jwt = require('jsonwebtoken');

const { registerValidation, loginValidation, updateProfileValidation } = require('../utils/validator');

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
        if (user.deleted_at) {
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

async function updateProfile(req, res, next) {
    try {
        const result = updateProfileValidation(req.body);

        if (!result.ok) {
            return res.status(400).json({
                error: {
                    message: 'Validation failed',
                    fields: result.fields,
                    status: 400,
                }
            });
        }

        const user = await User.findOne({
            nickname: req.auth.nickname
        });

        if (!user || user.deleted_at) {
            return res.status(401).json({
                error: {
                    message: 'Unauthorized',
                    status: 401,
                    code: 'UNAUTHORIZED',
                },
            });
        }

        Object.assign(user, result.data);
        await user.save();
        return res.status(200).json({ 
            message: 'Profile updated successfully',
            data: user.toJSON() 
        });

    } catch (error) {
        if (error && error.code === 11000) {
            const key = Object.keys(error.keyPattern || error.keyValue || {})[0];
            const messages = {
                email: 'Email already registered',
                github_username: 'GitHub username already taken',
                github_username_lower: 'GitHub username already taken',
            };
            return res.status(409).json({
                error: { message: messages[key] || 'Duplicate value', status: 409 },
            });
        }
        return next(error);

    }

}

async function deleteAccount(req, res, next) {
    try {
        const user = await User.findOne({
            nickname: req.auth.nickname
        });

        if (!user) {
            return res.status(401).json({
                error: {
                    message: 'Unauthorized',
                    status: 401,
                    code: 'UNAUTHORIZED',
                },
            });
        }
        if (user.deleted_at) {
            return res.status(204).end();
        }

        user.deleted_at = new Date();
        await user.save();
        return res.status(200).json({ 
            message: 'Account deleted successfully' });
    } catch (error) {
        return next(error);

    }

}


async function checkNickname(req, res, next) {
    try {
        const nickname = typeof req.query.nickname === 'string' ? req.query.nickname.trim() : '';
        if (!nickname || nickname.length < 3 || nickname.length > 30 || !/^[a-zA-Z0-9_-]+$/.test(nickname)) {
            return res.status(400).json({
                error: {
                    message: 'Invalid nickname',
                    status: 400,
                    code: 'INVALID_NICKNAME',
                }
            });
        }
        const exists = await User.exists({ nickname }).setOptions({ includeDeleted: true });

        return res.status(200).json({ nickname: nickname, available: !exists });
    } catch (error) {
        return next(error);
    }

}

async function checkGithubUsername(req, res, next) {
    try {
        const username = typeof req.query.github_username === 'string' ? req.query.github_username.trim() : '';
        if (!username || username.length < 3 || username.length > 39 || !/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
            return res.status(400).json({
                error: {
                    message: 'Invalid Github username',
                    status: 400,
                    code: 'INVALID_GITHUB_USERNAME',
                }
            });
        }
        const exists = await User.exists({ github_username_lower: username.toLowerCase() }).setOptions({ includeDeleted: true });

        return res.status(200).json({ github_username: username, available: !exists });
    } catch (error) {
        return next(error);
    }
}


module.exports = { register, login, updateProfile, deleteAccount, checkNickname, checkGithubUsername };