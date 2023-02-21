const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bughouse API',
            version: '1.0.0',
            description: 'Bughouse API description',
        },
    },
    apis: ['./routes/room.js', './routes/user.js',
        './routes/service.js', './routes/auth.js',
        './routes/contract.js', './routes/index.js',
        './routes/address.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
