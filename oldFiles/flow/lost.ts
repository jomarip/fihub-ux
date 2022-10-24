let stations = [
  {
    id: 'track/LOST',
    position: { x: 95, y: 20 },
    data: { label: 'LOST Token Track' },
    width: 140,
    height: 40,
    bgColor: 'rgb(65 57 98)',
    textColor: 'white',
    borderColor: 'white',
  },
  {
    id: 'track/LOST/options/staking',
    position: { x: 50, y: 120 },
    data: { label: 'Staking' },
    width: 100,
    height: 40,
    bgColor: 'rgb(65 57 98)',
    textColor: 'white',
    borderColor: 'white',
  },
  {
    id: 'track/LOST/options/liquidity',
    position: { x: 180, y: 120 },
    data: { label: 'Liquidity' },
    width: 100,
    height: 40,
    bgColor: 'rgb(65 57 98)',
    textColor: 'white',
    borderColor: 'white',
  },
  {
    id: 'track/LOST/options/staking/lostworlds',
    position: { x: 10, y: 220 },
    data: { label: 'Lost Worlds' },
    width: 100,
    height: 40,
    bgColor: 'rgb(65 57 98)',
    textColor: 'white',
    borderColor: 'white',
  },
  {
    id: 'track/LOST/options/liquidity/traderjoe',
    position: { x: 125, y: 220 },
    data: { label: 'Trader joe' },
    width: 90,
    height: 40,
    bgColor: 'rgb(65 57 98)',
    textColor: 'white',
    borderColor: 'white',
  },
  {
    id: 'track/LOST/options/liquidity/pangolin',
    position: { x: 230, y: 220 },
    data: { label: 'Pangolin' },
    width: 90,
    height: 40,
    bgColor: 'rgb(65 57 98)',
    textColor: 'white',
    borderColor: 'white',
  },
  {
    id: 'track/LOST/options/liquidity/{exchange}/options/autocompound',
    position: { x: 110, y: 320 },
    data: { label: 'Autocompound' },
    width: 120,
    height: 40,
    bgColor: 'rgb(65 57 98)',
    textColor: 'white',
    borderColor: 'white',
  },
  {
    id: 'track/LOST/options/liquidity/{exchange}/options/farm',
    position: { x: 240, y: 320 },
    data: { label: 'Farm' },
    width: 80,
    height: 40,
    bgColor: 'rgb(65 57 98)',
    textColor: 'white',
    borderColor: 'white',
  },
  {
    id: 'track/LOST/options/liquidity/{exchange}/options/autocompound/snowball',
    position: { x: 180, y: 420 },
    data: { label: 'Snowball' },
    width: 100,
    height: 40,
    bgColor: 'rgb(65 57 98)',
    textColor: 'white',
    borderColor: 'white',
  },
  {
    id: 'track/LOST/options/liquidity/{exchange}/options/autocompound/yieldyak',
    position: { x: 50, y: 420 },
    data: { label: 'Yield Yak' },
    width: 100,
    height: 40,
    bgColor: 'rgb(65 57 98)',
    textColor: 'white',
    borderColor: 'white',
  },
];

let tracks: any[] = [
  {
    id: 'track/LOST/options',
    source: 'track/LOST',
    target: 'track/LOST/options/staking',
    arrow: true,
  },
  {
    id: 'track/LOST/options',
    source: 'track/LOST',
    target: 'track/LOST/options/liquidity',
    arrow: true,
  },
  {
    id: 'track/LOST/options/staking/lostworlds',
    source: 'track/LOST/options/staking',
    target: 'track/LOST/options/staking/lostworlds',
    arrow: true,
  },
  {
    id: 'track/LOST/options/liquidity',
    source: 'track/LOST/options/liquidity',
    target: 'track/LOST/options/liquidity/traderjoe',
    arrow: true,
  },
  {
    id: 'track/LOST/options/liquidity',
    source: 'track/LOST/options/liquidity',
    target: 'track/LOST/options/liquidity/pangolin',
    arrow: true,
  },
  {
    id: 'track/LOST/options/liquidity/traderjoe/options',
    source: 'track/LOST/options/liquidity/traderjoe',
    target: 'track/LOST/options/liquidity/{exchange}/options/autocompound',
    arrow: true,
  },
  {
    id: 'track/LOST/options/liquidity/traderjoe/options',
    source: 'track/LOST/options/liquidity/traderjoe',
    target: 'track/LOST/options/liquidity/{exchange}/options/farm',
    arrow: true,
  },
  {
    id: 'track/LOST/options/liquidity/pangolin/options',
    source: 'track/LOST/options/liquidity/pangolin',
    target: 'track/LOST/options/liquidity/{exchange}/options/autocompound',
    arrow: true,
  },
  {
    id: 'track/LOST/options/liquidity/pangolin/options',
    source: 'track/LOST/options/liquidity/pangolin',
    target: 'track/LOST/options/liquidity/{exchange}/options/farm',
    arrow: true,
  },
  {
    id: 'track/LOST/options/liquidity/{exchange}/options/autocompound',
    source: 'track/LOST/options/liquidity/{exchange}/options/autocompound',
    target: 'track/LOST/options/liquidity/{exchange}/options/autocompound/snowball',
    arrow: true,
  },
  {
    id: 'track/LOST/options/liquidity/{exchange}/options/autocompound',
    source: 'track/LOST/options/liquidity/{exchange}/options/autocompound',
    target: 'track/LOST/options/liquidity/{exchange}/options/autocompound/yieldyak',
    arrow: true,
  },
];

export const getStationsAndTracks = (route: string | null) => {
  // No route, return everything (but this shouldn't happen)
  if (!route) return { stations, tracks };
  stations = stations.map((station) => {
    // Check if current station, set active color
    if (
      // Check if station id is equal to the route, simple check
      station.id === route ||
      // Pages that are appended with options should als be checked if they match with the route
      // We probably want to fix this
      `${station.id}/options` === route ||
      // For routes/stations that are used that are the same, we combine them in one station for the flow diagram
      // to make it simpler to see for newcomers instead that we have duplication per exchange
      ((route.includes('farm') || route.includes('autocompound')) &&
        station.id === route.replace('pangolin', '{exchange}').replace('traderjoe', '{exchange}'))
    ) {
      station.bgColor = '#87DD64';
      station.textColor = '';
      station.borderColor = '';
    }
    // Or if passed station, set past color
    else if (
      route.includes(station.id) ||
      (route
        .replace('pangolin', '{exchange}')
        .replace('traderjoe', '{exchange}')
        .includes(station.id) &&
        station.id !== route &&
        `${station.id}/options` !== route)
    ) {
      station.bgColor = '#2a9baf';
      station.textColor = '';
      station.borderColor = '';
    }
    // in the case of going back, reset the previous station
    else {
      station.textColor = 'white';
      station.borderColor = 'white';
      station.bgColor = 'rgb(65 57 98)';
    }
    return station;
  });

  tracks = tracks.map((track) => {
    if (
      track.id === route ||
      track.id === route.replace('pangolin', '{exchange}').replace('traderjoe', '{exchange}')
    ) {
      track.type = 'bezier';
      track.animate = true;
    } else {
      track.type = '';
      track.animate = false;
    }
    return track;
  });
  return { stations, tracks };
};
