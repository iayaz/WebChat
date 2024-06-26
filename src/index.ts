import { IncomingMessage, SupportedMessage } from "./message/incomingMessages";
import { server as WebSocketServer, connection } from "websocket";
import http from "http";
import { InMemoryStore } from "./store/InMemoryStore";
import { UserManager } from "./UserManager";
import {
  OutgoingMessage,
  SupportedMessage as OutgoingSupportedMessages,
} from "./message/outgoingMessages";

const userManager = new UserManager();
const store = new InMemoryStore();

const server = http.createServer(function (request: any, response: any) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(8080, function () {
  console.log(" Server is listening on port 8080");
});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

function originIsAllowed(origin: any) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on("request", function (request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log(
      new Date() + " Connection from origin " + request.origin + " rejected."
    );
    return;
  }

  var connection = request.accept("echo-protocol", request.origin);
  console.log(new Date() + " Connection accepted.");
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      // console.log('Received Message: ' + message.utf8Data);
      // connection.sendUTF(message.utf8Data);
      try {
        messageHandler(connection, JSON.parse(message.utf8Data));
      } catch (e) {}
    }
  });
  // connection.on('close', function(reasonCode, description) {
  //     console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  // });
});

function messageHandler(ws: connection, message: IncomingMessage) {
  if (message.type === SupportedMessage.JoinRoom) {
    const payload = message.payload;
    userManager.addUser( payload.userId, payload.roomId,payload.name, ws);
  }

  if (message.type === SupportedMessage.SendMessage) {
    const payload = message.payload;
    const user = userManager.getUser(payload.roomId, payload.userId);

    if (!user) {
      console.error("USer Not Found in the DB");
      return;
    }

    let chat = store.addChat(
      payload.userId,
      user.name,
      payload.roomId,
      payload.message
    );
    if (!chat) {
      return;
    }

    const outGoingPayload: OutgoingMessage = {
      type: OutgoingSupportedMessages.AddChat,
      payload: {
        chatId: chat.id,
        roomId: payload.roomId,
        message: payload.message,
        name: user.name,
        upvotes: 0,
      },
    };
    userManager.broadcast(payload.roomId, payload.userId, outGoingPayload);
  }
  if (message.type === SupportedMessage.UpvoteMessage) {
    const payload = message.payload;
    const chat = store.upvote(payload.userId, payload.roomId, payload.chatId);
    console.log("inside upvote");
    if (!chat) {
      return;
    }
    console.log("inside upvote 2");

    const outgoingPayload: OutgoingMessage = {
      type: OutgoingSupportedMessages.UpdateChat,
      payload: {
        chatId: payload.chatId,
        roomId: payload.roomId,
        upvotes: chat.upvotes.length,
      },
    };

    console.log("inside upvote 3");
    userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
  }
}
