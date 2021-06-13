export class Queue {
    private connection;
    private channel;

    constructor(name: string, cluster: any, connection: any) {
        this.connection = connection;
        this.consumeQueue(name, cluster);
    }

    private consumeQueue = async (queue, cluster, isNoAck = false, durable = false, prefetch = null) => {
    
        const channel = await cluster.createChannel();
        this.channel = channel;
        await channel.assertQueue(queue, durable=durable);
    
        if (prefetch) {
            channel.prefetch(prefetch);
        }
    
        try {
            channel.consume(queue, message => {
                if (message !== null) {
                    channel.ack(message);
                    this.connection.sendUTF(message.content)
                    return null;
                } else {
                    console.log(message, 'Queue is empty!')
                    channel.reject(message);
                }
             }, {noAck: isNoAck})

        } catch (error) {
            console.log(error, 'Failed to consume messages from Queue!')
            cluster.close(); 
        }
    }

    //general function for publishing by queue name
    public publishToQueue = async (queue, message) => {
        try {
            await this.channel.sendToQueue(queue, Buffer.from(message));
        } catch (error) {
            // handle error response
            console.error(error, 'Unable to connect to cluster!');  
            process.exit(1);
        }
    }

    public setConnection = (connection: any) => {
        this.connection = connection;
        return;
    }
}