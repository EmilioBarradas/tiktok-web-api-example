import express = require('express');
import tiktok = require('tiktok-app-api');

let expressApp: express.Express;
let tiktokApp: tiktok.TikTok;

main();

async function main(): Promise<void> {
    expressApp = express();
    tiktokApp = await tiktok();

    setupRoutes();

    expressApp.listen(8000);
}

function setupRoutes(): void {
    expressApp.get('/api/trending', getTrendingVideos);

    expressApp.get('/api/user/:identifier', getUserInfo);
    expressApp.get('/api/user/:identifier/videos', getRecentVideos);
    expressApp.get('/api/user/:identifier/liked', getLikedVideos);

    expressApp.get('/api/video/:id', getVideoInfo);

    expressApp.get('/api/audio/:id', getAudioInfo);
    expressApp.get('/api/audio/:id/videos', getAudioTopVideos);

    expressApp.get('/api/tag/:id', getTagInfo);
    expressApp.get('/api/tag/:id/videos', getTagTopVideos);
}

async function getTrendingVideos(req: express.Request, res: express.Response): Promise<void> {
    const trendingVideos = await tiktokApp.getTrendingVideos();

    res.status(200).send(trendingVideos).end();
}

async function getUserInfo(req: express.Request, res: express.Response): Promise<void> {
    let userInfo: tiktok.UserInfo;

    try {
        userInfo = await tiktokApp.getUserInfo(req.params.identifier);
    } catch (err) {
        handleError(err, res);
    }

    res.status(200).send(userInfo).end();
}

async function getRecentVideos(req: express.Request, res: express.Response): Promise<void> {
    const user = await getUser(req.params.identifier);
    const recentVideos = await tiktokApp.getRecentVideos(user);

    res.status(200).send(recentVideos).end();
}

async function getLikedVideos(req: express.Request, res: express.Response): Promise<void> {
    const user = await getUser(req.params.identifier);
    const likedVideos = await tiktokApp.getLikedVideos(user);

    res.status(200).send(likedVideos).end();
}

async function getVideoInfo(req: express.Request, res: express.Response): Promise<void> {
    const video = tiktokApp.getVideo(req.params.id);

    let videoInfo: tiktok.VideoInfo;
    try {
        videoInfo = await tiktokApp.getVideoInfo(video);
    } catch (err) {
        handleError(err, res);
    }

    res.status(200).send(videoInfo).end();
}

async function getAudioInfo(req: express.Request, res: express.Response): Promise<void> {
    const audio = tiktokApp.getAudio(req.params.id);

    let audioInfo: tiktok.AudioInfo;
    try {
        audioInfo = await tiktokApp.getAudioInfo(audio);
    } catch (err) {
        handleError(err, res);
    }

    res.status(200).send(audioInfo).end();
}

async function getAudioTopVideos(req: express.Request, res: express.Response): Promise<void> {
    const audio = tiktokApp.getAudio(req.params.id);
    const topVideos = await tiktokApp.getAudioTopVideos(audio);

    res.status(200).send(topVideos).end();
}

async function getTagInfo(req: express.Request, res: express.Response): Promise<void> {
    let tagInfo: tiktok.TagInfo;

    try {
        tagInfo = await tiktokApp.getTagInfo(req.params.id);
    } catch (err) {
        handleError(err, res);
    }

    res.status(200).send(tagInfo).end();
}

async function getTagTopVideos(req: express.Request, res: express.Response): Promise<void> {
    const tag = await tiktokApp.getTag(req.params.id);
    const topVideos = await tiktokApp.getTagTopVideos(tag);

    res.status(200).send(topVideos).end();
}

async function getUser(id: string): Promise<tiktok.User> {
    return isNaN(Number(id))
            ? await tiktokApp.getUserByName(id) 
            : Promise.resolve(tiktokApp.getUserByID(id));
}

function handleError(err: Error, res: express.Response): void {
    let statusCode: number;

    if (err instanceof tiktokApp.IllegalIdentifier) {
        statusCode = 400;
    } else if (err instanceof tiktokApp.ResourceNotFound) {
        statusCode = 404;
    }

    const body = {
        error: err.message,
    }
    res.status(statusCode).send(body).end();
}