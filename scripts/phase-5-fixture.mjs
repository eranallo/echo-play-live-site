import { buildShowDocumentModel } from '../lib/documents/showDocumentModel.mjs'

const showId = 'recPhase5Fixture'

const showRecord = {
  id: showId,
  createdTime: '2026-06-26T18:00:00.000Z',
  fields: {
    'Show Name': 'The Dick Beldings - Wedding Reception',
    Date: '2026-10-10',
    Band: ['recBand'],
    Venue: ['recVenue'],
    'Trailer Load-In Time': '2026-10-10T19:30:00.000Z',
    'Load-In Time': '2026-10-10T20:00:00.000Z',
    'Sound Check Time': '2026-10-10T22:00:00.000Z',
    'Doors Time': '2026-10-10T23:00:00.000Z',
    'Start Time': '2026-10-11T00:15:00.000Z',
    'End Time': '2026-10-11T04:00:00.000Z',
    'Members Playing': ['recEvan', 'recJames', 'recKevin', 'recKenny', 'recJosh'],
    'Sound Provider': 'Echo Play Live',
    'Sound Engineer': ['recEngineer'],
    'Merch Person': ['recMerch'],
    'Indoor / Outdoor': 'Indoor',
    'Deal Type': 'Flat Fee',
    'Ticket Price': 0,
    'Performance Rate': 4500,
    'EPL Percent': 450,
    'Trailer Cost': 180,
    'Audio Engineer Cost': 300,
    'Social Ads Spend': 0,
    'Merch Cost': 0,
    'Other Expenses': 120,
    Gas: 50,
    Lodging: 0,
    'Total Expenses': 650,
    'Net Income': 3850,
    'Band Payout': 770,
    'Drive Folder': 'https://drive.google.com/example-wedding',
    SETLISTS: ['recSetOne', 'recSetTwo', 'recSetThree'],
    'Production Notes': 'Band provides full backline, playback, wireless control, and vocal microphones. Venue provides two dedicated 20A circuits near stage. Keep the center aisle clear until the wedding party entrance is complete.',
    'Advance Notes': 'Rear loading door opens at 3:00 PM. Planner will meet the trailer at the service entrance. Vendor meals are served at 5:30 PM. Confirm final grand-entrance song and parent-dance files by October 7. No haze is permitted.',
    'Event Contact Name': 'Shane and Taylor',
    'Event Contact Phone': '(817) 555-0142',
    'Event Contact Email': 'shane.taylor@example.com',
    'Actual Attendance': 184,
    'Gross Ticket Revenue': 4500,
    'Settlement Notes': 'Flat $4,500 performance fee. Fifty percent deposit received. Final balance is due before the first set by ACH. Echo Play Live pays band and crew directly after the event.',
    'Show Recap': 'The reception stayed on schedule, the dance floor remained full through the final set, and the client specifically praised the quick transition from toasts into live music. The planner requested Echo Play Live information for two future referrals.',
    'Lessons Learned': 'Confirm the service-elevator dimensions during the advance. Add a dedicated cue owner for grand entrances and parent dances. Bring one additional 50-foot Edison cable for private-event rooms with split power.',
    'Show Notes': 'Three hours of music with two 15-minute breaks. Keep announcements concise and coordinate every formal moment with the planner.',
    'Sound Notes': 'Use compact sub placement and keep low-frequency energy controlled during dinner. Save the full dance-floor level for Set 2 onward.',
    'Merch Notes': 'No merch table for this private event.',
    'Document Source Updated': '2026-10-12T15:20:00.000Z',
  },
}

const bandRecords = [{
  id: 'recBand',
  fields: { 'Band Name': 'The Dick Beldings' },
}]

const venueRecord = {
  id: 'recVenue',
  fields: {
    'Venue Name': 'The Post at River East',
    Address: '2925 Race Street, Fort Worth, TX 76111',
    'Venue Type': 'Private Event Venue',
    'Age Restriction': 'All Ages',
    'Primary Contact Name': 'Morgan Lee',
    'Contact Phone': '(817) 555-0108',
    'Contact Email': 'events@examplevenue.com',
    Capacity: 250,
    'Stage Specs': '20 ft wide by 12 ft deep riser; 18-inch height; stairs on stage right.',
    'Parking Notes': 'Use the service lot behind the building. Trailer remains in the marked vendor space after load-in.',
    'Green Room': true,
    'House Console': 'Echo Play Live console package',
    'PA System': 'Compact powered system with two tops, two 18-inch subs, and two monitor mixes.',
    'FOH Location': 'Rear Center',
    'Power Drops': 'Two dedicated 20A circuits at stage left and one 20A circuit at FOH.',
    'Mic Locker': 'Echo Play Live microphone package.',
    'Sound Notes': 'Hard room with reflective glass. Keep the PA aimed down and avoid excessive stage volume.',
  },
}

