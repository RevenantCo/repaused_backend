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

function createGraveyardValidation(body) {
    const fields = {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';

    if (!title) {
        fields.title = 'Title is required';
    } else if (title.length > 150) {
        fields.title = 'Title must be at most 150 characters';
    }

    if (!description) {
        fields.description = 'Description is required';
    }

    if (Object.keys(fields).length) {
        return { ok: false, fields };
    }
    return { ok: true, data: { title, description } };
}


function updateGraveyardValidation(body) {
    const fields = {};
    const data = {};

    if (body.title !== undefined) {
        const title = typeof body.title === 'string' ? body.title.trim() : '';
        if (!title) fields.title = 'Title is required';
        else if (title.length > 150) fields.title = 'Title must be at most 150 characters';
        else data.title = title;
    }

    if (body.description !== undefined) {
        const description = typeof body.description === 'string' ? body.description.trim() : '';
        if (!description) fields.description = 'Description is required';
        else data.description = description;
    }

    if (Object.keys(fields).length) return { ok: false, fields };
    if (Object.keys(data).length === 0) {
        return { ok: false, fields: { _: 'No fields to update' } };
    }
    return { ok: true, data };
}



const GITHUB_PROJECT_FIELDS = [
    'repository_url',
    'repo_name',
    'readme',
    'description',
    'stars',
    'main_language',
    'last_commit_date',
    'creation_date',
];

function extractGithub(body) {
    const raw = {};

    if (body.github && typeof body.github === 'object' && !Array.isArray(body.github)) {
        Object.assign(raw, body.github);
    }

    for (const field of GITHUB_PROJECT_FIELDS) {
        const key = `github_${field}`;
        if (Object.prototype.hasOwnProperty.call(body, key)) {
            raw[field] = body[key];
        }
    }

    return raw;
}

function validateGithub(raw, fields) {
    const data = {};

    for (const field of GITHUB_PROJECT_FIELDS) {
        if (!Object.prototype.hasOwnProperty.call(raw, field)) continue;

        const value = raw[field];
        const label = `github.${field}`;

        if (value === null || value === undefined || value === '') {
            data[field] = value === null ? null : '';
            continue;
        }

        if (field === 'stars') {
            if (!Number.isInteger(value) || value < 0) {
                fields[label] = 'Stars must be a non-negative integer';
            } else {
                data[field] = value;
            }
        } else if (field === 'last_commit_date' || field === 'creation_date') {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
                fields[label] = 'Must be a valid date';
            } else {
                data[field] = date;
            }
        } else if (field === 'repository_url') {
            if (typeof value !== 'string') {
                fields[label] = 'Must be a URL string';
            } else {
                let valid = false;
                try {
                    new URL(value.trim());
                    valid = true;
                } catch {
                    valid = false;
                }
                if (!valid) fields[label] = 'Must be a valid URL';
                else data[field] = value.trim();
            }
        } else {
            if (typeof value !== 'string') {
                fields[label] = 'Must be a string';
            } else {
                data[field] = value.trim();
            }
        }
    }

    return data;
}

function createProjectValidation(body) {
    const fields = {};
    const data = {};

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const epitaph = typeof body.epitaph === 'string' ? body.epitaph.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';

    if (!name) fields.name = 'Name is required';
    else data.name = name;

    if (!epitaph) fields.epitaph = 'Epitaph is required';
    else data.epitaph = epitaph;

    if (!description) fields.description = 'Description is required';
    else data.description = description;

    const github = validateGithub(extractGithub(body), fields);
    if (Object.keys(github).length) data.github = github;

    if (Object.keys(fields).length) return { ok: false, fields };
    return { ok: true, data };
}

function updateProjectValidation(body) {
    const fields = {};
    const data = {};

    for (const key of ['name', 'epitaph', 'description']) {
        if (body[key] === undefined) continue;
        const value = typeof body[key] === 'string' ? body[key].trim() : '';
        if (!value) {
            fields[key] = `${key[0].toUpperCase() + key.slice(1)} is required`;
        } else {
            data[key] = value;
        }
    }

    const github = validateGithub(extractGithub(body), fields);
    if (Object.keys(github).length) data.github = github;

    if (Object.keys(fields).length) return { ok: false, fields };
    if (Object.keys(data).length === 0) {
        return { ok: false, fields: { _: 'No fields to update' } };
    }
    return { ok: true, data };
}

module.exports = {
    registerValidation,
    loginValidation,
    updateProfileValidation, 
    createGraveyardValidation,
    updateGraveyardValidation,
    createProjectValidation,
    updateProjectValidation,
}