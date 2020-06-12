import express = require('express');
import tiktok = require('tiktok-app-api');

let expressApp: express.Express;
let tiktokApp: tiktok.TikTok;

(async () => {
    expressApp = express();
    tiktokApp = await tiktok();

    setupRoutes();

    expressApp.listen(8000);
})();

function setupRoutes(): void {
    expressApp.get('/api/trending', getTrendingVideos);

    expressApp.get('/api/user/:identifier', getUserInfo);
    expressApp.get('/api/user/:identifier/uploaded', getUploadedVideos);
    expressApp.get('/api/user/:identifier/liked', getLikedVideos);

    expressApp.get('/api/video/:id', getVideoInfo);

    expressApp.get('/api/audio/:id', getAudioInfo);
    expressApp.get('/api/audio/:id/videos', getAudioTopVideos);

    expressApp.get('/api/tag/:id', getTagInfo);
    expressApp.get('/api/tag/:id/videos', getTagTopVideos);
}

async function getTrendingVideos(req: express.Request, res: express.Response): Promise<void> {
    let videos: tiktok.VideoInfo[] = [];

    const iterator = tiktokApp.getTrendingVideos();
    let result = await iterator.next();

    while (!result.done) {
        videos = videos.concat(result.value);
        result = await iterator.next();
    }

    res.status(200).send(videos).end();
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

async function getUploadedVideos(req: express.Request, res: express.Response): Promise<void> {
    const user = await getUser(req.params.identifier);

    let videos: tiktok.VideoInfo[] = [];

    const iterator = tiktokApp.getUploadedVideos(user);
    let result = await iterator.next();

    while (!result.done) {
        videos = videos.concat(result.value);
        result = await iterator.next();
    }

    res.status(200).send(videos).end();
}

async function getLikedVideos(req: express.Request, res: express.Response): Promise<void> {
    const user = await getUser(req.params.identifier);

    let videos: tiktok.VideoInfo[] = [];

    const iterator = tiktokApp.getLikedVideos(user);
    let result = await iterator.next();

    while (!result.done) {
        videos = videos.concat(result.value);
        result = await iterator.next();
    }

    res.status(200).send(videos).end();
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

    let videos: tiktok.VideoInfo[] = [];

    const iterator = tiktokApp.getAudioTopVideos(audio);
    let result = await iterator.next();

    while (!result.done) {
        videos = videos.concat(result.value);
        result = await iterator.next();
    }

    res.status(200).send(videos).end();
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

    let videos: tiktok.VideoInfo[] = [];

    const iterator = tiktokApp.getTagTopVideos(tag);
    let result = await iterator.next();

    while (!result.done) {
        videos = videos.concat(result.value);
        result = await iterator.next();
    }

    res.status(200).send(videos).end();
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