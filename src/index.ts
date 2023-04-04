import express from 'express';
import {randomBytes} from 'crypto';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use (bodyParser.json());
app.use(cors());

const commentsByPostId: {[index: string]: Array<object>} = {};

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];

    comments.push({id: commentId, content});

    commentsByPostId[req.params.id] = comments;

    res.status(201).send(comments);
});

app.listen(4001, () => {
    console.log('Listening on 4001');
});