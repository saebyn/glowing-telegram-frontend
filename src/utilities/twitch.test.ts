import { beforeEach, describe, expect, it, vi } from 'vitest';
import { startCommercial } from './twitch';

// Mock the fetch function
global.fetch = vi.fn();

describe('twitch utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startCommercial', () => {
    it('should include Content-Type header when making POST request', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [
            {
              length: 180,
              message: 'Commercial started',
              retry_after: 480,
            },
          ],
        }),
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await startCommercial('broadcaster123', 'access_token_123', 180);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.twitch.tv/helix/channels/commercial',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            broadcaster_id: 'broadcaster123',
            length: 180,
          }),
        }),
      );
    });

    it('should include Authorization header', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [
            {
              length: 60,
              message: 'Commercial started',
              retry_after: 480,
            },
          ],
        }),
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await startCommercial('broadcaster456', 'access_token_456', 60);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.twitch.tv/helix/channels/commercial',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer access_token_456',
          }),
        }),
      );
    });

    it('should throw error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      await expect(
        startCommercial('broadcaster789', 'access_token_789', 90),
      ).rejects.toThrow('Failed to start commercial');
    });

    it('should return response data correctly', async () => {
      const mockResponseData = {
        length: 120,
        message: 'Commercial started successfully',
        retry_after: 480,
      };

      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [mockResponseData],
        }),
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse,
      );

      const result = await startCommercial(
        'broadcaster999',
        'access_token_999',
        120,
      );

      expect(result).toEqual(mockResponseData);
    });
  });
});
