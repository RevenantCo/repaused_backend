const mongoose = require('mongoose');
const Project = require('../model/project');
const Graveyard = require('../model/graveyard');
const { createProjectValidation, updateProjectValidation } = require('../utils/validator');
const { getRequester, getOwnedProject } = require('../utils/project_access');

async function createProject(req, res, next) {
    try {
        const result = createProjectValidation(req.body);
        if (!result.ok) {
            return res.status(400).json({
                error: { message: 'Validation failed', fields: result.fields, status: 400 },
            });
        }

        const user = await getRequester(req);
        if (!user) {
            return res.status(401).json({
                error: { message: 'Unauthorized', status: 401 },
            });
        }

        const id = req.params.id || req.body.graveyard || req.body.graveyard_id;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                error: { message: 'Graveyard not found', status: 404 },
            });
        }

        const graveyard = await Graveyard.findOne({ _id: id, owner: user._id });
        if (!graveyard) {
            return res.status(404).json({
                error: { message: 'Graveyard not found', status: 404 },
            });
        }

        const project = await Project.create({ ...result.data, graveyard: id });

        return res.status(201).json({
            message: 'Project created successfully',
            data: project,
        });
    } catch (error) {
        return next(error);
    }
}

async function updateProject(req, res, next) {
    try {
        const user = await getRequester(req);
        if (!user) {
            return res.status(401).json({
                error: { message: 'Unauthorized', status: 401 },
            });
        }

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                error: { message: 'Project not found', status: 404 },
            });
        }

        const project = await getOwnedProject(id, user);
        if (!project) {
            return res.status(404).json({
                error: { message: 'Project not found', status: 404 },
            });
        }

        const result = updateProjectValidation(req.body);
        if (!result.ok) {
            return res.status(400).json({
                error: { message: 'Validation failed', fields: result.fields, status: 400 },
            });
        }

        if (result.data.github) {
            project.github = { ...(project.github || {}), ...result.data.github };
            delete result.data.github;
        }

        Object.assign(project, result.data);
        await project.save();

        return res.status(200).json({
            message: 'Project updated successfully',
            data: project,
        });
    } catch (error) {
        return next(error);
    }
}

async function getProject(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                error: { message: 'Project not found', status: 404 },
            });
        }

        const project = await Project
            .findById(id)
            .select('name epitaph description github')
            .lean();

        if (!project) {
            return res.status(404).json({
                error: { message: 'Project not found', status: 404 },
            });
        }

        return res.status(200).json({
            data: {
                id: project._id,
                name: project.name,
                epitaph: project.epitaph,
                description: project.description,
                github: project.github || {},
            },
        });
    } catch (error) {
        
        return next(error);
    }
}

module.exports = { createProject, updateProject, getProject };
