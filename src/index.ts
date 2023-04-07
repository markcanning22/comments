import express, {Request, Response} from 'express';
import {randomBytes} from 'crypto';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use (bodyParser.json());
app.use(cors());

const commentsByPostId: {[index: string]: Array<object>} = {};

app.get('/posts/:id/comments', (req: Request, res: Response): void => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req: Request, res: Response): Promise<void> => {
    const commentId: string = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];

    comments.push({id: commentId, content});

    commentsByPostId[req.params.id] = comments;

    await axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id
        }
    });

    res.status(201).send(comments);
});

app.post('/events', (req: Request, res: Response): void => {
    console.log('Received event', req.body.type);

    res.send({});
});

app.listen(4001, (): void => {
    console.log('Listening on 4001');
});