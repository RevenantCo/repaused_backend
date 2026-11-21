const { getRequester } = require('../utils/project_access');
const Graveyard = require('../model/graveyard');
const Project = require('../model/project');


// Builds the dashboard data: the logged-in user's graveyards with each one's projects.
// It only reads records owned by that user, so nobody else's work is included.
async function getDashboard(req, res, next) {
    try {
        const user = await getRequester(req);
        if (!user) {
            return res.status(401).json({
                error: { message: 'Unauthorized', status: 401 },
            });
        }

        const graveyards = await Graveyard
            .find({ owner: user._id })
            .select('_id title description is_public')
            .sort({ created_at: -1 })
            .lean();

        const ids = graveyards.map(g => g._id);

        const projects = await Project
            .find({ graveyard: { $in: ids } })
            .select('_id graveyard name epitaph description github')
            .lean();

        const byGraveyard = new Map(ids.map(id => [id.toString(), []]));

        for (const project of projects) {
            const key = project.graveyard.toString();
            byGraveyard.get(key)?.push({
                id: project._id,
                name: project.name,
                epitaph: project.epitaph,
                description: project.description,
                github: project.github || {},
            });
        }

        return res.status(200).json({
            data: graveyards.map(g => ({
                id: g._id,
                title: g.title,
                description: g.description,
                is_public: g.is_public,
                projects: byGraveyard.get(g._id.toString()),
            })),
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = { getDashboard };