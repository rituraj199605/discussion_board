// src/electron.d.ts
interface ElectronAPI {
  tweetStorage: {
    getTweets: () => Promise<any[]>;
    saveTweets: (posts: any[]) => Promise<boolean>;
    deleteTweet: (postId: string) => Promise<any[]>;
    likePost: (postId: string, userId: string) => Promise<boolean>;
  };
  system: {
    version: string;
    platform: string;
  };
  app: {
    version: string;
    name: string;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};