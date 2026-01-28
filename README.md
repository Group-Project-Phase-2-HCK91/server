# Server

npm install pg sequelize multer express socket.io @google/generative-ai cloudinary dotenv cors 

npx sequelize model:create --name User --attributes username:string


npx sequelize model:create --name Message --attributes UserId:integer,content:text,imgUrl:string