import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { WsService } from './../../../service/websockets/ws.service';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
interface Chat {
  message: string;
  votes: number;
  chatId: string;
}
@Component({
  selector: 'app-chatlayout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatlayout.component.html',
  styleUrl: './chatlayout.component.scss',
})
export class ChatlayoutComponent implements OnInit, AfterViewInit {
  leastchat: Chat[] = [];
  mediumchat: Chat[] = [];
  highchat: Chat[] = [];
  chatMessage: string = '';

  @ViewChildren('chatConatiner') private chatContainers!: QueryList<ElementRef>;

  constructor(private ws: WsService) { }

  ngOnInit(): void {
    this.ws.receivedMessage.subscribe((msg) => {
      if (msg.type === 'ADD_CHAT') {
        const { upvotes, message, chatId } = msg.payload;
        this.addChats({
          message,
          votes: upvotes,
          chatId
        });
        this.chatMessage = '';
      } else if (msg.type === 'UPDATE_CHAT') {
        const { upvotes, chatId } = msg.payload;
        const targetChat = this.leastchat.find(chat => chat.chatId === chatId)
          || this.mediumchat.find(chat => chat.chatId === chatId)
          || this.highchat.find(chat => chat.chatId === chatId);
        if (targetChat) {
          targetChat.votes = upvotes;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    this.chatContainers.forEach((chatContainer) => {
      chatContainer.nativeElement.scrollTop = chatContainer.nativeElement.scrollHeight;
    });
  }

  upvote(chat: Chat, source: string): void {
    const upvotePayload = {
      type: 'UPVOTE_MESSAGE',
      payload: {
        userId: '1',
        roomId: '1',
        chatId: chat.chatId,
      },
    };
    this.ws.sendUTF(upvotePayload);
  }

  addChats(chat: Chat): void {
    if (chat.votes < 11) {
      this.leastchat.push(chat);
    } else if (chat.votes < 21) {
      this.mediumchat.push(chat);
      this.leastchat = this.leastchat.filter(({ chatId }) => chatId !== chat.chatId);
    } else {
      this.highchat.push(chat);
      this.mediumchat = this.mediumchat.filter(({ chatId }) => chatId !== chat.chatId);
    }
  }

  sendMessage(): void {
    const send = {
      type: 'SEND_MESSAGE',
      payload: {
        userId: '1',
        roomId: '1',
        message: this.chatMessage,
      },
    };

    this.ws.sendUTF(send);
  }
}
