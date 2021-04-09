import express from 'express';
import { List, Task } from '../db/models/index.js'

const router = express.Router();

/* list routes */

/**
 * GET /lists
 * Purpose: get all lists of tasks
 */

router.get('/', (req, res) => {
    //returns an array of all the lists in the DB
    List.find().then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    });
});


/**
 * POST /lists
 * Purpose: create a list
 */
router.post('/', (req, res) => {
    // create a new list and return the new list document back to the user which icludes ID
    //The list information will be passed in via JSON req body
    let {title} = req.body;

    let newList = new List({
        title
    });

    newList.save().then((listDoc) => {
        //the full list doc should be returned
        res.send(listDoc);

    });
});

/**
  * PATCH /lists/:id
  * Purpose: update specified lists
  */
router.patch('/:id', async (req, res, next) => {
     //update a specified list with new values passed on in th JSON body's req
    try {
        const { id } = req.params;

        const updateList = await List.findOneAndUpdate({ _id: id }, {
            $set: req.body }, { new: true });
            return res.status(200).json(updateList);
    }
    catch (e) {
        next(e);
    }
})

router.delete('/:id', (req, res) => {
    //delete specified list
    List.findOneAndRemove({ _id: req.params.id }).then((removedListDoc) => {
        res.sendStatus(200);
    });
})

router.get('/:listId/tasks', async (req, res, next) => {
    
    try {    
        const taskList = await Task.find({ _listId: req.params.listId });
    
        return await res.send(taskList);
    }
    catch (e) {
        next(e);
    }
});

router.post('/:listId/tasks', async (req, res, next) => {
    try {
        
        let newTask = await new Task({
            title: req.body.title, 
            _listId: req.params.listId
        });

        const newTaskDoc = await newTask.save();

        return res.send(newTaskDoc)
    }
    catch (e) {
        next(e);
    }
})

router.patch('/:listId/tasks/:taskId', async (req, res, next) => {
    
    try {

        const foundTask = await Task.findOneAndUpdate({
            _id: req.params.taskId,
            _listId: req.params.listId
        }, {
            $set: req.body
        });
    
        return res.send({message: "updated"});
    }
    catch (e) {
        next(e);
    }

})

router.delete('/:listId/tasks/:taskId', async (req, res, next) => {
    try {
        const deleteTask = await Task.find({
            _id: req.params.taskId,
            _listId: req.params.listId
        })
        return res.send(200).json('this task has been deleted', deleteTask);
    }
    catch(e){
        next(e);
    }
})

router.get('/:listId/tasks/:taskId', async (req, res, next) => {
    try {
        const foundTask = await Task.find({
            _id: req.params.taskId,
            _listId: req.params.listId
        })
        return res.send(200).json('this task has been deleted', foundTask);
    }
    catch(e){
        next(e);
    }
})

export { router }