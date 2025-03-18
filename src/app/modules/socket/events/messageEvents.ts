import { chatService } from '../../chat/chat.service';
import { messageService } from '../../message/message.service';
import { Types } from 'mongoose';

interface IMessageData {
  chat: Types.ObjectId;
  message?: string;
  type: 'general' | 'special' | 'reply' | 'image' | 'audio';
  link?: string;
  image?: string;
  audio?: string;
  sender: Types.ObjectId;
}

export const handleMessageEvents = async (
  socket: any,
  data: IMessageData,
  callback: any,
  io: any,
) => {
  try {
    const chatId = new Types.ObjectId(data.chat);
    const senderId = new Types.ObjectId(data.sender);

    // Create message based on type
    const messageData: any = {
      chat: chatId,
      sender: senderId,
      type: data.type || 'general',
    };

    // Set the appropriate field based on message type
    if (data.type === 'image' && data.image) {
      messageData.image = data.image;
    } else if (data.type === 'audio' && data.audio) {
      messageData.audio = data.audio;
    } else if (data.message) {
      messageData.message = data.message;
    }

    const message = await messageService.addMessage(messageData);

    if (message && message._id) {
      const populatedMessage: any = await messageService.getMessageById(
        message._id,
      );

      if (populatedMessage.chat && populatedMessage.chat.participants) {
        const participants = populatedMessage.chat.participants;
        const chatId = data.chat ? data.chat.toString() : 'unknown';
        const chatRoom = 'new-message::' + chatId;

        socket.broadcast.emit(chatRoom, message);

        const eventName1 = 'update-chatlist::' + participants[0].toString();
        const eventName2 = 'update-chatlist::' + participants[1].toString();

        const chatListForUser1 = await chatService.getChatByParticipantId(
          { participantId: participants[0] },
          { page: 1, limit: 10 },
        );

        const chatListForUser2 = await chatService.getChatByParticipantId(
          { participantId: participants[1] },
          { page: 1, limit: 10 },
        );

        io.emit(eventName1, chatListForUser1);
        io.emit(eventName2, chatListForUser2);

        let successMessage = 'Message sent';
        if (data.type === 'image') successMessage = 'Image sent';
        if (data.type === 'audio') successMessage = 'Audio sent';

        callback({
          status: 'Success',
          message: successMessage,
        });
      } else {
        callback({
          status: 'Error',
          message: 'Chat does not have participants.',
        });
      }
    } else {
      callback({
        status: 'Error',
        message: 'Failed to create message.',
      });
    }
  } catch (error: any) {
    console.error('Error handling message events:', error);
    callback({
      status: 'Error',
      message: error.message || 'An error occurred',
    });
  }
};