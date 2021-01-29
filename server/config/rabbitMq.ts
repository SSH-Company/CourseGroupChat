export const config = {
    port: 5672,
    rabbit: {
        connectionString: `amqp://localhost`,
        queue: 'MessageQueue'
    }
}