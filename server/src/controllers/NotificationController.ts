import { Request, Response } from 'express';
import {
    Controller,
    Post
} from '@overnightjs/core';
import * as STATUS from 'http-status-codes';
import { Expo } from 'expo-server-sdk';

@Controller('notification')
export class NotificationController {
    @Post('')
    private notificationToken(req: Request, res: Response) {
        let token:string;
        if (req.body.expoToken) {
            token = req.body.expoToken
            console.log(token)
        }
        else {
            res.status(STATUS.BAD_REQUEST).json({
                message: 'Missing [expoToken] in request body',
                identifier: 'NC001'
            })
            return;
        }

        // sending notifications. 
        // Create a new Expo SDK client
        // optionally providing an access token if you have enabled push security
        let expo = new Expo();

        // Create the messages that you want to send to clients.
        let messages = [];
        let pushToken = token
            // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

            // Check that all your push tokens appear to be valid Expo push tokens
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`Push token ${pushToken} is not a valid Expo push token`);
                // continue;
                res.status(STATUS.INTERNAL_SERVER_ERROR).json()
                return;
            }

            // Construct a message.
            messages.push({
                to: pushToken,
                sound: 'default',
                body: 'This is a test notification',
                data: { withSome: 'data' },
            })

            // Send notifications in chunks.
            let chunks = expo.chunkPushNotifications(messages);
            let tickets = [];
            (async () => {
                // Send the chunks to the Expo push notification service. There are
                // different strategies you could use. A simple one is to send one chunk at a
                // time, which nicely spreads the load out over time:
                for (let chunk of chunks) {
                    try {
                        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                        console.log(ticketChunk);
                        tickets.push(...ticketChunk);
                        // NOTE: If a ticket contains an error code in ticket.details.error, you
                        // must handle it appropriately. The error codes are listed in the Expo
                        // documentation:
                        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                    } catch (error) {
                        console.error(error);
                    }
                }
            })();

            // Handle receipts.
            let receiptIds = [];
            for (let ticket of tickets) {
            // NOTE: Not all tickets have IDs; for example, tickets for notifications
            // that could not be enqueued will have error information and no receipt ID.
                if (ticket.id) {
                    receiptIds.push(ticket.id);
                }
            }

            let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
            (async () => {
            // Like sending notifications, there are different strategies you could use
            // to retrieve batches of receipts from the Expo service.
            for (let chunk of receiptIdChunks) {
                try {
                    let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                    console.log(receipts);

                    // The receipts specify whether Apple or Google successfully received the
                    // notification and information about an error, if one occurred.
                    for (let receiptId in receipts) {
                        let { status, message, details } = receipts[receiptId] as any;
                        if (status === 'ok') {
                            continue;
                        } else if (status === 'error') {
                            console.error(
                            `There was an error sending a notification: ${message}`
                            );
                            if (details && details.error) {
                                // The error codes are listed in the Expo documentation:
                                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                                // You must handle the errors appropriately.
                                console.error(`The error code is ${details.error}`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
            })();
        
    }
}