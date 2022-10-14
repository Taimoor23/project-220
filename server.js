const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json())

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);
var nodeMailer=require('nodeMailer');
const { info } = require("console");
const transporter=nodeMailer.createTransport({
    port:465,
    host:'smtp.gmail.com',
    auth:{
        user:'mtaskbajwa@gmail.com',
        pass:'kbzhnclcwjpbovzq'
    },
    secure:true,
})

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

app.post('/send-mail',(req,res)=>{
    const to=req.body.to
    const url=req.body.url
    const mailData={
        from:'mtaskbajwa@gmail.com',
        to:to,
        subject:'join the chat with me!:',
        html:`<p>Hello There, </p><p>Come and join me - ${url} </p>`
    };
    transporter.sendMail(mailData,(error,info)=>{
        if(error){
            return console.log(error)
        }
        res.status(200).send({message:'Invitation sent!',message_id:info.messageId})
    })
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
    })
});

server.listen(process.env.PORT || 3030);
