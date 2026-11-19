function registerValidation(body) {
    const fields = {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : '';
    const github_username = typeof body.github_username === 'string' ? body.github_username.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password.trim() : '';

    if (!name || name.length < 1 || name.length > 100) {
        fields.name = 'Name must be between 1 and 100 characters';
    }
    if (!nickname || nickname.length < 3 || nickname.length > 30) {
        fields.nickname = 'Nickname must be between 3 and 30 characters';
    }
    if (!github_username || github_username.length < 3 || github_username.length > 39) {
        fields.github_username = 'required, 1–39 characters';
    } else if (
        !/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(github_username)
    ) {
        fields.github_username = 'invalid GitHub username format';
    }

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        fields.email = 'Invalid email address';
    }

    if (!password || password.length < 8 || password.length > 72) {
        fields.password = 'Password must be between 8 and 72 characters';
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        fields.password = 'must contain a letter and a digit';
    }

    if (Object.keys(fields).length > 0) {
        return { ok: false, fields };
    }

    return {
        ok: true,
        data: {
            name,
            nickname,
            github_username,
            email,
            password,
        },
    };
}

function loginValidation(body) {
    const fields = {};
    const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : '';
    const password = typeof body.password === 'string' ? body.password.trim() : '';

    if (!nickname || nickname.length < 3 || nickname.length > 30) {
        fields.nickname = 'Nickname must be between 3 and 30 characters';
    }
    if (!password || password.length < 8 || password.length > 72) {
        fields.password = 'Password must be between 8 and 72 characters';
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        fields.password = 'must contain a letter and a digit';
    }

    if (Object.keys(fields).length > 0) {
        return { ok: false, fields };
    }

    return {
        ok: true,
        data: {
            nickname,
            password,
        },
    };
}

function updateProfileValidation(body) {
    const fields = {};
    const data = {};

    if (body.name !== undefined) {
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        if (!name || name.length > 100) fields.name = 'Name must be between 1 and 100 characters';
        else data.name = name;
    }
    if (body.email !== undefined) {
        const email = typeof body.email === 'string' ? body.email.trim() : '';
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) fields.email = 'Invalid email address';
        else data.email = email;
    }
    if (body.github_username !== undefined) {
        const gh = typeof body.github_username === 'string' ? body.github_username.trim() : '';
        if (!gh || gh.length < 3 || gh.length > 39) fields.github_username = 'required, 1–39 characters';
        else if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(gh))
            fields.github_username = 'invalid GitHub username format';
        else data.github_username = gh;
    }

    if (Object.keys(fields).length) return { ok: false, fields };
    if (Object.keys(data).length === 0) return { ok: false, fields: { _: 'No fields to update' } };
    return { ok: true, data };


}

module.exports = { registerValidation, loginValidation, updateProfileValidation }