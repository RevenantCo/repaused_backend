const { default: mongoose } = require('mongoose');
const { createGraveyardValidation, updateGraveyardValidation } = require('../utils/validator');
const Graveyard = require('../model/graveyard');
const Project = require('../model/project');
const User = require('../model/user');


async function getGraveyards(req, res, next) {
    try {
        const graveyards = await Graveyard
            .find({ is_public: true })
            .select('title description')
            .lean();
        return res.status(200).json({
            message: "Graveyards fetched successfully",
            data: graveyards
        });
    } catch (error) {
        next(error);
    }

}

async function getGraveyardById(req, res, next) {
    try {

        const { id } = req.params
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                message: "Graveyards not found",
                status: 404
            });
        }

        const graveyard = await Graveyard
            .findOne({ _id: id, is_public: true })
            .select('title description')
            .lean();

        if (!graveyard) {
            return res.status(404).json({
                message: "Graveyards not found",
                status: 404
            });
        }



        const projects = await Project
            .find({ graveyard: id })
            .select('_id name epitaph description')
            .lean();
        return res.status(200).json({
            message: "Graveyards details fetched successfully",
            data: {
                title: graveyard.title,
                description: graveyard.description,
                projects: projects.map(proj => ({
                    id: proj._id,
                    name: proj.name,
                    epitaph: proj.epitaph,
                    description: proj.description,
                })),
            },
        });
    } catch (error) {
        next(error);
    }

}

async function createGraveyard(req, res, next) {
    try {
        const result = createGraveyardValidation(req.body);
        if (!result.ok) {
            return res.status(400).json({
                error: { message: 'Validation failed', fields: result.fields, status: 400 },
            });
        }

        const user = await User.findOne({ nickname: req.auth.nickname });
        if (!user || user.deleted_at) {
            return res.status(401).json({
                error: { message: 'Unauthorized', status: 401 },
            });
        }

        const graveyard = await Graveyard.create({
            ...result.data,
            owner: user._id,
        });

        return res.status(201).json({
            message: 'Graveyard created successfully',
            data: graveyard
        });
    } catch (error) {
        return next(error);
    }
}

async function updateGraveyard(req, res, next) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                error: { message: 'Graveyard not found', status: 404 },
            });
        }

        const result = updateGraveyardValidation(req.body);
        if (!result.ok) {
            return res.status(400).json({
                error: { message: 'Validation failed', fields: result.fields, status: 400 },
            });
        }

        const user = await User.findOne({ nickname: req.auth.nickname });
        if (!user || user.deleted_at) {
            return res.status(401).json({
                error: { message: 'Unauthorized', status: 401 },
            });
        }

        const graveyard = await Graveyard.findById(id);
        if (!graveyard) {
            return res.status(404).json({
                error: { message: 'Graveyard not found', status: 404 },
            });
        }

        if (!graveyard.owner.equals(user._id)) {
            return res.status(403).json({
                error: {
                    message: 'You are not the owner of this graveyard',
                    status: 403,
                },
            });
        }

        Object.assign(graveyard, result.data);
        await graveyard.save();

        return res.status(200).json({ 
            message: 'Graveyard updated successfully',
            data: graveyard });
    } catch (error) {
        return next(error);
    }
}

async function getUserGraveyard(req, res, next)
{
    try {
        const user = await User.findOne({ nickname: req.auth.nickname });
        if (!user || user.deleted_at) {
            return res.status(401).json({
                error: { message: 'Unauthorized', status: 401 },
            });
        }

        const graveyards = await Graveyard
            .find({ owner: user._id })
            .select('_id title description is_public')
            .sort({ created_at: -1 })
            .lean();

        return res.status(200).json({ 
            message: 'User graveyards fetched successfully',
            data: graveyards });
    } catch (error) {
        return next(error);
    }
}

module.exports = { getGraveyards, getGraveyardById, createGraveyard, updateGraveyard, getUserGraveyard };