import type { ContentItem } from './types';

export const MOCK_GENRES = [
  { id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' },
  { id: 878, name: 'Sci-Fi' }, { id: 53, name: 'Thriller' }, { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' }, { id: 16, name: 'Animation' }, { id: 99, name: 'Documentary' },
  { id: 14, name: 'Fantasy' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10759, name: 'Action & Adventure' }, { id: 80, name: 'Crime' }, { id: 9648, name: 'Mystery' }
];

export const MOCK_CONTENT: ContentItem[] = [
  // Blockbuster & Global Hits
  { id: 157336, title: 'Interstellar', releaseYear: '2014', rating: 8.4, voteCount: 34521, mediaType: 'movie', genreIds: [878, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK1DVfjko.jpg', overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole.', providers: [{name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] },
  { id: 299534, title: 'Avengers: Endgame', releaseYear: '2019', rating: 8.3, voteCount: 24500, mediaType: 'movie', genreIds: [28, 12, 878], posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg', overview: 'After the devastating events of Infinity War, the universe is in ruins.', providers: [{name:'Disney+', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}, {name:'Hotstar', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}] },
  { id: 19995, title: 'Avatar', releaseYear: '2009', rating: 7.9, voteCount: 31000, mediaType: 'movie', genreIds: [28, 12, 14, 878], posterUrl: 'https://image.tmdb.org/t/p/w500/kyeqWdyKINLSywicWSXb3950mL.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/vL5LR6WdxWPjUUvGvT48hBbsK7s.jpg', overview: 'In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora.', providers: [{name:'Disney+', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}, {name:'Hotstar', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}] },
  { id: 550, title: 'Fight Club', releaseYear: '1999', rating: 8.4, voteCount: 28034, mediaType: 'movie', genreIds: [18, 53], posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/hZkgoQYus5dXo3H8T7CYV18sAor.jpg', overview: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.', providers: [{name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] },
  { id: 693134, title: 'Dune: Part Two', releaseYear: '2024', rating: 8.2, voteCount: 8100, mediaType: 'movie', genreIds: [878, 12], posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg', overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen.', providers: [{name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] },
  { id: 572802, title: 'Aquaman and the Lost Kingdom', releaseYear: '2023', rating: 6.3, voteCount: 3800, mediaType: 'movie', genreIds: [28, 14], posterUrl: 'https://image.tmdb.org/t/p/w500/7lTnXOy0iNtBAd2Rvax5tgqjJlN.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/cnqwv5Uz3UW5f086IWbQKr3yyJz.jpg', overview: 'Black Manta seeks revenge on Aquaman for the death of his father.', providers: [{name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] },
  
  // Indian Cinema (Hotstar, Prime, Netflix)
  { id: 256040, title: 'Baahubali: The Beginning', releaseYear: '2015', rating: 7.5, voteCount: 5000, mediaType: 'movie', genreIds: [28, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/91s6DxoHWivTUMqAECq8hA98Fjb.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/91s6DxoHWivTUMqAECq8hA98Fjb.jpg', overview: 'A young man learns of his royal heritage and seeks to rescue a former queen.', providers: [{name:'Hotstar', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}, {name:'Netflix', logoUrl: 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg'}] },
  { id: 350312, title: 'Baahubali 2: The Conclusion', releaseYear: '2017', rating: 7.9, voteCount: 6000, mediaType: 'movie', genreIds: [28, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/21sC2assImQIycEDA84Qh9d1RsK.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/21sC2assImQIycEDA84Qh9d1RsK.jpg', overview: 'The epic conclusion of the Baahubali saga.', providers: [{name:'Hotstar', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}, {name:'Netflix', logoUrl: 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg'}] },
  { id: 579974, title: 'RRR', releaseYear: '2022', rating: 7.9, voteCount: 12000, mediaType: 'movie', genreIds: [28, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0yeO1WMe6.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/7u1H61HqBOn8VNTyW9F56z7Z3bN.jpg', overview: 'A fictitious story about two legendary revolutionaries and their journey away from home.', providers: [{name:'Netflix', logoUrl: 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg'}, {name:'Hotstar', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}] },
  { id: 784606, title: 'K.G.F: Chapter 2', releaseYear: '2022', rating: 7.3, voteCount: 4000, mediaType: 'movie', genreIds: [28, 80], posterUrl: 'https://image.tmdb.org/t/p/w500/bXrZ5iGlPq7rwcnBgP7O2hB1iB4.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/1K12O1K.jpg', overview: 'The blood-soaked land of Kolar Gold Fields has a new overlord now, Rocky.', providers: [{name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] },
  { id: 811656, title: 'Pushpa: The Rise', releaseYear: '2021', rating: 7.2, voteCount: 3000, mediaType: 'movie', genreIds: [28, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/r1y0RFIWBBV7z2q07P9jEps8vM.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/r1y0RFIWBBV7z2q07P9jEps8vM.jpg', overview: 'A laborer rises through the ranks of a red sandalwood smuggling syndicate.', providers: [{name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] },
  { id: 554600, title: 'Uri: The Surgical Strike', releaseYear: '2019', rating: 7.3, voteCount: 2500, mediaType: 'movie', genreIds: [28, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/yA2Rgg0sD5K2Vw1K4dJjM0F5o5e.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/yA2Rgg0sD5K2Vw1K4dJjM0F5o5e.jpg', overview: 'Based on the true events of the 2016 Uri attack.', providers: [] },
  
  // High-Quality TV Series
  { id: 1396, title: 'Breaking Bad', releaseYear: '2008', rating: 8.9, voteCount: 13500, mediaType: 'tv', genreIds: [18, 80], posterUrl: 'https://image.tmdb.org/t/p/w500/ztkgnFjNqU0y4uR9YQ9C7Q26sC1.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', overview: 'A chemistry teacher diagnosed with cancer becomes a methamphetamine kingpin.', providers: [{name:'Netflix', logoUrl: 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg'}] },
  { id: 1399, title: 'Game of Thrones', releaseYear: '2011', rating: 8.4, voteCount: 22100, mediaType: 'tv', genreIds: [10765, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/1XSx0LEiDq2v49a183H1lP4J96B.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg', overview: 'Nine noble families fight for control over the mythical lands of Westeros.', providers: [{name:'Hotstar', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}, {name:'HBO', logoUrl: 'https://image.tmdb.org/t/p/w92/tuomPhY2UtuPTqqFnKMVHvZ1n9m.png'}] },
  { id: 66732, title: 'Stranger Things', releaseYear: '2016', rating: 8.6, voteCount: 17800, mediaType: 'tv', genreIds: [10765, 9648], posterUrl: 'https://image.tmdb.org/t/p/w500/49WJEVy0aP2xcJNTm1g97PjJq8y.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/56v2KjBlYj4fOhLEnDAJZRLoAVb.jpg', overview: 'A young boy vanishes and a small town uncovers a mystery involving supernatural forces.', providers: [{name:'Netflix', logoUrl: 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg'}] },
  { id: 2316, title: 'The Office', releaseYear: '2005', rating: 8.6, voteCount: 9800, mediaType: 'tv', genreIds: [35], posterUrl: 'https://image.tmdb.org/t/p/w500/qrvCbw6OejJ8X1wWw6C9vAgbG6R.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/2t71s2gX3jQ0y4H9mNnQkG7y3t.jpg', overview: 'A mockumentary on a group of typical office workers.', providers: [{name:'Netflix', logoUrl: 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg'}, {name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] },
  { id: 1668, title: 'Friends', releaseYear: '1994', rating: 8.5, voteCount: 10500, mediaType: 'tv', genreIds: [35], posterUrl: 'https://image.tmdb.org/t/p/w500/f496cm9enuEsZgSPzCwnTICQR53.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/qdIMHd4sEfJSckfVJfKQvisL02a.jpg', overview: 'Six young people navigate their personal and professional lives in Manhattan.', providers: [{name:'Netflix', logoUrl: 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg'}] },
  { id: 76479, title: 'The Boys', releaseYear: '2019', rating: 8.5, voteCount: 10200, mediaType: 'tv', genreIds: [10765, 10759], posterUrl: 'https://image.tmdb.org/t/p/w500/7Ns7Jzw61VfeasjTxJ1nU4a4jrz.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/7q448EVOnuE3gVAx24krzO7SNXM.jpg', overview: 'Vigilantes set out to take down corrupt superheroes.', providers: [{name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] },
  { id: 114461, title: 'Ahsoka', releaseYear: '2023', rating: 7.4, voteCount: 2800, mediaType: 'tv', genreIds: [10765, 10759], posterUrl: 'https://image.tmdb.org/t/p/w500/laCJxobHoPVaIMToJhkqYuXdPWV.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/kUaFsOFtfCN3Jk2yP9GLnVr1CxI.jpg', overview: 'Ahsoka Tano investigates an emerging threat to a vulnerable galaxy.', providers: [{name:'Disney+', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}, {name:'Hotstar', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}] },
  { id: 93405, title: 'Squid Game', releaseYear: '2021', rating: 7.8, voteCount: 14200, mediaType: 'tv', genreIds: [10759, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/dDlE9Z32kX3hOaO040pA92l7Wf7.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg', overview: 'Players accept a strange invitation to compete in deadly children\'s games.', providers: [{name:'Netflix', logoUrl: 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg'}] },
  { id: 82856, title: 'The Mandalorian', releaseYear: '2019', rating: 8.4, voteCount: 9200, mediaType: 'tv', genreIds: [10765, 10759], posterUrl: 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', overview: 'A lone gunfighter makes his way through the outer reaches of the galaxy.', providers: [{name:'Disney+', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}, {name:'Hotstar', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}] },
  { id: 84958, title: 'Loki', releaseYear: '2021', rating: 8.2, voteCount: 11200, mediaType: 'tv', genreIds: [10765, 10759], posterUrl: 'https://image.tmdb.org/t/p/w500/voHUmluYmKyleFkTu3lOXQG702u.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/voHUmluYmKyleFkTu3lOXQG702u.jpg', overview: 'The mercurial villain Loki resumes his role as the God of Mischief.', providers: [{name:'Disney+', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}, {name:'Hotstar', logoUrl: 'https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg'}] },
  
  // Indian Web Series
  { id: 82068, title: 'Mirzapur', releaseYear: '2018', rating: 8.2, voteCount: 2200, mediaType: 'tv', genreIds: [80, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/n9T8LTVyU4g0M2e2L08zB3fW9B.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/n9T8LTVyU4g0M2e2L08zB3fW9B.jpg', overview: 'A shocking incident at a wedding procession ignites a series of events entangling the lives of two families in Mirzapur.', providers: [{name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] },
  { id: 92446, title: 'The Family Man', releaseYear: '2019', rating: 8.2, voteCount: 1800, mediaType: 'tv', genreIds: [80, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/tkj4Z25fD4xWd9C4q5i6R26w90g.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/tkj4Z25fD4xWd9C4q5i6R26w90g.jpg', overview: 'A working man from the National Investigation Agency tries to protect the nation from terrorism.', providers: [{name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] },
  { id: 80894, title: 'Sacred Games', releaseYear: '2018', rating: 8.0, voteCount: 1400, mediaType: 'tv', genreIds: [80, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/hGqRpsgP3eB4G9hWn9X9p3p5E6B.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/hGqRpsgP3eB4G9hWn9X9p3p5E6B.jpg', overview: 'A link in their pasts leads an honest cop to a fugitive gang boss.', providers: [{name:'Netflix', logoUrl: 'https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg'}] },
  { id: 104770, title: 'Scam 1992: The Harshad Mehta Story', releaseYear: '2020', rating: 8.5, voteCount: 1100, mediaType: 'tv', genreIds: [18, 80], posterUrl: 'https://image.tmdb.org/t/p/w500/jN4s0KzP8WjP5n3O0XfWw2r2U0X.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/jN4s0KzP8WjP5n3O0XfWw2r2U0X.jpg', overview: 'Set in 1980\'s and 90\'s Bombay, it follows the life of Harshad Mehta, a stockbroker who took the stock market to dizzying heights.', providers: [] },
  { id: 98114, title: 'Panchayat', releaseYear: '2020', rating: 8.3, voteCount: 1200, mediaType: 'tv', genreIds: [35, 18], posterUrl: 'https://image.tmdb.org/t/p/w500/mD1lH8H8bV5pW4f6O0v1J2u2b0N.jpg', backdropUrl: 'https://image.tmdb.org/t/p/w1280/mD1lH8H8bV5pW4f6O0v1J2u2b0N.jpg', overview: 'A comedy-drama, which captures the journey of an engineering graduate who joins as secretary of a Panchayat office in a remote village.', providers: [{name:'Prime Video', logoUrl: 'https://image.tmdb.org/t/p/w92/emthp39XA2YScoYL1p0sdbAH2WA.jpg'}] }
];

export function seededRandom(seed: string) {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function getMockContent(mediaType: 'movie' | 'tv' | 'all', genreId?: number, shuffleSeed?: string) {
  let filtered = MOCK_CONTENT;
  if (mediaType !== 'all') {
    filtered = filtered.filter((m) => m.mediaType === mediaType);
  }
  if (genreId) {
    filtered = filtered.filter((m) => m.genreIds.includes(genreId));
  }
  
  if (shuffleSeed) {
    const rng = seededRandom(shuffleSeed);
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  return filtered;
}