const members = [
  ['recEvan', 'Evan Ranallo', 'Lead Vocals', '(817) 555-0101', 'evan@example.com'],
  ['recJames', 'James Harrah', 'Guitar / Vocals', '(817) 555-0102', 'james@example.com'],
  ['recKevin', 'Kevin Scott', 'Guitar / Vocals', '(817) 555-0103', 'kevin@example.com'],
  ['recKenny', 'Kenny Koulabouth', 'Bass / Vocals', '(817) 555-0104', 'kenny@example.com'],
  ['recJosh', 'Josh Miller', 'Drums', '(817) 555-0105', 'josh@example.com'],
].map(([id, name, role, phone, email]) => ({
  id,
  fields: {
    'Member Name': name,
    'Role - The Dick Beldings': role,
    Phone: phone,
    Email: email,
  },
}))

const crew = [
  {
    id: 'recEngineer',
    fields: {
      Name: 'Alex Morgan',
      Role: 'Audio Engineer',
      Phone: '(817) 555-0110',
      Email: 'alex@example.com',
      'Company / Vendor': 'Echo Play Live',
    },
  },
  {
    id: 'recMerch',
    fields: {
      Name: 'Jordan Reed',
      Role: 'Show Support',
      Phone: '(817) 555-0111',
      Email: 'jordan@example.com',
      'Company / Vendor': 'Echo Play Live',
    },
  },
]

const setlists = [
  { id: 'recSetOne', fields: { 'Set Name': 'Wedding Set 1', Duration: '60 min', Notes: 'Dinner-to-dance-floor build.' } },
  { id: 'recSetTwo', fields: { 'Set Name': 'Wedding Set 2', Duration: '60 min', Notes: 'Highest-energy dance set.' } },
  { id: 'recSetThree', fields: { 'Set Name': 'Wedding Set 3', Duration: '60 min', Notes: 'Requests, singalongs, and planned last song.' } },
]

const segment = (id, name, type, start, duration, order, details) => ({
  id,
  fields: {
    'Segment Name': name,
    Show: [showId],
    'Segment Type': type,
    'Start Time': start,
    'Duration Minutes': duration,
    Order: order,
    Details: details,
  },
})

const segments = [
  segment('seg01', 'Venue Load-In', 'Travel / Logistics', '2026-10-10T20:00:00.000Z', 120, 1, 'Use the rear service entrance. Protect finished floors and keep the public entrance clear.'),
  segment('seg02', 'Soundcheck', 'Production', '2026-10-10T22:00:00.000Z', 45, 2, 'Full line check, vocal check, playback verification, and formal-event cue test.'),
  segment('seg03', 'Vendor Meal', 'Wedding / Program', '2026-10-10T22:45:00.000Z', 30, 3, 'Band and crew meal in the green room.'),
  segment('seg04', 'Guest Arrival', 'Wedding / Program', '2026-10-10T23:00:00.000Z', 60, 4, 'Recorded cocktail playlist at conversational level.'),
  segment('seg05', 'Wedding Party Entrance', 'Wedding / Program', '2026-10-11T00:00:00.000Z', 15, 5, 'Planner cues each entrance. Engineer owns playback and microphones.'),
  segment('seg06', 'Set 1', 'Performance', '2026-10-11T00:15:00.000Z', 60, 6, 'Start with familiar 90s singalongs and build into dance material.'),
  segment('seg07', 'Toasts and Parent Dances', 'Wedding / Program', '2026-10-11T01:15:00.000Z', 30, 7, 'Wireless microphone at the sweetheart table. Planner cues each speaker and dance.'),
  segment('seg08', 'Set 2', 'Performance', '2026-10-11T01:45:00.000Z', 60, 8, 'Highest-energy set. Keep transitions tight and avoid long gaps.'),
  segment('seg09', 'Break', 'Break', '2026-10-11T02:45:00.000Z', 15, 9, 'Recorded playlist continues. Confirm final requests with the couple.'),
  segment('seg10', 'Set 3', 'Performance', '2026-10-11T03:00:00.000Z', 60, 10, 'Close with the requested final song at 10:55 PM.'),
  segment('seg11', 'Load-Out', 'Travel / Logistics', '2026-10-11T04:00:00.000Z', 60, 11, 'Quiet load-out through the service entrance. Final walk-through with venue contact.'),
]

const merchSales = [
  { id: 'sale1', fields: { Show: [showId], 'Quantity Sold': 0, 'Total Revenue': 0 } },
]

export const phase5FixtureModel = buildShowDocumentModel({
  showRecord,
  bandRecords,
  venueRecord,
  memberRecords: members,
  crewRecords: crew,
  segmentRecords: segments,
  setlistRecords: setlists,
  merchSalesRecords: merchSales,
})
