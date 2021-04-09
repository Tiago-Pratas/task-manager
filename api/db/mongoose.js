// handle connection logic to MongoDB

import mongoose from 'mongoose';

const dbURL = 'mongodb://localhost:27017/Taskmanager';

const connect = async () => {

    try {
        await mongoose.connect(dbURL, { 
            useNewUrlParser: true,
            useUnifiedTopology: true });
            
            console.log("Connected to the DB");
    }
    catch (e) {
        console.log("Couldn't connect to the DB: ", e);
    }

}

//avoid those deprecation warnings from showing up
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);



export { connect };