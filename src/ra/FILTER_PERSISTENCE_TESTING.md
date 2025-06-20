# Filter Persistence Testing

This test documents how to manually verify that filter persistence is working correctly in the application.

## How to Test Filter Persistence

1. Start the development server:
   ```bash
   npm run start
   ```

2. Navigate to any resource list page that has filters:
   - Stream Plans: `/series` (has filters: Search, Start Time, Active)
   - Streams: `/streams` (has filters: Title search, Episodes, Stream Date After, Series)
   - Video Clips: `/video_clips` (has filters: Stream)

3. Apply some filter values:
   - Enter search terms
   - Select dropdown values
   - Set date ranges
   - Toggle boolean filters

4. Note the current filter values applied

5. Refresh the page (F5 or Ctrl+R)

6. Verify that all previously applied filter values are restored and the filtered results are displayed

## Technical Details

The filter persistence is implemented using React Admin's `localStorageStore()` which automatically:
- Saves filter values to localStorage when they change
- Restores filter values when the component mounts
- Uses the resource name and page context as storage keys

## Storage Location

Filter values are stored in the browser's localStorage under keys prefixed with `RaStore.`

Example localStorage entries:
- `RaStore.series.listParams` - Filter state for stream plans
- `RaStore.streams.listParams` - Filter state for streams  
- `RaStore.video_clips.listParams` - Filter state for video clips