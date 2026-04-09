export class Socket {
  constructor() {}
  connect() {}
  disconnect() {}
  channel() { return new Channel(); }
  onOpen() {}
  onClose() {}
  onError() {}
}

export class Channel {
  constructor() {}
  join() { return { receive: () => this }; }
  leave() { return { receive: () => this }; }
  on() {}
  off() {}
  push() { return { receive: () => this }; }
}

export class Presence {
  constructor() {}
  onSync() {}
  list() { return []; }
}

export default { Socket, Channel, Presence };