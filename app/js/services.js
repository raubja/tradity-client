(function() {'use strict';

angular.module('tradity').
	factory('socket', function ($rootScope, API_HOST) {
		var connect = function() {
			return io.connect(API_HOST);
		};
		
		var socket = new SoTradeConnection(connect);
		
		return {
			on: function (eventName, callback, angularScope) {
				socket.on(eventName, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						callback.apply(socket, args);
					});
				}, angularScope);
			},
			emit: function (eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				});
			},
			hasOpenQueries: function () { return socket.hasOpenQueries(); },
			txPackets: function() { return socket.txPackets(); },
			rxPackets: function() { return socket.rxPackets(); },
			reconnect: function() { return socket.reconnect(); },
			protocolVersion: function() { return socket.protocolVersion(); }
		};
	}).factory('chat', function(socket,$rootScope,DEFAULT_PROFILE_IMG) {

		/* chat Class */

		var Chat = function(event, chatid, members) {
			if (!event || !chatid || !members)
				throw new Error("parameter error");

			this.members = members;
			this.chatid = chatid;
			this.event = event;
			this.messages = [];
		}

		Chat.prototype.add = function(content,profilepic,uid,time) {
			if (!time || !uid || !content)
				throw new Error("parameter error");
			this.messages.push({
				content: content,
				profilepic: profilepic || DEFAULT_PROFILE_IMG,
				uid: uid,
				time: time
			})
			$rootScope.$broadcast('getMessage');
		};

		/* chats Class */

		var Chats = function() {
			var self = this;
			this.chats = [];

			socket.on('comment', function (data) {
				self.onMessage(data)
			});
			socket.on('list-all-chats', function (data) {
				self.onChats(data)
			});
			socket.emit('list-all-chats');
		}

		Chats.prototype.add = function(event, chatid, members) {
			this.chats.push(new Chat(event, chatid, members))
			$rootScope.$broadcast('getChat');
		};

		Chats.prototype.onMessage = function(event) {
			if (event.baseeventtype == 'chat-start') {
				var chat = this.getByEvent(event.baseeventid);
				if (chat) {
					chat.add(event.comment,event.profilepic,event.commenter,event.eventtime);
				} else
					throw new Error("chat not found")
			}

		};

		Chats.prototype.onChats = function(data) {
			for (var i in data.chats) {
				this.add( // exits ?
					data.chats[i].chatstartevent,
					data.chats[i].chatid,
					data.chats[i].members
				)
			};
		};

		Chats.prototype.getByEvent = function(event) {
			for (var i = 0; i < this.chats.length; i++) {
				if (this.chats[i].event == event)
					return this.chats[i];
			};
			return false;
		};

		Chats.prototype.getById = function(chatid) {
			for (var i = 0; i < this.chats.length; i++) {
				if (this.chats[i].chatid == chatid)
					return this.chats[i];
			};
			return false;
		};

		return new Chats();
	})
})();
