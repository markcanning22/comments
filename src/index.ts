import express, {Request, Response} from 'express';
import {randomBytes} from 'crypto';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use (bodyParser.json());
app.use(cors());

const commentsByPostId: {[index: string]: Array<object>} = {};

app.get('/posts/:id/comments', (req: Request, res: Response): void => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', (req: Request, res: Response): void => {
    const commentId: string = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];

    comments.push({id: commentId, content});

    commentsByPostId[req.params.id] = comments;

    res.status(201).send(comments);
});

app.listen(4001, (): void => {
    console.log('Listening on 4001');
});