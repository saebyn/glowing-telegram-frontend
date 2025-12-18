/**
 * Mock WebSocket class for testing and Storybook
 * Simulates different connection states for WebSocket connections
 */
export class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState: number;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(
    url: string,
    public triggerState:
      | 'connected'
      | 'connecting'
      | 'disconnected'
      | 'error' = 'connected',
  ) {
    this.url = url;
    this.readyState =
      triggerState === 'connecting'
        ? MockWebSocket.CONNECTING
        : MockWebSocket.OPEN;

    // Simulate connection states after a brief delay
    setTimeout(() => {
      if (triggerState === 'connected' && this.onopen) {
        this.readyState = MockWebSocket.OPEN;
        this.onopen(new Event('open'));
      } else if (triggerState === 'error' && this.onerror) {
        this.onerror(new Event('error'));
      } else if (triggerState === 'disconnected' && this.onclose) {
        this.readyState = MockWebSocket.CLOSED;
        this.onclose(
          new CloseEvent('close', {
            code: 1001,
            reason: 'Going away',
            wasClean: false,
          }),
        );
      }
    }, 10);
  }

  send() {}

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(
        new CloseEvent('close', { code: 1000, reason: '', wasClean: true }),
      );
    }
  }

  addEventListener(type: string, listener: EventListener) {
    if (type === 'open') this.onopen = listener as (event: Event) => void;
    if (type === 'close')
      this.onclose = listener as (event: CloseEvent) => void;
    if (type === 'error') this.onerror = listener as (event: Event) => void;
    if (type === 'message')
      this.onmessage = listener as (event: MessageEvent) => void;
  }

  removeEventListener() {}

  // Helper method to simulate receiving a message
  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage(
        new MessageEvent('message', { data: JSON.stringify(data) }),
      );
    }
  }

  // Helper method to simulate an error
  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  // Helper method to simulate closing
  simulateClose(code = 1000, reason = '', wasClean = true) {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason, wasClean }));
    }
  }
}
