import express = require('express');
import tiktok = require('tiktok-app-api');

import { IllegalIdentifier } from '../repo/api/errors/IllegalIdentifier';
import { ResourceNotFound } from '../repo/api/errors/ResourceNotFound';

const app = express();

app.get('/api/trending', getTrendingVideos);

app.get('/api/user/:identifier', getUserInfo);
app.get('/api/user/:identifier/videos', getRecentVideos);
app.get('/api/user/:identifier/liked', getLikedVideos);

app.get('/api/video/:id', getVideoInfo);

app.get('/api/audio/:id', getAudioInfo);
app.get('/api/audio/:id/videos', getAudioTopVideos);

app.get('/api/tag/:id', getTagInfo);
app.get('/api/tag/:id/videos', getTagTopVideos);

app.listen(8000);

const tiktokApp = tiktok();

async function getTrendingVideos(req, res) {
    const trendingVideos = await tiktokApp.getTrendingVideos();

    res.status(200).send(trendingVideos).end();
}

async function getUserInfo(req, res) {
    let userInfo;

    try {
        userInfo = await tiktokApp.getUserInfo(req.params.identifier);
    } catch (err) {
        handleError(err, res);
    }

    res.status(200).send(userInfo).end();
}

async function getRecentVideos(req, res) {
    const user = await getUser(req.params.identifier);
    const recentVideos = await tiktokApp.getRecentVideos(user);

    res.status(200).send(recentVideos).end();
}

async function getLikedVideos(req, res) {
    const user = await getUser(req.params.identifier);
    const likedVideos = await tiktokApp.getLikedVideos(user);

    res.status(200).send(likedVideos).end();
}

async function getVideoInfo(req, res) {
    const video = await tiktokApp.getVideo(req.params.id);

    let videoInfo;
    try {
        videoInfo = await tiktokApp.getVideoInfo(video);
    } catch (err) {
        handleError(err, res);
    }

    res.status(200).send(videoInfo).end();
}

async function getAudioInfo(req, res) {
    const audio = await tiktokApp.getAudio(req.params.id);

    let audioInfo;
    try {
        audioInfo = await tiktokApp.getAudioInfo(audio);
    } catch (err) {
        handleError(err, res);
    }

    res.status(200).send(audioInfo).end();
}

async function getAudioTopVideos(req, res) {
    const audio = await tiktokApp.getAudio(req.params.id);
    const topVideos = await tiktokApp.getAudioTopVideos(audio);

    res.status(200).send(topVideos).end();
}

async function getTagInfo(req, res) {
    let tagInfo;
    try {
        tagInfo = await tiktokApp.getTagInfo(req.params.id);
    } catch (err) {
        handleError(err, res);
    }

    res.status(200).send(tagInfo).end();
}

async function getTagTopVideos(req, res) {
    const tag = await tiktokApp.getTag(req.params.id);
    const topVideos = await tiktokApp.getTagTopVideos(tag);

    res.status(200).send(topVideos).end();
}

async function getUser(id: string) {
    return isNaN(Number(id)) ? await tiktokApp.getUserByName(id) : Promise.resolve(tiktokApp.getUserByID(id));
}

function handleError(err, res) {
    let statusCode;

    if (err instanceof IllegalIdentifier) {
        statusCode = 400;
    } else if (err instanceof ResourceNotFound) {
        statusCode = 404;
    }

    const body = {
        error: err.message,
    }
    res.status(statusCode).send(body).end();
}