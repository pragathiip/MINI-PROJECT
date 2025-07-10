import mongoose from "mongoose";


export const Connection = async () => {
    const URL = process.env.MONGODB_URL;

    try {
        await mongoose.connect(URL);
        console.log ('Database connected successfully!!!');
    } catch (error) {
        console.log ('Error while connecting with the database', error.message);
        console.log ('Server will continue running without database connection');
        console.log ('Please install and start MongoDB to enable data persistence');
    }
}

export default Connection;