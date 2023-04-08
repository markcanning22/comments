import express, {Express, Request, Response} from 'express';
import {randomBytes} from 'crypto';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';

enum CommentStatus {
    PENDING = 'pending'
}

type Comment = {
    id: string;
    content: string;
    status: CommentStatus;
    postId?: string;
};

const app: Express = express();
app.use (bodyParser.json());
app.use(cors());

const commentsByPostId: {[index: string]: Array<Comment>} = {};

app.get('/posts/:id/comments', (req: Request, res: Response): void => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req: Request, res: Response): Promise<void> => {
    const commentId: string = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comments: Comment[] = commentsByPostId[req.params.id] || [];

    const comment: Comment = {
        id: commentId,
        content,
        status: CommentStatus.PENDING
    };

    comments.push(comment);
    commentsByPostId[req.params.id] = comments;

    comment.postId = req.params.id;

    await axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        data: comment
    });

    res.status(201).send(comments);
});

app.post('/events', async (req: Request, res: Response): Promise<Response | undefined> => {
    console.log('Received event', req.body.type);

    const {type, data} = req.body;

    if (type == 'CommentModerated') {
        const {postId, id, status, content} = data;
        const comments: Comment[] = commentsByPostId[postId];

        const comment: Comment | undefined = comments.find(comment => {
            return comment.id === id;
        });

        if (comment === undefined) {
            return res.send({message: 'Unable to find comment'}).status(404);
        }

        comment.status = status;

        await axios.post('http://localhost:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        });
    }

    res.send({});
});

app.listen(4001, (): void => {
    console.log('Listening on 4001');
});