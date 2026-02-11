// swagger.js
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Chat API',
    description: 'API documentation'
  },
  host: 'localhost:3000',
  schemes: ['http'],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Введите JWT токен как: Bearer <token>'
    }
  },
  security: [{ Bearer: [] }],
  definitions: {
    RegisterBody: {
      username: "string",
      email: "user@example.com",
      password: "string123"
    },
    LoginBody: {
      email: "user@example.com",
      password: "string123"
    },
    CreateChatBody: {
      contactId: "64d9f1ab23cd123456789abc"
    },
    CreateContactBody: {
      contactEmail: "friend@example.com",
      nickname: "MyFriend"
    },
    CreateMessageBody: {
      text: "Hello world!"
    },
    CreateReactionBody: {
      emoji: "👍"
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger file generated');
});
