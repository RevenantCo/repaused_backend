const User = require('../model/user');
const Project = require('../model/project');
const Graveyard = require('../model/graveyard');

// Resolves the authenticated JWT identity to the current, non-deleted User document.
// Returns null when the token is old or the account has been soft-deleted.
async function getRequester(req) {
    const user = await User.findOne({ nickname: req.auth.nickname });
    if (!user || user.deleted_at) return null;
    return user;
}

// Loads a project only when its parent graveyard is owned by the given user.
// Returns null for a missing project, a missing graveyard, or a different owner,
// so callers can answer with a single generic 404.
async function getOwnedProject(id, user) {
    const project = await Project.findById(id);
    if (!project) return null;

    const graveyard = await Graveyard.findById(project.graveyard);
    if (!graveyard || !graveyard.owner.equals(user._id)) return null;

    return project;
}

module.exports = { getRequester, getOwnedProject };
