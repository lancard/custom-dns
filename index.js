const dns2 = require('dns2');

const { UDPClient, Packet } = dns2;
const resolve = UDPClient({ dns: '8.8.8.8' });

var map = {
  "test.co.kr": "127.0.0.1",
  "test2.co.kr": "127.0.0.1"
}

const server = dns2.createServer({
  udp: true,
  tcp: true,
  handle: (request, send, rinfo) => {
    try {
      const [question] = request.questions;
      const { name } = question;

      if (map[name]) {
        const response = Packet.createResponseFromRequest(request);
        response.answers.push({
          name,
          type: Packet.TYPE.A,
          class: Packet.CLASS.IN,
          ttl: 300,
          address: map[name]
        });
        send(response);
        return;
      }

      resolve(name).then(answer => {
        const response = Packet.createResponseFromRequest(request);
        response.answers = answer.answers;
        send(response);
      });
    }
    catch (e) { console.dir(e); send(null); }
  }
});

server.on('request', (request, response, rinfo) => {
  // console.log(request.header.id, request.questions[0]);
});

server.on('requestError', (error) => {
  console.log('Client sent an invalid request', error);
});

server.on('listening', () => {
  console.log(server.addresses());
});

server.on('close', () => {
  console.log('server closed');
});

server.listen({
  udp: {
    port: 53,
    address: "0.0.0.0",
    type: "udp4"
  },

  tcp: {
    port: 53,
    address: "0.0.0.0"
  },
});
