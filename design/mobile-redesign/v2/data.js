/* Sample content for the prototype only. Never ships. */
window.DATA = (function () {
  const base = [
    { id: 1041, area: 'Ground floor washroom', title: 'Morning deep clean', from: '9:30 AM', to: '11:00 AM', note: 'Use the blue bucket for this floor. Refill soap and tissue.' },
    { id: 1042, area: 'Lobby and reception', title: 'Floor mop and glass doors', from: '11:00 AM', to: '12:00 PM', note: '' },
    { id: 1043, area: 'First floor pantry', title: 'Counter and sink', from: '12:30 PM', to: '1:30 PM', note: '' },
    { id: 1044, area: 'Wudu area', title: 'Floor and taps', from: '2:00 PM', to: '3:00 PM', note: 'Finish before Asr prayer.' },
    { id: 1045, area: 'Second floor washroom', title: 'Afternoon clean', from: '3:00 PM', to: '4:30 PM', note: '' },
  ];
  const sets = {
    fresh: ['todo', 'todo', 'todo', 'todo', 'todo'],
    morning: ['rev', 'todo', 'todo', 'todo', 'todo'],
    cleaning: ['rev', 'doing', 'todo', 'todo', 'todo'],
    photos: ['ver', 'photos', 'todo', 'todo', 'todo'],
    retake: ['ver', 'retake', 'todo', 'todo', 'todo'],
    overdue: ['ver', 'overdue', 'todo', 'todo', 'todo'],
    all: ['ver', 'ver', 'rev', 'rev', 'rev'],
    none: [],
  };
  const presets = {
    early: { label: 'Before check-in opens', att: 'before', now: '8:20 AM', tasks: 'fresh' },
    ready: { label: 'Ready to check in', att: 'open', now: '8:52 AM', tasks: 'fresh' },
    late: { label: 'Late check-in', att: 'late', now: '9:24 AM', tasks: 'fresh' },
    next: { label: 'On shift, next task', att: 'in', now: '10:05 AM', tasks: 'morning' },
    cleaning: { label: 'Cleaning in progress', att: 'in', now: '11:20 AM', tasks: 'cleaning' },
    retake: { label: 'A photo needs retaking', att: 'in', now: '11:40 AM', tasks: 'retake' },
    overdue: { label: 'Task is overdue', att: 'in', now: '12:20 PM', tasks: 'overdue' },
    unavailable: { label: 'Task photos unavailable', att: 'in', now: '11:20 AM', tasks: 'cleaning', photosOff: true },
    done: { label: 'All work submitted', att: 'in', now: '3:40 PM', tasks: 'all' },
    out: { label: 'Time to check out', att: 'canOut', now: '5:02 PM', tasks: 'all' },
    finished: { label: 'Shift finished', att: 'out', now: '5:06 PM', tasks: 'all' },
    missed: { label: 'Missed check-out', att: 'missed', now: '7:30 PM', tasks: 'all' },
    closed: { label: 'Shift time closed', att: 'closed', now: '6:10 PM', tasks: 'fresh' },
    notasks: { label: 'No tasks today', att: 'in', now: '10:05 AM', tasks: 'none' },
    noshift: { label: 'No shift loaded', att: 'noshift', now: '10:05 AM', tasks: 'none' },
    noloc: { label: 'No location assigned', att: 'noloc', now: '10:05 AM', tasks: 'none' },
  };
  const photos = [
    { key: 'e', fx: 'door', name: 'Room entrance', view: 'From the door', ins: 'Stand at the door. Show the whole room.' },
    { key: 't1', fx: 'toilet', name: 'Toilet', view: 'Front view', ins: 'Show the whole bowl and seat from the front.' },
    { key: 't2', fx: 'toilet', name: 'Toilet', view: 'Close view', ins: 'Move closer. Show inside the bowl.' },
    { key: 's1', fx: 'sink', name: 'Sink', view: 'Front view', ins: 'Show the basin and the tap together.' },
    { key: 'm1', fx: 'mirror', name: 'Mirror', view: 'From one side', ins: 'Stand to one side. Keep people out of the mirror.' },
    { key: 'f1', fx: 'floor', name: 'Floor', view: 'From the corner', ins: 'Stand in the corner. Show the whole floor.' },
    { key: 'b1', fx: 'bin', name: 'Bin', view: 'Inside', ins: 'Show that the bin is empty.' },
  ];
  const history = [
    { day: 'Today', date: '10 Nov', items: [
      { id: 2001, area: 'Ground floor washroom', title: 'Morning deep clean', from: '9:30 AM', to: '11:00 AM', st: 'ver', started: '9:42 AM', sent: '10:21 AM', by: '12:05 PM', photos: '7 of 7' },
    ] },
    { day: 'Yesterday', date: '9 Nov', items: [
      { id: 1996, area: 'Second floor washroom', title: 'Afternoon clean', from: '3:00 PM', to: '4:30 PM', st: 'rev', started: '3:11 PM', sent: '3:58 PM', photos: '7 of 7' },
      { id: 1995, area: 'Wudu area', title: 'Floor and taps', from: '2:00 PM', to: '3:00 PM', st: 'ver', started: '2:04 PM', sent: '2:37 PM', by: '4:15 PM', photos: '4 of 4' },
      { id: 1994, area: 'First floor pantry', title: 'Counter and sink', from: '12:30 PM', to: '1:30 PM', st: 'exc', started: '12:48 PM', sent: '1:26 PM', by: '3:02 PM', photos: '4 of 5' },
      { id: 1993, area: 'Lobby and reception', title: 'Floor mop and glass doors', from: '11:00 AM', to: '12:00 PM', st: 'ver', started: '11:03 AM', sent: '11:49 AM', by: '1:40 PM', photos: '3 of 3' },
    ] },
    { day: 'Saturday', date: '7 Nov', items: [
      { id: 1981, area: 'Ground floor washroom', title: 'Morning deep clean', from: '9:30 AM', to: '11:00 AM', st: 'ver', started: '9:35 AM', sent: '10:30 AM', by: '11:50 AM', photos: '7 of 7' },
      { id: 1980, area: 'Lobby and reception', title: 'Floor mop and glass doors', from: '11:00 AM', to: '12:00 PM', st: 'missed', photos: '0 of 3' },
      { id: 1979, area: 'Wudu area', title: 'Floor and taps', from: '2:00 PM', to: '3:00 PM', st: 'ver', started: '2:02 PM', sent: '2:44 PM', by: '5:10 PM', photos: '4 of 4' },
    ] },
    { day: 'Friday', date: '6 Nov', items: [
      { id: 1972, area: 'Second floor washroom', title: 'Afternoon clean', from: '3:00 PM', to: '4:30 PM', st: 'ver', started: '3:05 PM', sent: '3:52 PM', by: '5:01 PM', photos: '7 of 7' },
    ] },
  ];
  /* d: day of month. s: on | late | absent | missed | off | future */
  const nov = { title: 'November 2026', lead: 6, days: ['off', 'on', 'on', 'late', 'on', 'on', 'on', 'off', 'on', 'today'] };
  const oct = { title: 'October 2026', lead: 3, days: ['on','on','on','off','on','on','on','late','on','on','off','on','on','on','on','absent','on','off','on','late','on','on','on','on','off','on','on','missed','on','on','on'] };
  const attendance = [
    { day: 'Today', date: '10 Nov', in: '8:58 AM', out: null, st: 'on' },
    { day: 'Yesterday', date: '9 Nov', in: '8:54 AM', out: '5:04 PM', st: 'on' },
    { day: 'Saturday', date: '7 Nov', in: '8:59 AM', out: '5:01 PM', st: 'on' },
    { day: 'Friday', date: '6 Nov', in: '8:56 AM', out: '5:12 PM', st: 'on' },
    { day: 'Thursday', date: '5 Nov', in: '8:57 AM', out: '5:02 PM', st: 'on' },
    { day: 'Wednesday', date: '4 Nov', in: '9:21 AM', out: '5:05 PM', st: 'late', lateBy: '21' },
    { day: 'Tuesday', date: '3 Nov', in: '8:55 AM', out: '5:03 PM', st: 'on' },
    { day: 'Monday', date: '2 Nov', in: '8:53 AM', out: '5:00 PM', st: 'on' },
  ];
  const me = { first: 'Nasreen', name: 'Nasreen Akhtar', phone: '+92 300 1234567', email: 'nasreen@gulbergservices.pk', company: 'Gulberg Facility Services', location: 'Gulberg Plaza, Lahore', shift: ['9:00 AM', '5:00 PM'], manager: 'Imran Sheikh', since: 'March 2025', id: '1187' };
  return { base, sets, presets, photos, history, nov, oct, attendance, me };
})();
